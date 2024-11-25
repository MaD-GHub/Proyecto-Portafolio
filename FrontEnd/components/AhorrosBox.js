import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";

// Colores por categoría
const categoryColors = {
  educación: "#FFC107", // Amarillo
  vacaciones: "#4CAF50", // Verde
  coche: "#2196F3", // Azul
  casa: "#9C27B0", // Morado
  tecnología: "#6A5ACD", // Azul oscuro
  emergencia: "#FF6347", // Rojo
  "meta personal": "#8E44AD", // Púrpura
  default: "#673ab7", // Predeterminado
};

// Íconos por categoría
const categoryIcons = {
  educación: { icon: "book", library: Feather }, // Ícono de Feather
  vacaciones: { icon: "plane", library: FontAwesome },
  coche: { icon: "car", library: FontAwesome },
  casa: { icon: "home", library: FontAwesome },
  tecnología: { icon: "mobile-phone", library: FontAwesome },
  emergencia: { icon: "shield-alert", library: MaterialCommunityIcons }, // Emergencia
  "meta personal": { icon: "weight", library: MaterialCommunityIcons }, // Meta Personal
  default: { icon: "piggy-bank", library: FontAwesome },
};

const SavingGoalItem = ({ item, onEdit, onDelete }) => {
  const { subCategoryName, amount, description, installmentCount } = item;
  const categoryColor = categoryColors[subCategoryName?.toLowerCase()] || categoryColors.default;
  const { icon, library: IconLibrary } = categoryIcons[subCategoryName?.toLowerCase()] || categoryIcons.default;

  return (
    <View style={[styles.goalContainer, { backgroundColor: categoryColor }]}>
      <View style={styles.iconContainer}>
        <IconLibrary name={icon} size={24} color="#FFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.goalTitle}>Ahorro - {subCategoryName || "Sin Subcategoría"}</Text>
        <Text style={styles.goalDescription}>{description || "Sin descripción"}</Text>
        <Text style={styles.goalAmount}>
          <Text style={styles.dollarSign}>$</Text>
          {amount.toLocaleString()} en {installmentCount} cuota
          {installmentCount > 1 ? "s" : ""}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Feather name="trash" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AhorrosBox = ({ onBalanceUpdate }) => {
  const [savingGoals, setSavingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [newDescription, setNewDescription] = useState("");

  const fetchSavingGoals = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Por favor, inicia sesión.");
        return;
      }

      const querySnapshot = await getDocs(collection(db, "transactions"));
      const savings = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.categoryName?.toLowerCase() === "ahorro");

      setSavingGoals(savings);

      const totalSavings = savings.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      onBalanceUpdate(totalSavings);
    } catch (error) {
      console.error("Error al cargar las metas de ahorro:", error);
      alert("No se pudieron cargar las metas de ahorro.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setCurrentGoal(goal);
    setNewDescription(goal.description);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!currentGoal) return;

    try {
      const goalRef = doc(db, "transactions", currentGoal.id);
      await updateDoc(goalRef, { description: newDescription });

      alert("Descripción actualizada correctamente.");
      fetchSavingGoals();
    } catch (error) {
      console.error("Error al actualizar la meta:", error);
      alert("No se pudo actualizar la meta.");
    } finally {
      setModalVisible(false);
    }
  };

  const handleDelete = (goalId) => {
    Alert.alert(
      "Eliminar Meta",
      "¿Estás seguro de que deseas eliminar esta meta de ahorro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const goalRef = doc(db, "transactions", goalId);
              await deleteDoc(goalRef);

              alert("Meta de ahorro eliminada correctamente.");
              fetchSavingGoals();
            } catch (error) {
              console.error("Error al eliminar la meta:", error);
              alert("No se pudo eliminar la meta.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#673ab7" />
      </View>
    );
  }

  if (savingGoals.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No hay metas de ahorro registradas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savingGoals}
        renderItem={({ item }) => (
          <SavingGoalItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal para editar la descripción */}
      {currentGoal && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Descripción</Text>
              <TextInput
                style={styles.modalInput}
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Nueva descripción"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleUpdate}>
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#555",
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 5,
  },
  goalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF", // Fuente BOLD para el signo $
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#673ab7",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AhorrosBox;
