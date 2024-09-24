import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as Font from "expo-font";

export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [totalSaved, setTotalSaved] = useState(500000); // Ejemplo de cantidad ahorrada hasta ahora
  const [monthlySavingsNeeded, setMonthlySavingsNeeded] = useState(0); // Ahorro mensual calculado
  const [recentExpenses, setRecentExpenses] = useState([
    { id: '1', category: 'Comida', amount: 50000, date: '25/08/2024' },
    { id: '2', category: 'Transporte', amount: 15000, date: '24/08/2024' },
    { id: '3', category: 'Entretenimiento', amount: 100000, date: '23/08/2024' },
  ]);
  
  // Aquí puedes calcular el ahorro mensual necesario, usando datos de metas activas
  useEffect(() => {
    // Supongamos que ya tienes una función para calcularlo, o puedes usar la misma lógica de la AhorroScreen
    const calculateMonthlySavingsNeeded = () => {
      // Lógica para calcular el ahorro mensual necesario basado en las metas activas
      let totalNeeded = 0; // Esto debería calcularse con base en tus metas
      setMonthlySavingsNeeded(totalNeeded);
    };

    calculateMonthlySavingsNeeded();
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
        "QuattrocentoSans-Italic": require("../assets/fonts/QuattrocentoSans-Italic.ttf"),
        "QuattrocentoSans-BoldItalic": require("../assets/fonts/QuattrocentoSans-BoldItalic.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  const userName = "Matías";

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="bg-[#eeeeee]">
      <SafeAreaView className="flex-1">
        {/* Encabezado */}
        <View className="bg-white px-4 py-5 mt-6 flex-row items-center justify-between shadow-2xl rounded-bl-3xl rounded-br-3xl">
          <View className="flex-row items-center">
            <Image
              source={require("../assets/images/Logo_F1.png")}
              className="w-16 h-16 rounded-full border-2 bg-white border-black"
            />
            <View className="ml-3">
              <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 24, color: "black" }}>
                Finawise
              </Text>
              <Text style={{ fontFamily: "QuattrocentoSans-Regular", fontSize: 18, color: "gray" }}>
                ¡Bienvenid@, {userName}!
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-[#8f539b] p-3 rounded-full w-14">
            <Text className="text-white text-2xl font-bold text-center">≡</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Saldo Actual */}
        <View className="mt-6 mx-4 p-4 bg-white rounded-xl shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 20, color: "black" }}>
              Saldo actual
            </Text>
            <TouchableOpacity className="bg-[#4CAF50] p-2 rounded-full w-12">
              <Text className="text-white text-xl font-bold text-center">+</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: "QuattrocentoSans-Bold", fontSize: 22, color: "gray", marginTop: 5 }}>
            {formatCurrency(totalSaved)}
          </Text>
        </View>

        {/* Sección de Ahorro Mensual Necesario */}
        <View className="mt-4 mx-4 p-4 bg-white rounded-xl shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 20, color: "black" }}>
              Ahorro Mensual Necesario
            </Text>
          </View>
          <Text style={{ fontFamily: "QuattrocentoSans-Bold", fontSize: 22, color: "gray", marginTop: 5 }}>
            {formatCurrency(monthlySavingsNeeded)}
          </Text>
        </View>

        {/* Resumen de Gastos Recientes */}
        <View className="mt-4 mx-4 p-4 bg-white rounded-xl shadow-sm">
          <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 20, color: "black", marginBottom: 26, marginTop: 8  }}>
            Gastos Recientes
          </Text>
          <FlatList
            data={recentExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="flex-row justify-between mb-3">
                <Text style={{ fontFamily: "QuattrocentoSans-Bold", fontSize: 16, color: "black" }}>{item.category}</Text>
                <Text style={{ fontFamily: "QuattrocentoSans-Regular", fontSize: 16, color: "red" }}>{formatCurrency(item.amount)}</Text>
                <Text style={{ fontFamily: "QuattrocentoSans-Regular", fontSize: 16, color: "gray" }}>{item.date}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

// Función para formatear a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0, // Sin decimales
  }).format(amount);
};
