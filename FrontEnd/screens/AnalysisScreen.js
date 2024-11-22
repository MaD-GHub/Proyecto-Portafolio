import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PieChartComponent from "../components/PieChartComponent"; // Gráfico de torta
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";

const AnalysisScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("Ingresos");
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartColors, setChartColors] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar transacciones desde Firestore
  const loadTransactions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const trans = [];
      querySnapshot.forEach((doc) => {
        trans.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(trans);
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
    }
  };

  // Procesar datos para el gráfico y la lista de categorías
  const processChartData = () => {
    const filteredTransactions = transactions.filter(
      (t) => t.type === selectedCategory.slice(0, -1) // "Ingresos" -> "Ingreso", "Gastos" -> "Gasto"
    );

    // Agrupar montos por categoría
    const totalsByCategory = filteredTransactions.reduce((acc, trans) => {
      acc[trans.categoryName] = (acc[trans.categoryName] || 0) + trans.amount;
      return acc;
    }, {});

    const totalAmount = Object.values(totalsByCategory).reduce((acc, amount) => acc + amount, 0);

    const breakdown = Object.entries(totalsByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: ((amount / totalAmount) * 100).toFixed(1),
    }));

    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#8E44AD", "#FFA500", "#00FF00"];
    setChartData(breakdown.map((item) => item.value)); // Solo valores
    setChartColors(colors.slice(0, breakdown.length)); // Colores ajustados
    setCategoryBreakdown(breakdown); // Lista de categorías
    setTotal(totalAmount);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    processChartData();
  }, [transactions, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons style={styles.arrowLeft} name="arrow-left" size={24} color="#511496" />
        </TouchableOpacity>
        <Text style={styles.title}>Análisis</Text>
      </View>

      {/* Selector de Categorías */}
      <View style={styles.selector}>
        {["Ingresos", "Gastos"].map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.selectorItem}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.selectorText,
                selectedCategory === category && styles.selectorTextActive,
              ]}
            >
              {category}
            </Text>
            {selectedCategory === category && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gráfico de Tortas */}
        {total > 0 ? (
          <View style={styles.pieChartContainer}>
            <PieChartComponent
              data={chartData}
              colors={chartColors}
              total={total}
              thickness={20} // Grosor del anillo
              centralize={true}
            />
            <Text style={styles.chartDescription}>
              Gastos/Ingresos por categoría
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>No hay datos disponibles para mostrar.</Text>
        )}

        {/* Detalles de las Categorías */}
        <View style={styles.categorySection}>
          {categoryBreakdown.map((item, index) => (
            <View key={index}>
              <View style={styles.categoryBox}>
                <Text style={styles.categoryTitle}>{item.name}</Text>
                <Text style={styles.categoryValue}>
                  ${item.value.toLocaleString()}
                </Text>
                <View
                  style={[
                    styles.percentageBox,
                    { backgroundColor: chartColors[index % chartColors.length] },
                  ]}
                >
                  <Text style={styles.percentageText}>{item.percentage}%</Text>
                </View>
              </View>
              {/* Línea separadora */}
              {index < categoryBreakdown.length - 1 && (
                <View style={styles.separatorLine} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#511496",
    marginLeft: 25,
    marginTop: 40,
    marginBottom: 10,
  },
  arrowLeft: {
    marginTop: 40,
    marginLeft: 10,
    marginBottom: 10,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectorItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  selectorText: {
    fontSize: 16,
    color: "#6d6d6d",
    fontWeight: "bold",
  },
  selectorTextActive: {
    color: "#511496",
  },
  activeLine: {
    marginTop: 5,
    width: "60%",
    height: 3,
    backgroundColor: "#511496",
    borderRadius: 2,
  },
  pieChartContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  chartDescription: {
    marginTop: 35,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    width: "100%",
    paddingHorizontal: 25,
  },
  categorySection: {
    marginHorizontal: 35,
    marginTop: 0,
  },
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  separatorLine: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 5,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginHorizontal: 10,
  },
  percentageBox: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  percentageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default AnalysisScreen;
