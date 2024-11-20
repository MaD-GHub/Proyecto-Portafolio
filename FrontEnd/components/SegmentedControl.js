// components/SegmentedControl.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const SegmentedControl = ({ selectedTab, setSelectedTab }) => {
  return (
    <View style={styles.segmentedControl}>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === "Expenses" && styles.activeTab]}
        onPress={() => setSelectedTab("Expenses")}
      >
        <Text style={[styles.tabText, selectedTab === "Expenses" && styles.activeTabText]}>
          Gastos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, selectedTab === "Income" && styles.activeTab]}
        onPress={() => setSelectedTab("Income")}
      >
        <Text style={[styles.tabText, selectedTab === "Income" && styles.activeTabText]}>
          Ingresos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentedControl: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
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
    color: "white",
  },
});

export default SegmentedControl;
