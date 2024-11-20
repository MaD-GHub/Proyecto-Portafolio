import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";

const PieChartComponent = ({ data, colors, total, centralize }) => {
  const widthAndHeight = 220;

  return (
    <View style={styles.container}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={data}
        sliceColor={colors}
        coverRadius={0.65} // Tamaño del hueco central
        coverFill={"#f1f1f1"} // Color del hueco central
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalTitle}>TOTAL</Text>
        <Text style={[styles.totalValue, centralize && styles.centralized]}>
          ${total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  totalContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  totalTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 80,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  centralized: {
    marginTop: 5, // Ajuste para centrar el texto
  },
});

export default PieChartComponent;
