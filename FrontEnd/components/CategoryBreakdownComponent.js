import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CategoryBreakdownComponent = ({ breakdown, colors }) => {
  return (
    <View style={styles.container}>
      {breakdown.map((item, index) => (
        <View style={styles.categoryItem} key={index}>
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: colors[index] },
            ]}
          />
          <View style={styles.categoryText}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryValue}>{`$${item.value.toLocaleString()} (${item.percentage}%)`}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryValue: {
    fontSize: 14,
    color: "#666",
  },
});

export default CategoryBreakdownComponent;
