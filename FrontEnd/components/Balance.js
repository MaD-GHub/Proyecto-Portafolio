// Balance.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Función para obtener la fecha de hoy en formato DD/MM/YYYY
const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Función para formatear un número como moneda CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Filtrar transacciones del mes y año actual
const getCurrentMonthTransactions = (transactions) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.selectedDate);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });
};

const Balance = ({ transactions }) => {
  // Filtrar transacciones del mes actual
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);

  // Calcular ingresos y gastos del mes actual, asegurando que el amount sea válido
  const totalIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "Ingreso")
    .reduce((acc, transaction) => acc + (parseFloat(transaction.amount) || 0), 0);

  const totalExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "Gasto")
    .reduce((acc, transaction) => acc + (parseFloat(transaction.amount) || 0), 0);

  // Calcular el balance del mes actual
  const totalBalance = totalIncome - totalExpenses;

  return (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      <Text style={styles.balanceDate}>Saldo actual - {getTodayDate()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: { padding: 20, alignItems: "center" },
  balanceAmount: { fontSize: 36, color: "white", marginTop: 20, fontFamily: "ArchivoBlack-Regular" },
  balanceDate: { fontSize: 16, color: "white", marginTop: 5, fontFamily: "QuattrocentoSans-Bold" }
});

export default Balance;
