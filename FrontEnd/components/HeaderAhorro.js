import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";

const HeaderAhorro = ({ totalSavings, onAddSavingPress }) => {
  const [fontsLoaded] = useFonts({
    "Aventra-Bold": require("../assets/fonts/Fontspring-DEMO-aventra-bold.otf"),
    "Inter-Regular": require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"), // Fuente alternativa para símbolos
  });

  if (!fontsLoaded) {
    return null; // Deja el componente vacío mientras las fuentes cargan
  }

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.totalTitle}>Total ahorrado</Text>
        <Text style={styles.totalAmount}>
          <Text style={styles.dollarSign}>$</Text>
          {totalSavings.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddSavingPress}>
        <Feather name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  totalTitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333", // Color más definido para consistencia
  },
  totalAmount: {
    fontSize: 48, // Tamaño ajustado para que sea más consistente
    fontFamily: "Aventra-Bold",
    color: "#000",
  },
  dollarSign: {
    fontFamily: "Roboto-Bold", // Usamos Roboto-Bold para el signo de peso
    fontSize: 40, // Tamaño ajustado para que sea visualmente consistente
    color: "#000",
    paddingBottom: 5,
  },
  addButton: {
    backgroundColor: "#885FD8",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default HeaderAhorro;
