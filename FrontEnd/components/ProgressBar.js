import React from "react";
import { View, StyleSheet } from "react-native";

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.filledBar, { width: `${progress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    width: "100%",
  },
  filledBar: {
    height: "100%",
    backgroundColor: "#673AB7",
  },
});

export default ProgressBar;
