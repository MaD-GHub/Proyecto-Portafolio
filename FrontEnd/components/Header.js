import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const Header = ({ onAddPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Título a la izquierda */}
      <Text style={styles.headerTitle}>Metas de Ahorro</Text>

      {/* Botón de agregar meta */}
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9", 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#511496", // Color del texto
    paddingTop: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff4081", // Color del botón
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 40,
  },
});

export default Header;
