import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PieChartComponent from "../components/PieChartComponent"; // Gráfico de torta

const AnalysisScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("Ingresos");

  // Datos de ejemplo
  const pieChartData = {
    Ingresos: [50, 30, 15, 5],
    Gastos: [40, 25, 20, 15],
  };
  const pieChartColors = ["#FF6384", "#36A2EB", "#FFCE56", "#8E44AD"];
  const pieChartTotal = {
    Ingresos: 20173,
    Gastos: 15000,
  };

  const categoryBreakdown = {
    Ingresos: [
      { name: "Sueldo", value: 10086.5, percentage: 50 },
      { name: "Abono", value: 3631.14, percentage: 18 },
      { name: "Venta de Producto", value: 3429.41, percentage: 17 },
      { name: "Otros", value: 3025.95, percentage: 15 },
    ],
    Gastos: [
      { name: "Vacaciones", value: 5000, percentage: 40 },
      { name: "Combustibles", value: 3750, percentage: 25 },
      { name: "Comida", value: 3000, percentage: 20 },
      { name: "Educación", value: 2250, percentage: 15 },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Título y botón de retroceso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons style={styles.arrowLeft} name="arrow-left" size={24} color="#511496" />
        </TouchableOpacity>
        <Text style={styles.title}>Análisis</Text>
      </View>

      {/* Selector de categorías (Gastos/Ingresos) */}
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

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gráfico de torta */}
        <View style={styles.pieChartContainer}>
          <PieChartComponent
            data={pieChartData[selectedCategory]}
            colors={pieChartColors}
            total={pieChartTotal[selectedCategory]}
            thickness={20} // Grosor ajustado del anillo
            centralize={true}
          />
          <Text style={styles.chartDescription}>
            Gastos/Ingresos por categoría
          </Text>
        </View>

        {/* Detalles de las categorías */}
        <View style={styles.categorySection}>
          {categoryBreakdown[selectedCategory].map((item, index) => (
            <View key={index}>
              <View style={styles.categoryBox}>
                <Text style={styles.categoryTitle}>{item.name}</Text>
                <Text style={styles.categoryValue}>
                  ${item.value.toLocaleString()}
                </Text>
                <View
                  style={[
                    styles.percentageBox,
                    { backgroundColor: pieChartColors[index % pieChartColors.length] },
                  ]}
                >
                  <Text style={styles.percentageText}>{item.percentage}%</Text>
                </View>
              </View>
              {/* Línea separadora */}
              {index < categoryBreakdown[selectedCategory].length - 1 && (
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
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    width: "100%",
    paddingHorizontal: 15,
  },
  categorySection: {
    marginHorizontal: 35, // Mayor margen horizontal
    marginTop: 10,
  },
  categoryBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  separatorLine: {
    height: 1,
    backgroundColor: "#ddd", // Línea separadora
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
});

export default AnalysisScreen;
