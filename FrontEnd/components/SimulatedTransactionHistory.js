// SimulatedTransactionHistory.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

// Función para agrupar transacciones simuladas por fecha
const groupSimulatedTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.selectedDate).toDateString();
    // Cambiamos isSimulated a simulation
    if (transaction.simulation) { // Filtramos solo las simuladas
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    }
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

const SimulatedTransactionHistory = ({ transactions }) => {
  const groupedSimulatedTransactions = groupSimulatedTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedSimulatedTransactions).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <View style={styles.simulatedTransactionContainer}>
      <Text style={styles.title}>Transacciones Simuladas</Text>
      {Object.keys(groupedSimulatedTransactions).length === 0 ? (
        <Text>No hay transacciones simuladas</Text>
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
              {groupedSimulatedTransactions[date].map((item) => (
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
  simulatedTransactionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "#000",
    marginBottom: 10,
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

export default SimulatedTransactionHistory;
