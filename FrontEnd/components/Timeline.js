// Timeline.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Helper function to format currency (assumes CLP currency)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Timeline Component
const Timeline = ({ transactions }) => {
  const [projection, setProjection] = useState([]);

  useEffect(() => {
    calculateProjection();
  }, [transactions]);

  const calculateProjection = () => {
    const projectionMonths = 6; // Set number of months to project
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const projectionData = [];
    let currentBalance = 0; // Start with an initial balance of 0 or user’s current balance

    for (let i = 0; i < projectionMonths; i++) {
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        const isFixed = transaction.isFixed === "Fijo";
        const transactionDate = new Date(transaction.selectedDate);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        const isInstallment = transaction.isInstallment;
        const installmentCount = transaction.installmentCount || 0;

        // Calculate monthly income
        if (transaction.type === "Ingreso") {
          if (isFixed) {
            monthlyIncome += amount;
          } else if (transactionMonth === (currentMonth + i) % 12 && transactionYear === currentYear + Math.floor((currentMonth + i) / 12)) {
            monthlyIncome += amount;
          }
        }

        // Calculate monthly expenses
        if (transaction.type === "Gasto") {
          if (isFixed) {
            monthlyExpense += amount;
          } else if (isInstallment && installmentCount > 0) {
            const installmentAmount = amount / installmentCount;
            const startMonth = new Date(transaction.installmentStartDate).getMonth();
            const startYear = new Date(transaction.installmentStartDate).getFullYear();

            if (
              (currentMonth + i) % 12 >= startMonth &&
              (currentMonth + i) % 12 < startMonth + installmentCount &&
              startYear <= currentYear + Math.floor((currentMonth + i) / 12)
            ) {
              monthlyExpense += installmentAmount;
            }
          } else if (transactionMonth === (currentMonth + i) % 12 && transactionYear === currentYear + Math.floor((currentMonth + i) / 12)) {
            monthlyExpense += amount;
          }
        }
      });

      // Update monthly balance
      currentBalance += monthlyIncome - monthlyExpense;

      const projectedMonth = (currentMonth + i) % 12;
      const projectedYear = currentYear + Math.floor((currentMonth + i) / 12);

      projectionData.push({
        month: `${months[projectedMonth]} ${projectedYear}`,
        balance: currentBalance,
      });
    }

    setProjection(projectionData);
  };

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Proyección Financiera</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          <View style={styles.timelineMonths}>
            {projection.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineVerticalLine} />
                <Text style={styles.timelineMonth}>{item.month}</Text>
                <Text style={styles.timelineBalance}>
                  {isNaN(item.balance) || item.balance === Infinity || item.balance === -Infinity
                    ? "$0"
                    : formatCurrency(item.balance)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  timelineTitle: {
    fontSize: 18,
    fontFamily: "ArchivoBlack-Regular",
    color: "black",
    textAlign: "center",
  },
  timeline: { position: "relative", flexDirection: "row" },
  timelineLine: {
    height: 2,
    backgroundColor: "#673072",
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
  },
  timelineMonths: { flexDirection: "row", justifyContent: "space-around" },
  timelineItem: {
    alignItems: "center",
    width: 120,
    marginHorizontal: 10,
  },
  timelineVerticalLine: {
    height: 30,
    width: 2,
    backgroundColor: "#673072",
    marginBottom: 5,
  },
  timelineMonth: {
    fontSize: 14,
    fontFamily: "QuattrocentoSans-Bold",
    color: "#673072",
  },
  timelineBalance: {
    fontSize: 14,
    fontFamily: "QuattrocentoSans-Regular",
    color: "gray",
  },
});

export default Timeline;
