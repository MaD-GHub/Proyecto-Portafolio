// Balance.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Definir la función localmente en el archivo
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

const Balance = ({ totalSaved }) => (
  <View style={styles.balanceContainer}>
    <Text style={styles.balanceAmount}>{formatCurrency(totalSaved)}</Text>
    <Text style={styles.balanceDate}>Saldo actual - {getTodayDate()}</Text>
  </View>
);

const styles = StyleSheet.create({
  balanceContainer: { padding: 20, alignItems: "center" },
  balanceAmount: { fontSize: 36, color: "white", marginTop: 20, fontFamily: "ArchivoBlack-Regular" },
  balanceDate: { fontSize: 16, color: "white", marginTop: 5, fontFamily: "QuattrocentoSans-Bold" }
});

export default Balance;
