import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'; 
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

// Función para obtener los próximos 7 meses a partir del mes actual
const getNextMonths = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // Enero = 0
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const nextMonths = [];

  for (let i = 0; i < 8; i++) {
    nextMonths.push(months[(currentMonth + i) % 12]);
  }

  return nextMonths;
};

export default function DatosScreen({ route }) {
  const screenWidth = Dimensions.get('window').width;

  // Recibe las transactions desde route.params
  const transactions = route?.params?.transactions || []; // Manejar el caso en el que route o params es undefined

  console.log('Transactions:', transactions); // Verificar si las transacciones llegan correctamente

  // Asegurarse de que transactions esté definido
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Progreso Financiero</Text>
        <Text style={styles.description}>No hay datos de transacciones disponibles.</Text>
      </View>
    );
  }

  // Filtramos los datos de ingresos y egresos para los próximos 8 meses
  const filteredData = getNextMonths().map((month, index) => {
    const ingresos = transactions
      .filter(t => t.type === 'Ingreso' && new Date(t.date).getMonth() === (new Date().getMonth() + index) % 12)
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const egresos = transactions
      .filter(t => t.type === 'Egreso' && new Date(t.date).getMonth() === (new Date().getMonth() + index) % 12)
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    return { month, ingresos, egresos };
  });

  console.log('Filtered Data:', filteredData); // Verificar los datos filtrados para depuración

  // Extraemos los ingresos y egresos por separado para el gráfico
  const ingresosData = filteredData.map(data => data.ingresos);
  const egresosData = filteredData.map(data => data.egresos);

  const data = {
    labels: getNextMonths(),  // Meses en el eje X
    datasets: [
      {
        data: ingresosData, // Valores en el eje Y para los ingresos
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Color de la línea de ingresos
        strokeWidth: 3, // Ancho de la línea
      },
      {
        data: egresosData, // Valores en el eje Y para los egresos
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Color de la línea de egresos
        strokeWidth: 3, // Ancho de la línea
      },
    ],
    legend: ['Ingresos', 'Egresos'], // Nombres para las líneas
  };

  // Calcular totales
  const totalIngresos = ingresosData.reduce((acc, value) => acc + value, 0);
  const totalEgresos = egresosData.reduce((acc, value) => acc + value, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progreso Financiero</Text>

      <LineChart
        data={data}
        width={screenWidth} // Ancho del gráfico ahora ocupa toda la pantalla
        height={300} // Altura del gráfico
        yAxisLabel="$" // Etiqueta en el eje Y
        chartConfig={{
          backgroundColor: '#1c1c1e',
          backgroundGradientFrom: '#673072',
          backgroundGradientTo: '#885fd8',
          decimalPlaces: 2, // Mostrar 2 decimales para las cantidades monetarias
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
        bezier // Añadir curvas suaves
        style={{
          marginVertical: 20,
          borderRadius: 16,
        }}
      />

      <View style={styles.transactionDetails}>
        <LinearGradient
          colors={['#511496', '#885fd8']}
          style={styles.totalItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalLabel}>Ingresos Totales</Text>
          <Text style={styles.totalAmount}>${totalIngresos}</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#511496', '#885fd8']}
          style={styles.totalItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalLabel}>Egresos Totales</Text>
          <Text style={styles.totalAmount}>${totalEgresos}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#673072',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Ajuste para el espaciado de los elementos
    width: '100%', // Ocupar todo el ancho de la pantalla
    marginTop: 20,
  },
  totalItem: {
    width: '45%', // Ajuste de ancho para los gradientes
    borderRadius: 10, // Bordes redondeados
    padding: 15,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Texto en blanco
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white', // Texto en blanco
  },
});
