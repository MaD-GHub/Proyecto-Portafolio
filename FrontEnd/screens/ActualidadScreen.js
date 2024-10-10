import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActualidadScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Noticias y Actualidad</Text>
      <Text style={styles.text}>Aquí aparecerán las noticias más recientes y relevantes para los usuarios.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default ActualidadScreen;
