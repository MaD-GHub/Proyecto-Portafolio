import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DatosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página de Datos</Text>
      <Text style={styles.description}>
        Aquí puedes ver datos estadísticos o gráficos importantes relacionados con tus transacciones.
      </Text>
     // Datos de ejemplo: meses y cantidades ahorradas
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const savingsData = [500, 700, 300, 800, 600, 900, 1200, 1100, 1500, 2000, 1800, 2100];

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Ahorros Mensuales</Text>
      <LineChart
        data={{
          labels: months,
          datasets: [
            {
              data: savingsData,
              strokeWidth: 2, 
            },
          ],
        }}
        width={Dimensions.get('window').width - 40} // Ancho del gráfico
        height={220} // Altura del gráfico
        yAxisLabel="$" // Etiqueta del eje Y
        yAxisSuffix="k" // Sufijo del eje Y
        yAxisInterval={1} // Intervalo de ticks en el eje Y
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 0, // Número de decimales
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default App;
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
