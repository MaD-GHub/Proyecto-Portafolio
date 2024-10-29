// TransactionHistory.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

// Función para agrupar transacciones por fecha
const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.selectedDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

// Componente para formatear moneda (CLP)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const TransactionHistory = ({ transactions }) => {
  const groupedTransactions = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <View style={styles.transactionContainer}>
      <Text style={styles.title}>Historial Ingresos y Gastos</Text>
      {transactions && transactions.length === 0 ? (
        <Text>No hay transacciones aún</Text>
      ) : (
        <FlatList
          data={sortedDates}
          keyExtractor={(item) => item}
          renderItem={({ item: date }) => (
            <View>
              <Text style={styles.dateHeader}>
                {new Date(date).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {groupedTransactions[date].map((item) => (
                <View key={item.id} style={styles.transactionItem}>
                  <View>
                    <Text
                      style={[
                        styles.transactionText,
                        { color: item.type === "Ingreso" ? "green" : "red" },
                      ]}
                    >
                      {item.category} - {formatCurrency(item.amount)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "fff",
    marginBottom: 15,
    textAlign: "center",
  },
  dateHeader: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "#673072",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  transactionText: { fontFamily: "QuattrocentoSans-Bold", fontSize: 16 },
  transactionDate: {
    fontFamily: "QuattrocentoSans-Regular",
    fontSize: 16,
    color: "gray",
  },
});

export default TransactionHistory;
