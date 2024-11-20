import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

// Helper para generar etiquetas de los meses a partir de la fecha actual
const getMonthLabelsFromNow = (monthsToProject = 12) => {
  const labels = [];
  const today = new Date();
  for (let i = 0; i < monthsToProject; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i);
    const monthLabel = monthDate.toLocaleString("es-CL", { month: "short" }); // Ejemplo: Ene, Feb
    labels.push(`${monthLabel} ${monthDate.getFullYear()}`);
  }
  return labels;
};

const IncomeLineChart = () => {
  const [chartData, setChartData] = useState(null); // Datos del gráfico
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    fetchAndProcessData();
  }, []);

  const fetchTransactions = async (userId) => {
    try {
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      return transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
      return [];
    }
  };

  const calculateProjection = (transactions, labels) => {
    const projectionMonths = labels.length;
    const monthlyIncome = Array(projectionMonths).fill(0);
    const monthlyExpenses = Array(projectionMonths).fill(0);
    const monthlyBalance = Array(projectionMonths).fill(0);

    // Procesar cada transacción
    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      const transactionDate = new Date(transaction.selectedDate);
      const isFixed = transaction.isFixed === "Fijo";
      const isInstallment = transaction.isInstallment || false;
      const installmentCount = transaction.installmentCount || 0;
      const installmentStartDate = new Date(transaction.installmentStartDate || transactionDate);

      for (let i = 0; i < projectionMonths; i++) {
        const currentMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + i);
        const transactionMonthDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth());
        const isCurrentMonth = transactionMonthDate.getTime() === currentMonthDate.getTime();

        // Ingresos
        if (transaction.type === "Ingreso") {
          if (isFixed) {
            monthlyIncome[i] += amount; // Ingreso fijo se suma cada mes
          } else if (isCurrentMonth) {
            monthlyIncome[i] += amount; // Ingreso variable se suma solo al mes correspondiente
          }
        }

        // Gastos (opcional si quieres restarlos del balance neto)
        if (transaction.type === "Gasto") {
          if (isFixed) {
            monthlyExpenses[i] += amount; // Gasto fijo se resta cada mes
          } else if (isCurrentMonth) {
            monthlyExpenses[i] += amount; // Gasto variable se resta solo al mes correspondiente
          }

          // Cuotas
          if (isInstallment) {
            const installmentEndDate = new Date(
              installmentStartDate.getFullYear(),
              installmentStartDate.getMonth() + installmentCount
            );
            if (
              currentMonthDate >= installmentStartDate &&
              currentMonthDate < installmentEndDate
            ) {
              monthlyExpenses[i] += amount / installmentCount; // Repartir cuotas entre los meses correspondientes
            }
          }
        }
      }
    });

    // Calcular el balance acumulado
    for (let i = 0; i < projectionMonths; i++) {
      if (i === 0) {
        // Primer mes: ingresos - gastos
        monthlyBalance[i] = monthlyIncome[i] - monthlyExpenses[i];
      } else {
        // Suma del balance acumulado mes a mes
        monthlyBalance[i] = monthlyBalance[i - 1] + (monthlyIncome[i] - monthlyExpenses[i]);
      }
    }

    return { monthlyBalance };
  };

  const fetchAndProcessData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No se encontró un usuario autenticado.");
        setLoading(false);
        return;
      }

      const transactions = await fetchTransactions(user.uid);
      const labels = getMonthLabelsFromNow(); // Generar etiquetas dinámicamente
      const { monthlyBalance } = calculateProjection(transactions, labels);

      setChartData({
        labels: labels, // Usar las etiquetas generadas dinámicamente
        datasets: [
          {
            data: monthlyBalance,
            color: () => "#34A853", // Color verde
            strokeWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Error al procesar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando datos...</Text>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No se pudieron cargar los datos.</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
      <View style={styles.graphContainer}>
        <Text style={styles.title}>Ingresos Mensuales</Text>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          width={Dimensions.get("window").width * 2.7} // Incrementa el ancho del gráfico
          height={400}
          segments={10}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 168, 83, ${opacity})`, // Verde
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#218838", // Verde oscuro
            },
          }}
          bezier // Curvas suaves
          withInnerLines={false}
          style={{
            marginVertical: 10,
            borderRadius: 16,
            borderWidth: 0,
          }}
          fromZero={true}
          xLabelsOffset={15}
          verticalLabelRotation={-30}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  graphContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 20,
    height: 510,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 16,
    color: "#34A853", // Verde
  },
  loading: {
    fontSize: 16,
    textAlign: "center",
    color: "#34A853",
  },
  error: {
    fontSize: 16,
    textAlign: "center",
    color: "red",
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
});

export default IncomeLineChart;
