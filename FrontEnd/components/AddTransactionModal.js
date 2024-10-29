// AddTransactionModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

const AddTransactionModal = ({ visible, onSave, onClose }) => {
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("Ingreso");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isFixed, setIsFixed] = useState("No");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [billingDay, setBillingDay] = useState(1);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ingresoCategorias = ["Salario", "Venta de producto"];
  const gastoCategorias = [
    "Comida y Bebidas",
    "Vestuario",
    "Alojamiento",
    "Salud",
    "Transporte",
    "Educación",
  ];
  

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !category) {
      alert("Por favor ingrese todos los datos requeridos.");
      return;
    }
    const newTransaction = {
      type: transactionType,
      amount: parsedAmount,
      category,
      description,
      isFixed,
      isInstallment,
      installmentCount: isInstallment ? installmentCount : null,
      billingDay,
      selectedDate: date.toISOString(),
      installmentStartDate: isInstallment ? date.toISOString() : null,
      simulation: true, // Marcar como transacción simulada
    };
    onSave(newTransaction); // Guardar en Firebase y actualizar la interfaz
    onClose(); // Cierra el modal pero no reinicia los campos
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Nueva Transacción</Text>

          {/* Tipo de Transacción */}
          <View style={styles.segmentedControlContainer}>
            <TouchableOpacity
              style={[
                styles.segmentedControlButton,
                transactionType === "Ingreso" &&
                  styles.segmentedControlButtonActive,
              ]}
              onPress={() => setTransactionType("Ingreso")}
            >
              <Text
                style={[
                  styles.segmentedControlText,
                  transactionType === "Ingreso" &&
                    styles.segmentedControlTextActive,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentedControlButton,
                transactionType === "Gasto" &&
                  styles.segmentedControlButtonActive,
              ]}
              onPress={() => setTransactionType("Gasto")}
            >
              <Text
                style={[
                  styles.segmentedControlText,
                  transactionType === "Gasto" &&
                    styles.segmentedControlTextActive,
                ]}
              >
                Gasto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monto */}
          <TextInput
            style={styles.inputBox}
            placeholder="Ingrese monto"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
          />

          {/* Categoría */}
          <View style={styles.inputBox2}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione categoría" value="" />
              {(transactionType === "Ingreso"
                ? ingresoCategorias
                : gastoCategorias
              ).map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          {/* Descripción */}
          <TextInput
            style={styles.inputBox}
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
          />

          {/* Tipo de Gasto (fijo, variable, cuotas) */}
          <View style={styles.inputBox2}>
            <Picker
              selectedValue={isFixed}
              onValueChange={(itemValue) => {
                setIsFixed(itemValue);
                setIsInstallment(itemValue === "Cuotas");
              }}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione tipo" value="No" />
              <Picker.Item label="Fijo" value="Fijo" />
              <Picker.Item label="Variable" value="Variable" />
              {transactionType === "Gasto" && (
                <Picker.Item label="Cuotas" value="Cuotas" />
              )}
            </Picker>
          </View>

          {/* Selector de Cuotas */}
          {isInstallment && transactionType === "Gasto" && (
            <View style={styles.inputBox2}>
              <Picker
                selectedValue={installmentCount}
                onValueChange={(itemValue) => setInstallmentCount(itemValue)}
                style={styles.picker}
              >
                {[3, 6, 12, 18, 24].map((num) => (
                  <Picker.Item key={num} label={`${num} cuotas`} value={num} />
                ))}
              </Picker>
            </View>
          )}

          {/* Texto de cuota mensual */}
          {isInstallment && transactionType === "Gasto" && (
            <Text style={styles.installmentText}>
              Cada cuota será de: {(amount / installmentCount).toFixed(2)} CLP
            </Text>
          )}

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
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Día de facturación (solo para cuotas) */}
          {isInstallment && transactionType === "Gasto" && (
            <View>
              <Text style={styles.textFacturacion}>
                Día de facturación de la tarjeta
              </Text>
              <View style={styles.inputBox2}>
                <Picker
                  selectedValue={billingDay}
                  onValueChange={(itemValue) => setBillingDay(itemValue)}
                  style={styles.picker}
                >
                  {[...Array(31)].map((_, index) => (
                    <Picker.Item
                      key={index}
                      label={`Día ${index + 1}`}
                      value={index + 1}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Botón Confirmar */}
          <LinearGradient
            colors={["#511496", "#885FD8"]}
            style={styles.confirmButton}
          >
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
  closeButton: { position: "absolute", top: 15, right: 15 },
  closeButtonText: {
    fontSize: 24,
    color: "#673072",
    paddingRight: 15,
    paddingTop: 7,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673072",
    marginBottom: 20,
    fontWeight: "bold",
  },
  segmentedControlContainer: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  segmentedControlButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  segmentedControlButtonActive: {
    backgroundColor: "#511496",
    borderRadius: 20,
  },
  segmentedControlText: { color: "#6d6d6d", fontSize: 14, fontWeight: "bold" },
  segmentedControlTextActive: { color: "#fff" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  inputBox2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 2,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  picker: { 
    height: 20, 
    width: "100%" 
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  dateText: { 
    marginLeft: 10, 
    color: "#555", 
    fontSize: 16 
  },
  confirmButton: {
    borderRadius: 25,
    width: "96%",
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: { color: "white", fontSize: 18, fontWeight: "bold" },
  textFacturacion: {
    fontSize: 16,
    color: "#673072",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  installmentText: {
    fontSize: 16,
    color: "#673072",
    marginTop: -4,
    textAlign: "center",
    marginBottom: 13,
    fontWeight: "bold",
  },
});

export default AddTransactionModal;
