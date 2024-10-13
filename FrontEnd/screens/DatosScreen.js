import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase'; // Importar Firebase auth y Firestore
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Firestore funciones
import moment from 'moment';

export default function DatosScreen() {
  const [selectedTab, setSelectedTab] = useState('Expenses'); // 'Expenses' o 'Income'
  const [transactions, setTransactions] = useState([]); // Estado para almacenar las transacciones
  const [savings, setSavings] = useState([]); // Estado para almacenar los ahorros
  const screenWidth = Dimensions.get('window').width;

  // Obtener datos de Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuario no autenticado");
      return; // Si no hay usuario autenticado, no hacemos las consultas
    }

    try {
      // Obtener transacciones del usuario desde Firebase
      const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const userTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Transacciones recibidas:", userTransactions); // Log para ver las transacciones
        setTransactions(userTransactions);
      });

      // Obtener ahorros del usuario desde Firebase
      const savingsQuery = query(collection(db, 'savings'), where('userId', '==', user.uid));
      const unsubscribeSavings = onSnapshot(savingsQuery, (snapshot) => {
        const userSavings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Ahorros recibidos:", userSavings); // Log para ver los ahorros
        setSavings(userSavings);
      });

      // Limpieza al desmontar el componente
      return () => {
        unsubscribeTransactions();
        unsubscribeSavings();
      };
    } catch (error) {
      console.error("Error al obtener los datos de Firebase:", error);
    }
  }, []);

  // Procesar datos para el gráfico de torta
  const processPieData = (type) => {
    const filteredTransactions = transactions.filter((item) => item.type === type);
    const categoryTotals = {};

    filteredTransactions.forEach((transaction) => {
      if (categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] += transaction.amount;
      } else {
        categoryTotals[transaction.category] = transaction.amount;
      }
    });

    return Object.keys(categoryTotals).map((category) => ({
      name: category,
      amount: categoryTotals[category],
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Generar un color aleatorio
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    }));
  };

  // Función para generar las etiquetas del gráfico de líneas
  const generateLabels = (period) => {
    const labels = [];
    const today = moment();
    
    switch (period) {
      case 'day':
        for (let i = 0; i < 7; i++) {
          labels.push(today.subtract(6 - i, 'days').format('DD/MM'));
        }
        break;
      case 'week':
        for (let i = 0; i < 7; i++) {
          labels.push(today.subtract(6 - i, 'days').format('ddd'));
        }
        break;
      case 'month':
        for (let i = 0; i < 4; i++) {
          labels.push(today.subtract(3 - i, 'weeks').format('DD/MM'));
        }
        break;
      case 'year':
        for (let i = 0; i < 12; i++) {
          labels.push(today.subtract(11 - i, 'months').format('MM/YYYY'));
        }
        break;
      default:
        break;
    }
    
    return labels;
  };

  // Verificar que haya transacciones antes de generar datos del gráfico
  const chartData = {
    labels: generateLabels('month'), // Cambia esto a 'day', 'week', o 'year' según la selección
    datasets: [
      {
        data: transactions.length > 0 ? transactions.map((transaction) => transaction.amount) : [0],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Línea morada
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffffff',
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Título de la página */}
      <Text style={styles.screenTitle}>Datos</Text>

      {/* Selección entre Gastos e Ingresos */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Expenses' && styles.activeTab]}
          onPress={() => setSelectedTab('Expenses')}
        >
          <Text style={[styles.tabText, selectedTab === 'Expenses' && styles.activeTabText]}>
            Gastos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Income' && styles.activeTab]}
          onPress={() => setSelectedTab('Income')}
        >
          <Text style={[styles.tabText, selectedTab === 'Income' && styles.activeTabText]}>
            Ingresos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico de líneas */}
      <LineChart
        data={chartData}
        width={screenWidth * 0.95}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        fromZero={true}
      />

      {/* Gráfico de torta */}
      <Text style={styles.chartTitle}>Distribución por Categoría</Text>
      <PieChart
        data={processPieData(selectedTab === 'Expenses' ? 'Egreso' : 'Ingreso')}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor={'amount'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        absolute
        style={styles.pieChart}
      />

      {/* Historial de transacciones */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Última Actividad</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver Todo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <LinearGradient colors={['#511496', '#885fd8']} style={styles.iconContainer}>
              <Text style={styles.icon}>💸</Text>
            </LinearGradient>
            <View style={styles.details}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.amount}>
              {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    fontWeight: '900',
    color: '#511496',
    textAlign: 'center',
    marginVertical: 10,
    paddingTop: 25,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#ececec',
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#511496',
  },
  tabText: {
    fontSize: 16,
    color: '#6d6d6d',
  },
  activeTabText: {
    color: '#fff',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 20,
  },
  pieChart: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#511496',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#511496',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    paddingBottom: 10,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#511496',
  },
});
