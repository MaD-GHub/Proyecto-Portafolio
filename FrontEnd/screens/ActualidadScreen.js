// screens/ActualidadScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActualidadScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Página de Actualidad</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#511496',
    fontWeight: 'bold',
  },
});

export default ActualidadScreen;
