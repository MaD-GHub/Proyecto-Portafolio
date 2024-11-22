import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Animated,
} from "react-native";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const AddSavingGoalModal = ({ visible, onClose, onSave }) => {
  const [slideAnim] = useState(new Animated.Value(600));
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1); // Cuotas por defecto: 1
  const [subCategories, setSubCategories] = useState([]);

  // Obtener categorías de ahorro
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
      alert("Hubo un problema al cargar las categorías. Inténtalo nuevamente.");
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      resetForm();
    });
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDescription("");
    setInstallmentCount(1);
    setDate(new Date());
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }

    if (!category) {
      alert("Por favor seleccione una categoría válida.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Por favor inicie sesión.");
      return;
    }

    const newTransaction = {
      type: "Gasto",
      amount: parsedAmount,
      categoryName: category,
      description: description || "",
      isFixed: "Cuotas",
      isRecurrent: false,
      selectedDate: date.toISOString(),
      creationDate: new Date().toISOString(),
      userId: user.uid,
      installmentCount: installmentCount, // Número de cuotas
      installmentStartDate: date.toISOString(),
    };

    try {
      await addDoc(collection(db, "transactions"), newTransaction);
      onSave(); // Llama a la función `onSave` pasada como prop
      closeModal();
    } catch (error) {
      console.error("Error al añadir transacción:", error);
      alert("Hubo un error al guardar la transacción. Intenta nuevamente.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Título */}
          <Text style={styles.modalTitle}>Nueva Meta de Ahorro</Text>

          {/* Campo de monto */}
          <TextInput
            placeholder="Ingrese monto"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            style={styles.inputBox}
          />

          {/* Picker de Categorías de Ahorro */}
          <View style={styles.inputBox}>
            {subCategories.length > 0 ? (
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
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
            >
              {[...Array(24).keys()].map((i) => (
                <Picker.Item
                  key={i + 1}
                  label={`${i + 1} cuotas`}
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
            <MaterialCommunityIcons name="calendar" size={24} color="#511496" />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Botón de Confirmar */}
          <LinearGradient
            colors={["#511496", "#885FD8"]}
            style={styles.pickerContainer}
          >
            <TouchableOpacity onPress={handleSave} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9f9f9",
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    addButton: {
      backgroundColor: "#673ab7", // Color púrpura
      justifyContent: "center",
      alignItems: "center",
      width: 60, // Tamaño ajustado
      height: 60,
      borderRadius: 30, // Botón circular
      position: "absolute",
      bottom: 25, // Posicionado en la parte inferior
      right: 20, // Separado del borde derecho
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 10, // Elevación para Android
    },
    addButtonText: {
      fontSize: 32, // Texto más grande
      color: "#fff",
      fontWeight: "bold",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro translúcido
      justifyContent: "flex-end", // Modal en la parte inferior
    },
    modalContainer: {
      width: "100%", // Modal ocupa todo el ancho
      backgroundColor: "#fff",
      padding: 20,
      borderTopLeftRadius: 25, // Bordes superiores redondeados
      borderTopRightRadius: 25,
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    closeButton: {
      position: "absolute",
      top: 15,
      right: 20,
      backgroundColor: "#f1f1f1", // Fondo claro
      padding: 10,
      borderRadius: 20,
      elevation: 2,
    },
    closeButtonText: {
      fontSize: 16,
      color: "#673072",
      fontWeight: "bold",
    },
    modalTitle: {
      fontSize: 20,
      color: "#673072",
      marginBottom: 20,
      fontWeight: "bold",
    },
    inputBox: {
      backgroundColor: "#f5f5f5",
      padding: 15,
      borderRadius: 25,
      width: "100%",
      marginBottom: 15,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    picker: {
      width: "100%",
    },
    loadingText: {
      color: "#555",
      fontSize: 16,
      textAlign: "center",
      marginBottom: 15,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      padding: 15,
      borderRadius: 25,
      width: "100%",
      marginBottom: 15,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    dateText: {
      marginLeft: 10,
      color: "#555",
    },
    confirmButton: {
      backgroundColor: "#673ab7", // Botón púrpura
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      alignItems: "center",
      width: "100%",
    },
    confirmText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
  
export default AddSavingGoalModal;
