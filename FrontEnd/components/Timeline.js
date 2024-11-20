import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Helper function to format currency
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

const Timeline = ({ transactions }) => {
  const [projection, setProjection] = useState([]);

  useEffect(() => {
    calculateProjection();
  }, [transactions]);

  const calculateProjection = () => {
    const projectionMonths = 6;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const projectionData = [];
    let currentBalance = 0;

    // Calculamos el balance máximo para ajustar las alturas
    let maxBalance = 0;

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

        if (transaction.type === "Ingreso") {
          if (isFixed) {
            monthlyIncome += amount;
          } else if (transactionMonth === (currentMonth + i) % 12 && transactionYear === currentYear + Math.floor((currentMonth + i) / 12)) {
            monthlyIncome += amount;
          }
        }

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

      currentBalance += monthlyIncome - monthlyExpense;
      maxBalance = Math.max(maxBalance, Math.abs(currentBalance));

      const projectedMonth = (currentMonth + i) % 12;
      const projectedYear = currentYear + Math.floor((currentMonth + i) / 12);

      projectionData.push({
        month: `${months[projectedMonth]} ${projectedYear}`,
        balance: currentBalance,
      });
    }

    // Actualizamos el estado con el balance máximo y el proyecto
    setProjection(
      projectionData.map((item) => ({
        ...item,
        height: maxBalance === 0 ? 15 : Math.max((Math.abs(item.balance) / maxBalance) * 80, 15),
      }))
    );
  };

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Proyección Financiera</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeline}>
          {/* Línea de tiempo principal */}
          <View style={styles.baseTimeline}>
            <View style={styles.baseLine} />
            {projection.map((_, index) => (
              <View key={index} style={styles.baseTick} />
            ))}
          </View>

          {/* Proyección de balance */}
          <View style={styles.timelineMonths}>
            {projection.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                {/* Barra de balance */}
                <View
                  style={[
                    styles.balanceBar,
                    {
                      height: item.height,
                      backgroundColor: item.balance >= 0 ? "#6AC259" : "#FF4D4D",
                      marginTop: item.balance >= 0 ? 80 - item.height : 80,
                      transform: item.balance < 0 ? [{ scaleY: -1 }] : [], // Escala hacia abajo para los negativos
                    },
                  ]}
                />
                {/* Texto de mes y balance */}
                <Text style={styles.timelineMonth}>{item.month}</Text>
                <Text style={styles.timelineBalance}>{formatCurrency(item.balance)}</Text>
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
    height: 285,
    marginHorizontal: 10,
    },
  timelineTitle: {
    fontSize: 18,
    fontFamily: "ArchivoBlack-Regular",
    color: "black",
    textAlign: "center",
    marginBottom: 15,
  },
  timeline: { 
    position: "relative", 
    flexDirection: "row" 
  },

  baseTimeline: {
    position: "absolute",
    width: "100%",
    top: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 45,
  },
  baseLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#673072",
    width: "200%",
    zIndex: 2,
  },
  baseTick: {
    height: 100,
    width: 1,
    backgroundColor: "#c9c9c9",
    top: -50,
    zIndex: 0,
  },
  timelineMonths: { 
    flexDirection: "row", 
    justifyContent: "space-around",
    textAlign: "center"
  },
  
  timelineItem: {
    alignItems: "center",
    width: 90,
    marginHorizontal: 2,
    textAlign: "center",
  },
  balanceBar: {
    width: 35,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: "hidden",
    zIndex: 1,
  },
  timelineMonth: {
    fontSize: 14,
    fontFamily: "QuattrocentoSans-Bold",
    color: "#673072",
    marginTop: 55,
    textAlign: "center"
  },
  timelineBalance: {
    fontSize: 14,
    fontFamily: "QuattrocentoSans-Regular",
    color: "gray",
  },
});

export default Timeline;
