import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import HeaderAhorro from "../components/HeaderAhorro";
import AddSavingGoalModal from "../components/AddSavingGoalModal";
import AhorrosBox from "../components/AhorrosBox";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase"
import registerActivity from "../components/RegisterActivity";;

const AhorroScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Función para obtener las metas de ahorro desde Firestore
  const fetchSavingGoals = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Por favor, inicia sesión.");
        return;
      }

      const querySnapshot = await getDocs(collection(db, "transactions"));
      const savings = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((doc) => doc.categoryName?.toLowerCase() === "ahorro");

      // Calcula el total de ahorros
      const total = savings.reduce((acc, item) => acc + item.amount, 0);
      setTotalSavings(total);
    } catch (error) {
      console.error("Error al cargar las metas de ahorro:", error);
      alert("No se pudieron cargar las metas de ahorro.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  const handleSave = () => {
    fetchSavingGoals(); // Refresca los datos después de guardar
    setModalVisible(false); // Cierra el modal
  };

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "AhorroScreen",
        description: 'Usuario visita la página Ahorro', 
        });
    }
  }, []);

  return (
    <View style={styles.container}>
      <HeaderAhorro
        totalSavings={totalSavings}
        onAddSavingPress={() => setModalVisible(true)}
      />
      <AhorrosBox
        onBalanceUpdate={setTotalSavings} // Actualiza el balance desde AhorrosBox
        onRefresh={fetchSavingGoals} // Permite refrescar desde el botón de recarga
        isLoading={isLoading} // Indicador de carga
      />
      <AddSavingGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
});

export default AhorroScreen;
