import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import LineChartComponent from "../components/LineChartComponent"; // Componente de gráficos de ingresos
import ExpensesChartComponent from "../components/ExpensesChartComponent";
import ComparisonChartComponent from "../components/ComparisonChartComponent"; // Componente de otros gráficos

export default function DatosScreen({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("Gráficos");
  const [selectedFilter, setSelectedFilter] = useState("Ingresos"); // Filtro inicial: Ingresos

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
    if (tab === "Inversiones") {
      navigation.navigate("Inversiones");
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  useEffect(() => {
    if (route?.params?.tab) {
      setSelectedTab(route.params.tab);
    }
  }, [route?.params]);

  const renderGraphContent = () => {
    switch (selectedFilter) {
      case "Ingresos":
        return <LineChartComponent />; // Componente del gráfico de ingresos
      case "Gastos":
        return <ExpensesChartComponent />;
      case "Comparación":
        return <ComparisonChartComponent />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Gráficos":
        return (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Contenido del gráfico */}
            <View style={styles.graphWrapper}>{renderGraphContent()}</View>

            {/* Barra de filtros debajo del gráfico */}
            <View style={styles.filterBar}>
              {["Ingresos", "Gastos", "Comparación"].map(
                (filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter && styles.activeFilter,
                    ]}
                    onPress={() => handleFilterChange(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === filter && styles.activeFilterText,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </ScrollView>
        );
      case "Análisis":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Vista de Análisis</Text>
          </View>
        );
      case "Inversiones":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Vista de Inversiones</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {["Gráficos", "Análisis", "Inversiones"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => handleTabPress(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido dinámico */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#511496",
    textAlign: "center",
    marginVertical: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 16,
    padding: 2,
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.15, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 4, // Elevación para Android
    marginTop: 50,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#511496",
  },
  tabText: {
    fontSize: 16,
    color: "#6d6d6d",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Espacio al final para el scroll
  },
  graphWrapper: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 2,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 20,
    marginVertical: 5, // Espacio adicional
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.15, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 4, // Elevación para Android
    marginTop: 15,
  },
  filterButton: {
    flex: 1, // Ocupará todo el espacio disponible
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 1, // Espacio lateral mínimo
  },
  activeFilter: {
    backgroundColor: "#511496",
  },
  filterText: {
    fontSize: 13,
    color: "#6d6d6d",
    textAlign: "center",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 18,
    color: "#673072",
    textAlign: "center",
  },
});

