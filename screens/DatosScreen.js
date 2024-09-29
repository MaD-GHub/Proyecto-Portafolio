import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DatosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página de Datos</Text>
      <Text style={styles.description}>
        Aquí puedes ver datos estadísticos o gráficos importantes relacionados con tus transacciones.
      </Text>
      {/* Aquí puedes agregar gráficos o cualquier contenido relacionado con los datos */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F6F6F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});
