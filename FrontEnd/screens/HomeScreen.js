// HomeScreen.js
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import Balance from "../components/Balance";
import Timeline from "../components/Timeline";
import FilteredTransactionHistory from "../components/FilteredTransactionHistory";

// Función para formatear a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFixed, setEditFixed] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const heightAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // Obtener transacciones desde Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transacciones = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transacciones);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteTransaction = async (id) => {
    Alert.alert(
      "Eliminar transacción",
      "¿Estás seguro de que quieres eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "transactions", id));
              setTransactions((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error("Error al eliminar transacción:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    try {
      const transactionRef = doc(db, "transactions", editingTransaction.id);
      await updateDoc(transactionRef, {
        amount: editAmount,
        category: editCategory,
        description: editDescription,
        isFixed: editFixed,
      });

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingTransaction.id
            ? { ...item, amount: editAmount, category: editCategory, description: editDescription, isFixed: editFixed }
            : item
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar transacción:", error);
    }
  };

  const toggleLabel = () => {
    setIsOpen(!isOpen);
    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#511496", "#885fd8"]} style={styles.balanceContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
              <MaterialCommunityIcons name="account" size={35} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SimulacionScreen")} style={styles.bellIconContainer}>
              <MaterialCommunityIcons name="play" size={35} color="white" />
            </TouchableOpacity>
          </View>

          {/* Componente de Balance */}
          <Balance transactions={transactions} />

          <TouchableOpacity onPress={toggleLabel} style={styles.chevronContainer}>
            <View style={styles.chevronLine} />
            <MaterialCommunityIcons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={24}
              color="white"
              style={styles.chevronIcon}
            />
            <View style={styles.chevronLine} />
          </TouchableOpacity>

          <Animated.View style={[styles.labelContainer, { height: heightAnim }]}>
            <LinearGradient colors={["#cb70e1", "#885fd8"]} style={styles.labelGradient}>
              <View style={styles.labelContent}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Ingresos</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(transactions.filter((trans) => trans.type === "Ingreso").reduce((total, trans) => total + parseFloat(trans.amount), 0))}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Gastos</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(transactions.filter((trans) => trans.type === "Gasto").reduce((total, trans) => total + parseFloat(trans.amount), 0))}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </LinearGradient>

        <Timeline transactions={transactions} />

        {/* Componente de Historial de Transacciones */}
        <FilteredTransactionHistory
          transactions={transactions}
          onEdit={(transaction) => {
            setEditingTransaction(transaction);
            setEditAmount(transaction.amount.toString());
            setEditCategory(transaction.category);
            setEditDescription(transaction.description);
            setEditFixed(transaction.isFixed);
            setModalVisible(true);
          }}
          onDelete={handleDeleteTransaction}
        />

        {/* Modal de Edición */}
        <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Editar Transacción</Text>
              <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" placeholder="Monto" />
              <TextInput style={styles.input} value={editCategory} onChangeText={setEditCategory} placeholder="Categoría" />
              <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription} placeholder="Descripción (opcional)" />
              <TextInput style={styles.input} value={editFixed} onChangeText={setEditFixed} placeholder="Tipo (Fijo o Variable)" />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.smallButtonSave} onPress={handleSaveEdit}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButtonCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos aquí...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 20, // Añade algo de espacio en la parte inferior para el scroll
  },
  balanceContainer: {
    padding: 20,
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  bellIconContainer: {
    position: "relative",
  },
  chevronContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  chevronLine: {
    height: 1,
    backgroundColor: "black",
    width: 80,
  },
  chevronIcon: {
    marginHorizontal: 10,
  },
  labelContainer: {
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  labelGradient: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
  },
  labelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  totalItem: {
    alignItems: "center",
    width: "50%",
  },
  totalLabel: {
    fontSize: 16,
    color: "white",
  },
  totalAmount: {
    fontSize: 24,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  smallButtonSave: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  smallButtonCancel: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
