// components/ActivityList.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { formatCurrency, formatDate } from "../utils/utils";

const ActivityList = ({ transactions, selectedTab }) => {
  const filteredTransactions = transactions.filter((transaction) => transaction.type === selectedTab);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Última Actividad</Text>
      {filteredTransactions.length === 0 ? (
        <Text>No hay transacciones disponibles</Text>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <Text style={[styles.amount, item.amount < 0 ? styles.negative : styles.positive]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 5,
    borderRadius: 10,
  },
  category: { fontSize: 16, color: "#000" },
  date: { fontSize: 14, color: "#888" },
  amount: { fontSize: 16, fontWeight: "bold" },
  negative: { color: "#ff3b30" },
  positive: { color: "#4cd964" },
});

export default ActivityList;
