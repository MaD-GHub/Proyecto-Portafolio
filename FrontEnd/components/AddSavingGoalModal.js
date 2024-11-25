import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from "react-native";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const AddSavingGoalModal = ({ visible, onClose, onSave }) => {
  const [amount, setAmount] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [subCategories, setSubCategories] = useState([]);

  // Obtener subcategorías desde la colección "categoriasAhorro"
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categoriasAhorro"));
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubCategories(fetchedCategories);
      } catch (error) {
        console.error("Error al cargar categorías de ahorro:", error.message);
        alert(
          "Hubo un problema al cargar las categorías. Inténtalo nuevamente."
        );
      }
    };
    fetchSubCategories();
  }, []);

  // Cerrar el modal y resetear el formulario
  const closeModal = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setSubCategoryName("");
    setDescription("");
    setInstallmentCount(1);
    setDate(new Date());
  };

  // Manejar la creación de una meta de ahorro con la estructura correcta
  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }

    if (!subCategoryName) {
      alert("Por favor seleccione una categoría válida.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Por favor inicie sesión.");
      return;
    }

    const newTransaction = {
      type: "Gasto", // Categoría principal para identificar ahorros
      categoryName: "Ahorro", // Siempre será "Ahorro"
      subCategoryName, // Subcategoría seleccionada (e.g., "Meta Personal")
      amount: parsedAmount,
      description: description || "Sin descripción",
      selectedDate: date.toISOString(),
      installmentStartDate: date.toISOString(), // Igual que la fecha seleccionada
      creationDate: new Date().toISOString(),
      userId: user.uid,
      installmentCount,
      isFixed: "Cuotas", // Siempre "Cuotas"
      isRecurrent: false, // Siempre false
    };

    try {
      await addDoc(collection(db, "transactions"), newTransaction);
      onSave(); // Actualiza la lista de ahorros
      closeModal();
    } catch (error) {
      console.error("Error al añadir transacción:", error);
      alert("Hubo un error al guardar la transacción. Intenta nuevamente.");
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Nuevo Ahorro</Text>

          {/* Campo de monto */}
          <TextInput
            placeholder="Ingrese monto"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            style={styles.inputBox}
          />

          {/* Picker de subcategorías */}
          <View style={styles.inputBox}>
            {subCategories.length > 0 ? (
              <Picker
                selectedValue={subCategoryName}
                onValueChange={(itemValue) => setSubCategoryName(itemValue)}
                style={styles.picker}
                dropdownIconColor="#673ab7"
              >
                <Picker.Item label="Seleccione una categoría" value="" />
                {subCategories.map((subCategory) => (
                  <Picker.Item
                    key={subCategory.id}
                    label={subCategory.nombre}
                    value={subCategory.nombre}
                  />
                ))}
              </Picker>
            ) : (
              <Text style={styles.loadingText}>
                Cargando categorías de ahorro...
              </Text>
            )}
          </View>

          {/* Selector de cuotas */}
          <View style={styles.inputBox}>
            <Picker
              selectedValue={installmentCount}
              onValueChange={(itemValue) => setInstallmentCount(itemValue)}
              style={styles.picker}
              dropdownIconColor="#673ab7"
            >
              {[...Array(24).keys()].map((i) => (
                <Picker.Item
                  key={i + 1}
                  label={`${i + 1} Meses`}
                  value={i + 1}
                />
              ))}
            </Picker>
          </View>

          {/* Campo de descripción */}
          <TextInput
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            style={styles.inputBox}
          />

          {/* Selector de fecha */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <MaterialCommunityIcons name="calendar" size={24} color="#673ab7" />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Botón de confirmar */}
          <LinearGradient colors={["#511496", "#885FD8"]} style={styles.confirmButton}>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#673ab7",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673ab7",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputBox: {
    backgroundColor: "#f5f5f5",
    height: 50,
    paddingLeft: 15,
    borderRadius: 25,
    marginBottom: 15,
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    color: "#555",
  },
  loadingText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  dateText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 25,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 15,
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddSavingGoalModal;
