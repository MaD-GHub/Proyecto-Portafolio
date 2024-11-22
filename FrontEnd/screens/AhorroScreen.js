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
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const AhorroScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(600));
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("Gasto");
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

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
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

  const handleAddTransaction = async () => {
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
      type: transactionType,
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
      closeModal();
    } catch (error) {
      console.error("Error al añadir transacción:", error);
      alert("Hubo un error al guardar la transacción. Intenta nuevamente.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
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
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
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
              <TouchableOpacity
                onPress={handleAddTransaction}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: "#673ab7",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#673072",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673072",
    marginBottom: 20,
  },
  inputBox: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  picker: {
    width: "100%",
  },
  loadingText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
    color: "#555",
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AhorroScreen;