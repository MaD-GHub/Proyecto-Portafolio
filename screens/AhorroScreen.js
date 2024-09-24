import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";

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
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [goals, setGoals] = useState([]);

  const handleAddGoal = () => {
    if (goalName && savingsGoal && startMonth && startYear && endMonth && endYear) {
      const newGoal = {
        name: goalName, // Guardamos el nombre de la meta
        goal: parseInt(savingsGoal, 10), // Parseamos el valor como número
        startMonth: startMonth,
        startYear: startYear,
        endMonth: endMonth,
        endYear: endYear,
      };
      setGoals([...goals, newGoal]);

      // Limpiar campos después de agregar
      setGoalName(""); // Limpiamos el nombre de la meta
      setSavingsGoal("");
      setStartMonth("");
      setStartYear("");
      setEndMonth("");
      setEndYear("");
    } else {
      Alert.alert(
        "Alert",
        "Por favor, completa todos los campos antes de agregar una meta."
      );
    }
  };

  const calculateMonthlySavings = (
    goal,
    startMonth,
    startYear,
    endMonth,
    endYear
  ) => {
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return months > 0 ? Math.ceil(goal / months) : goal; // Calculamos el ahorro mensual
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Encabezado */}
      <View className="bg-white py-4 px-6 shadow-md rounded-bl-3xl rounded-br-3xl pt-10">
        <Text
          style={{
            fontFamily: "ArchivoBlack-Regular",
            fontSize: 20,
            color: "black",
          }}
          className="text-2xl font-bold text-black"
        >
          Plan de Ahorro
        </Text>
        <Text
          style={{ fontFamily: "QuattrocentoSans-Regular" }}
          className="text-md text-gray-500 mt-2"
        >
          Organiza tus objetivos de ahorro
        </Text>
      </View>

      {/* Formulario para agregar metas de ahorro */}
      <View className="mt-6 mx-4 p-4 bg-white rounded-xl shadow-md">
        <Text className="text-lg font-semibold text-black mb-4">
          Nueva Meta
        </Text>
        <TextInput
          placeholder="Nombre de la Meta"
          value={goalName}
          onChangeText={setGoalName}
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TextInput
          placeholder="Cantidad total a ahorrar"
          value={savingsGoal}
          onChangeText={setSavingsGoal}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TextInput
          placeholder="Mes de inicio (MM)"
          value={startMonth}
          onChangeText={setStartMonth}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TextInput
          placeholder="Año de inicio (YYYY)"
          value={startYear}
          onChangeText={setStartYear}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TextInput
          placeholder="Mes de fin (MM)"
          value={endMonth}
          onChangeText={setEndMonth}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TextInput
          placeholder="Año de fin (YYYY)"
          value={endYear}
          onChangeText={setEndYear}
          keyboardType="numeric"
          className="border border-gray-300 rounded-md px-4 py-2 mb-3"
        />
        <TouchableOpacity
          onPress={handleAddGoal}
          className="bg-[#8f539b] py-3 rounded-full"
        >
          <Text className="text-center text-white text-lg font-bold">
            Agregar Meta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Metas de Ahorro */}
      <View className="mt-6 mx-4 p-4 bg-white rounded-xl shadow-md">
        <Text className="text-lg font-semibold text-black mb-2">
          Metas de Ahorro
        </Text>
        {goals.length === 0 ? (
          <Text className="text-center text-gray-500">
            Aquí aparecerán tus metas de ahorro
          </Text>
        ) : (
          <FlatList
            data={goals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View className="flex-row justify-between items-center bg-white p-4 mb-3 rounded-xl shadow-md">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black">
                    Nombre: <Text className="text-blue-500">{item.name}</Text>
                  </Text>
                  <Text className="text-lg font-semibold text-black">
                    Meta:{" "}
                    <Text className="text-green-500">
                      {formatCurrency(item.goal)}
                    </Text>
                  </Text>
                  <Text className="text-lg font-semibold text-black">
                    Desde:{" "}
                    <Text className="text-gray-600">
                      {item.startMonth}/{item.startYear}{" "}
                    </Text>
                  </Text>
                  <Text className="text-lg font-semibold text-black">
                    Hasta:{" "}
                    <Text className="text-gray-600">
                      {item.endMonth}/{item.endYear}
                    </Text>
                  </Text>
                  <Text className="text-lg font-semibold text-black">
                    Ahorro Mensual:{" "}
                    <Text className="text-yellow-500">
                      {formatCurrency(
                        calculateMonthlySavings(
                          item.goal,
                          item.startMonth,
                          item.startYear,
                          item.endMonth,
                          item.endYear
                        )
                      )}
                    </Text>
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
