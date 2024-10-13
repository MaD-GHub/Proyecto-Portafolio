import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Selector de fechas
import { auth, db } from "../firebase"; // Importar Firebase auth y Firestore
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore"; // Firestore funciones
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importar íconos

// Función para formatear a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0, // Sin decimales, como es común en Chile
  }).format(amount);
};

export default function AhorroScreen() {
  const [goalName, setGoalName] = useState(""); // Estado para el nombre de la meta
  const [savingsGoal, setSavingsGoal] = useState("");
  const [startDate, setStartDate] = useState(null); // Nueva fecha de inicio
  const [endDate, setEndDate] = useState(null); // Nueva fecha de fin
  const [isDatePickerVisible, setDatePickerVisible] = useState(false); // Estado para controlar el picker
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [goals, setGoals] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null); // Meta actual para editar

  // Obtener ahorros desde Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log("Usuario autenticado:", user.uid);
      const q = query(collection(db, "savings"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userGoals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Metas obtenidas:", userGoals);
        setGoals(userGoals);
      });
      return () => unsubscribe(); // Limpiar listener
    } else {
      console.log("No se encontró un usuario autenticado");
    }
  }, []);

  // Manejar agregar metas
  const handleAddGoal = async () => {
    if (goalName && savingsGoal && startDate && endDate) {
      const user = auth.currentUser;
      const newGoal = {
        userId: user.uid,
        name: goalName,
        goal: parseInt(savingsGoal, 10),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      try {
        console.log("Intentando agregar nueva meta:", newGoal);
        await addDoc(collection(db, "savings"), newGoal); // Guardar meta en Firestore
        Alert.alert("Éxito", "Meta de ahorro agregada correctamente.");
        console.log("Meta agregada exitosamente");
        // Limpiar campos
        setGoalName("");
        setSavingsGoal("");
        setStartDate(null);
        setEndDate(null);
      } catch (error) {
        console.error("Error al agregar la meta:", error);
        Alert.alert("Error", "No se pudo guardar la meta.");
      }
    } else {
      console.log("Faltan campos por completar al intentar agregar meta");
      Alert.alert("Error", "Por favor, completa todos los campos.");
    }
  };

  // Manejar eliminar metas
  const handleDeleteGoal = async (goalId) => {
    try {
      console.log("Intentando eliminar meta con ID:", goalId);
      await deleteDoc(doc(db, "savings", goalId));
      Alert.alert("Éxito", "Meta eliminada correctamente.");
      console.log("Meta eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la meta:", error);
      Alert.alert("Error", "No se pudo eliminar la meta.");
    }
  };

  // Manejar edición de metas
  const handleEditGoal = async () => {
    if (currentGoal && currentGoal.name && currentGoal.goal && startDate && endDate) {
      try {
        console.log("Intentando actualizar meta:", currentGoal);
        await updateDoc(doc(db, "savings", currentGoal.id), {
          name: currentGoal.name,
          goal: parseInt(currentGoal.goal, 10),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        Alert.alert("Éxito", "Meta de ahorro actualizada correctamente.");
        console.log("Meta actualizada exitosamente");
        setIsEditModalVisible(false); // Cerrar modal
      } catch (error) {
        console.error("Error al actualizar la meta:", error);
        Alert.alert("Error", "No se pudo actualizar la meta.");
      }
    } else {
      console.log("Faltan campos por completar al intentar editar meta");
      Alert.alert("Error", "Por favor, completa todos los campos.");
    }
  };

  // Mostrar y ocultar DatePicker para la fecha de inicio
  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirmStartDate = (date) => {
    console.log("Fecha de inicio seleccionada:", date);
    setStartDate(date);
    hideDatePicker();
  };

  // Mostrar y ocultar DatePicker para la fecha de fin
  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);
  const handleConfirmEndDate = (date) => {
    console.log("Fecha de fin seleccionada:", date);
    setEndDate(date);
    hideEndDatePicker();
  };

  const calculateMonthlySavings = (goal, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const monthlySavings = months > 0 ? Math.ceil(goal / months) : goal;
    console.log("Ahorro mensual calculado:", monthlySavings);
    return monthlySavings;
  };

  // Mostrar modal para editar
  const openEditModal = (goal) => {
    console.log("Abriendo modal de edición para la meta:", goal);
    setCurrentGoal(goal);
    setStartDate(new Date(goal.startDate)); // Establecer fecha inicial de edición
    setEndDate(new Date(goal.endDate)); // Establecer fecha final de edición
    setIsEditModalVisible(true);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100" contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Encabezado */}
      <View className="bg-white py-4 px-6 shadow-md rounded-bl-3xl rounded-br-3xl pt-10">
        <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 20, color: "black" }} className="text-2xl font-bold text-black">
          Plan de Ahorro
        </Text>
        <Text style={{ fontFamily: "QuattrocentoSans-Regular" }} className="text-md text-gray-500 mt-2">
          Organiza tus objetivos de ahorro
        </Text>
      </View>

      {/* Formulario para agregar metas de ahorro */}
      <View className="mt-6 mx-4 p-4 bg-white rounded-xl shadow-md">
        <Text className="text-lg font-semibold text-black mb-4">Nueva Meta</Text>
        <TextInput placeholder="Nombre de la Meta" value={goalName} onChangeText={setGoalName} className="border border-gray-300 rounded-md px-4 py-2 mb-3" />
        <TextInput placeholder="Cantidad total a ahorrar" value={savingsGoal} onChangeText={setSavingsGoal} keyboardType="numeric" className="border border-gray-300 rounded-md px-4 py-2 mb-3" />
        
        <TouchableOpacity onPress={showDatePicker} className="border border-gray-300 rounded-md px-4 py-2 mb-3">
          <Text>{startDate ? startDate.toDateString() : "Seleccionar fecha de inicio"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showEndDatePicker} className="border border-gray-300 rounded-md px-4 py-2 mb-3">
          <Text>{endDate ? endDate.toDateString() : "Seleccionar fecha de fin"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddGoal} className="bg-[#8f539b] py-3 rounded-full">
          <Text className="text-center text-white text-lg font-bold">Agregar Meta</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Metas de Ahorro */}
      <View className="mt-6 mx-4 p-4 bg-white rounded-xl shadow-md">
        <Text className="text-lg font-semibold text-black mb-2">Metas de Ahorro</Text>
        {goals.length === 0 ? (
          <Text className="text-center text-gray-500">Aquí aparecerán tus metas de ahorro</Text>
        ) : (
          goals.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center bg-white p-4 mb-3 rounded-xl shadow-md">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">Nombre: <Text className="text-blue-500">{item.name}</Text></Text>
                <Text className="text-lg font-semibold text-black">Meta: <Text className="text-green-500">{formatCurrency(item.goal)}</Text></Text>
                <Text className="text-lg font-semibold text-black">Desde: <Text className="text-gray-600">{new Date(item.startDate).toLocaleDateString()}</Text></Text>
                <Text className="text-lg font-semibold text-black">Hasta: <Text className="text-gray-600">{new Date(item.endDate).toLocaleDateString()}</Text></Text>
                <Text className="text-lg font-semibold text-black">Ahorro Mensual: <Text className="text-yellow-500">{formatCurrency(calculateMonthlySavings(item.goal, item.startDate, item.endDate))}</Text></Text>
              </View>
              {/* Botones de edición y eliminación */}
              <View className="flex-row">
                <TouchableOpacity onPress={() => openEditModal(item)} className="mr-3">
                  <MaterialCommunityIcons name="pencil" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
                  <MaterialCommunityIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* DatePicker modales */}
      <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirmStartDate} onCancel={hideDatePicker} />
      <DateTimePickerModal isVisible={isEndDatePickerVisible} mode="date" onConfirm={handleConfirmEndDate} onCancel={hideEndDatePicker} />

      {/* Modal para editar meta */}
      <Modal visible={isEditModalVisible} animationType="slide">
        <View className="p-4">
          <Text className="text-lg font-semibold">Editar Meta</Text>
          <TextInput
            placeholder="Nombre de la Meta"
            value={currentGoal?.name || ""}
            onChangeText={(text) => setCurrentGoal({ ...currentGoal, name: text })}
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
          />
          <TextInput
            placeholder="Cantidad total a ahorrar"
            value={currentGoal?.goal?.toString() || ""}
            onChangeText={(text) => setCurrentGoal({ ...currentGoal, goal: text })}
            keyboardType="numeric"
            className="border border-gray-300 rounded-md px-4 py-2 mb-3"
          />
          <TouchableOpacity onPress={handleEditGoal} className="bg-[#8f539b] py-3 rounded-full">
            <Text className="text-center text-white text-lg font-bold">Guardar Cambios</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditModalVisible(false)} className="bg-gray-300 py-3 rounded-full mt-3">
            <Text className="text-center text-black text-lg">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
