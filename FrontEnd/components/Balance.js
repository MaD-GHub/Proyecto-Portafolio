import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getFinancialHealthImage = (income, expenses) => {
  const ratio = expenses / income;

  if (ratio >= 0.9) {
    return { image: require("../assets/Cara_muy_mal.png"), status: "muy_mal" };
  } else if (ratio >= 0.7) {
    return { image: require("../assets/Cara_mal.png"), status: "mal" };
  } else if (ratio >= 0.4) {
    return { image: require("../assets/Cara_media.png"), status: "media" };
  } else if (ratio >= 0.2) {
    return { image: require("../assets/Cara_semimaxima.png"), status: "semimaxima" };
  } else {
    return { image: require("../assets/Cara_maxima.png"), status: "maxima" };
  }
};

const Balance = ({ transactions }) => {
  const [showFinancialHealth, setShowFinancialHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "Ingreso")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "Gasto")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  const { image: healthImage, status } = getFinancialHealthImage(
    totalIncome,
    totalExpenses
  );

  useEffect(() => {
    if (auth.currentUser) {
      updateUserFinancialHealth(status);
    }
  }, [status]);

  const updateUserFinancialHealth = async (status) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        financialHealth: status, // Actualizamos el estado de salud financiera
        lastUpdated: new Date(), // Opción: agregar una marca de tiempo
      });
      setHealthStatus(status); // Guardamos el estado localmente
      console.log("Estado de salud financiera actualizado:", status);
    } catch (error) {
      console.error("Error al actualizar la salud financiera:", error);
    }
  };

  return (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      <TouchableOpacity onPress={() => setShowFinancialHealth(!showFinancialHealth)}>
        {showFinancialHealth ? (
          <View style={styles.healthContainer}>
            <Text style={styles.financialHealthText}>Salud financiera</Text>
            <Image source={healthImage} style={styles.healthImage} />
          </View>
        ) : (
          <Text style={styles.balanceDate}>
            Saldo actual - {getTodayDate()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    padding: 20,
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 36,
    color: "white",
    marginTop: 20,
    fontFamily: "ArchivoBlack-Regular",
  },
  balanceDate: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
    fontFamily: "QuattrocentoSans-Bold",
  },
  healthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  financialHealthText: {
    fontSize: 16,
    color: "white",
    fontFamily: "QuattrocentoSans-Bold",
    marginRight: 10, // Espacio entre el texto y la carita
  },
  healthImage: {
    width: 30,
    height: 30, // Tamaño reducido de la carita
  },
});

export default Balance;
