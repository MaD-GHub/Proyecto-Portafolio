import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import AddSavingGoalModal from "../components/AddSavingGoalModal";
import { Feather } from "@expo/vector-icons";


const AhorroScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Botón para abrir el modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <AddSavingGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={() => {
          console.log("Meta de ahorro guardada");
          // Aquí puedes recargar las metas de ahorro o realizar acciones adicionales
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: "#f9f9f9" },
  addButton: {
    backgroundColor: "#673ab7",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AhorroScreen;
