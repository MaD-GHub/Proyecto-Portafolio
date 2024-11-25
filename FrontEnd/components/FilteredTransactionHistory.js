import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.selectedDate).toDateString();
    if (!transaction.simulation) {
      // Excluye las transacciones simuladas
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    }
    return groups;
  }, {});
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const FilteredTransactionHistory = ({ transactions, onEdit, onDelete }) => {
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
                        {
                          color:
                            item.categoryName === "Ahorro"
                              ? "orange" // Color para Ahorro
                              : item.type === "Ingreso"
                              ? "green"
                              : "red",
                        },
                      ]}
                    >
                      {item.categoryName === "Ahorro"
                        ? `Ahorro - ${item.subCategoryName || "Sin Subcategoría"}`
                        : `${item.categoryName}`}{" "}
                      - {formatCurrency(item.amount)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {item.description || "Sin descripción"}
                    </Text>
                  </View>
                  <View style={styles.transactionActions}>
                    {/* Botón de editar */}
                    <TouchableOpacity onPress={() => onEdit(item)}>
                      <MaterialCommunityIcons
                        name="pencil"
                        size={24}
                        color="blue"
                      />
                    </TouchableOpacity>
                    {/* Botón de eliminar */}
                    <TouchableOpacity
                      onPress={() => onDelete(item.id)}
                      style={styles.deleteIcon}
                    >
                      <MaterialCommunityIcons
                        name="trash-can"
                        size={24}
                        color="red"
                      />
                    </TouchableOpacity>
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
    marginBottom: 90,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "#000",
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
  transactionActions: {
    flexDirection: "row",
  },
  deleteIcon: {
    marginLeft: 10,
  },
});

export default FilteredTransactionHistory;
