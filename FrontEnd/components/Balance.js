import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

// Calcula el gasto mensual de transacciones con cuotas
const calculateMonthlyExpense = (transaction) => {
  if (transaction.isFixed === "Cuotas" && transaction.installmentCount > 0) {
    return transaction.amount / transaction.installmentCount; // Divide el monto total por el número de cuotas
  }
  return transaction.amount; // Si no es por cuotas, devuelve el monto completo
};

// Verifica si una cuota aplica al mes actual
const isInstallmentApplicable = (transaction, currentMonth, currentYear) => {
  const transactionDate = new Date(transaction.selectedDate);
  const transactionMonth = transactionDate.getMonth();
  const transactionYear = transactionDate.getFullYear();

  const startMonth = transactionMonth;
  const startYear = transactionYear;

  const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);

  return monthsSinceStart >= 0 && monthsSinceStart < transaction.installmentCount;
};

const Balance = ({ transactions }) => {
  const [showFinancialHealth, setShowFinancialHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Cálculo de ingresos totales
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "Ingreso")
    .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

  // Cálculo de gastos mensuales considerando las cuotas
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "Gasto" || transaction.type === "Ahorro")
    .reduce((acc, transaction) => {
      if (
        transaction.isFixed === "Cuotas" &&
        transaction.installmentCount > 0 &&
        isInstallmentApplicable(transaction, currentMonth, currentYear)
      ) {
        return acc + calculateMonthlyExpense(transaction); // Suma la cuota del mes actual
      }
      if (transaction.isFixed !== "Cuotas") {
        return acc + parseFloat(transaction.amount); // Suma gastos normales
      }
      return acc; // Si la cuota no aplica, no suma nada
    }, 0);

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
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Actualizar si el documento ya existe
        await updateDoc(userRef, {
          financialHealth: status,
          lastUpdated: new Date(),
        });
      } else {
        // Crear documento si no existe
        await setDoc(userRef, {
          financialHealth: status,
          lastUpdated: new Date(),
        });
      }

      setHealthStatus(status);
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
    marginRight: 10,
  },
  healthImage: {
    width: 30,
    height: 30,
  },
});

export default Balance;
