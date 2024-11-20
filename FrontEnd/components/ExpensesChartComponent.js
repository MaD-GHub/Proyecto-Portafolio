import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

// Helper para formatear valores como CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Función para calcular los meses desde el actual
const getDynamicMonthLabels = () => {
  const currentMonth = new Date().getMonth(); // Mes actual (0 - enero, 11 - diciembre)
  const currentYear = new Date().getFullYear(); // Año actual
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  // Crear un arreglo con los próximos 12 meses desde el actual
  const dynamicLabels = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth + i) % 12; // Obtener el índice del mes
    const year = currentYear + Math.floor((currentMonth + i) / 12); // Ajustar el año si el mes pasa de diciembre
    return `${months[monthIndex]} ${year}`;
  });

  return dynamicLabels;
};

const ExpensesChartComponent = () => {
  const [chartData, setChartData] = useState(null); // Datos del gráfico
  const [loading, setLoading] = useState(true); // Estado de carga
  const monthLabels = getDynamicMonthLabels(); // Generar labels dinámicamente

  const fetchTransactions = async (userId) => {
    try {
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Transacciones del usuario cargadas:", transactions);
      return transactions;
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
      return [];
    }
  };

  const calculateProjection = (transactions) => {
    const projectionMonths = monthLabels.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyProjections = Array(projectionMonths).fill(0);

    for (let i = 0; i < projectionMonths; i++) {
      transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        const transactionDate = new Date(transaction.selectedDate);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        const isFixed = transaction.isFixed === "Fijo";

        // Gastos fijos: se suman a todos los meses
        if (transaction.type === "Gasto" && isFixed) {
          monthlyProjections[i] += amount;
        }

        // Gastos variables: se aplican solo al mes correspondiente
        if (
          transaction.type === "Gasto" &&
          !isFixed &&
          transactionMonth === (currentMonth + i) % 12 &&
          transactionYear === currentYear + Math.floor((currentMonth + i) / 12)
        ) {
          monthlyProjections[i] += amount;
        }
      });
    }

    console.log("Proyección mensual de gastos:", monthlyProjections);
    return monthlyProjections;
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
      if (transactions.length > 0) {
        const projections = calculateProjection(transactions);

        // Definir manualmente el rango del eje Y
        const yMax = 10000000; // Máximo fijo en 10M
        const ySteps = 500000; // Intervalos de 500k

        const yLabels = [];
        for (let i = 0; i <= yMax; i += ySteps) {
          yLabels.push(formatCurrency(i));
        }

        setChartData({
          labels: monthLabels, // Usamos los labels generados dinámicamente
          datasets: [
            {
              data: projections,
              color: () => "#E63946", // Color para los gastos
              strokeWidth: 2,
            },
          ],
          yLabels,
          yMax,
        });
      } else {
        console.log("No hay transacciones disponibles para este usuario.");
        setChartData({
          labels: ["No hay datos"],
          datasets: [{ data: [0], color: () => "#FF0000" }],
        });
      }
    } catch (error) {
      console.error("Error al procesar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
  }, []);

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
        <Text style={styles.title}>Gastos Mensuales</Text>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          width={Dimensions.get("window").width * 2.4}
          height={400}
          segments={7}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            formatYLabel: (value) => formatCurrency(value),
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#FF6F61",
            },
          }}
          withInnerLines={false}
          bezier // Habilitar líneas curvas
          style={{
            marginVertical: 10,
            borderRadius: 16,
            borderWidth: 0,
            borderColor: "#f4f4f4",
            padding: 5,
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
    padding: 0,
    backgroundColor: "#fff",
  },
  graphContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 20,
    borderWidth: 0,
    borderColor: "#fff",
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
    color: "#E63946",
    marginLeft: 40,
    marginTop: 14,
  },
  loading: {
    fontSize: 16,
    textAlign: "center",
    color: "#511496",
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

export default ExpensesChartComponent;
