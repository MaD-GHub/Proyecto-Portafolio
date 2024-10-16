import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, TextInput } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
=======
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
>>>>>>> d50809b41a823fa934e07436044d9faba9a5d2fa
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase'; // Importar Firebase auth y Firestore
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Firestore funciones
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';  // Cambiado aquí

export default function DatosScreen() {
<<<<<<< HEAD
  const [selectedTab, setSelectedTab] = useState('Expenses'); // 'Expenses', 'Income', o 'Simulation'
  const [electrodomestico, setElectrodomestico] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [horasUso, setHorasUso] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  
=======
  const [selectedTab, setSelectedTab] = useState('Expenses'); // 'Expenses' o 'Income'
  const [transactions, setTransactions] = useState([]); // Estado para almacenar las transacciones
  const [savings, setSavings] = useState([]); // Estado para almacenar los ahorros
>>>>>>> d50809b41a823fa934e07436044d9faba9a5d2fa
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

// Cálculo del costo mensual basado en el tipo de electrodoméstico, clasificación y horas de uso
const calcularCostoMensual = () => {
  let consumoBaseKWh;

  // Define consumo básico de acuerdo al tipo de electrodoméstico
  switch (electrodomestico) {
    case 'refrigerador':
      consumoBaseKWh = 1; // Consumo por día en kWh
      break;
    case 'lavadora':
      consumoBaseKWh = 0.5; // Consumo por ciclo en kWh
      break;
    case 'televisor':
      consumoBaseKWh = 0.1; // Consumo por hora en kWh
      break;
    case 'microondas':
      consumoBaseKWh = 1.2; // Consumo por hora en kWh
      break;
    default:
      consumoBaseKWh = 0;
  }

  // Define multiplicador basado en clasificación energética
  let multiplicadorClasificacion;
  switch (clasificacion) {
    case 'A+++':
      multiplicadorClasificacion = 0.8;
      break;
    case 'A++':
      multiplicadorClasificacion = 0.85;
      break;
    case 'A+':
      multiplicadorClasificacion = 0.9;
      break;
    case 'A':
      multiplicadorClasificacion = 1;
      break;
    case 'B':
      multiplicadorClasificacion = 1.1;
      break;
    case 'C':
      multiplicadorClasificacion = 1.2;
      break;
    case 'D':
      multiplicadorClasificacion = 1.3;
      break;
    case 'E':
      multiplicadorClasificacion = 1.4;
      break;
    case 'F':
      multiplicadorClasificacion = 1.5;
      break;
    case 'G':
      multiplicadorClasificacion = 1.6;
      break;
    default:
      multiplicadorClasificacion = 1;
  }

  // Cálculo del costo basado en horas de uso y consumo
  const horas = parseFloat(horasUso);
  if (!isNaN(horas) && consumoBaseKWh > 0) {
    const consumoMensual = consumoBaseKWh * horas * 30 * multiplicadorClasificacion;
    const costoPorKWh = 150; // Precio en CLP por kWh
    const costoMensual = consumoMensual * costoPorKWh;
    setTotalCost(costoMensual);
  } else {
    setTotalCost(0);
  }
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

<<<<<<< HEAD
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Simulation' && styles.activeTab]}
          onPress={() => setSelectedTab('Simulation')}
        >
          <Text style={[styles.tabText, selectedTab === 'Simulation' && styles.activeTabText]}>
            Simulación
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mostrar el gráfico o simulación según la pestaña seleccionada */}
      {selectedTab === 'Simulation' ? (
        <View style={styles.simulationContainer}>
          <Text style={styles.simulationTitle}>Simular consumo de electrodoméstico</Text>

          <Picker
            selectedValue={electrodomestico}
            onValueChange={(itemValue) => setElectrodomestico(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un electrodoméstico" value="" />
            <Picker.Item label="Refrigerador" value="refrigerador" />
            <Picker.Item label="Lavadora" value="lavadora" />
            <Picker.Item label="Televisor" value="televisor" />
            <Picker.Item label="Microondas" value="microondas" />
          </Picker>

          <Picker
            selectedValue={clasificacion}
            onValueChange={(itemValue) => setClasificacion(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione una clasificación energética" value="" />
            <Picker.Item label="A+++" value="A+++" />
            <Picker.Item label="A++" value="A++" />
            <Picker.Item label="A+" value="A+" />
            <Picker.Item label="A" value="A" />
            <Picker.Item label="B" value="B" />
            <Picker.Item label="C" value="C" />
            <Picker.Item label="D" value="D" />
            <Picker.Item label="E" value="E" />
            <Picker.Item label="F" value="F" />
            <Picker.Item label="G" value="G" />
          </Picker>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ingrese horas de uso al día"
            value={horasUso}
            onChangeText={setHorasUso}
          />

          <TouchableOpacity style={styles.calculateButton} onPress={calcularCostoMensual}>
            <Text style={styles.calculateButtonText}>Calcular Costo</Text>
          </TouchableOpacity>

          <Text style={styles.totalCost}>Costo Mensual: {totalCost.toFixed(2)} CLP</Text>
        </View>
      ) : (
        <>
          <LineChart
            data={chartData}
            width={screenWidth * 0.95}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            withShadow={false}
            fromZero={true}
          />

          {/* Sección de Categorías y Gastos/Ingresos */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Última Actividad</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver Todo</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de categorías según la selección de ingresos o gastos */}
          <FlatList
            data={selectedTab === 'Expenses' ? expenseCategories : incomeCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <LinearGradient colors={['#511496', '#885fd8']} style={styles.iconContainer}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </LinearGradient>
                <View style={styles.details}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={[styles.amount, item.amount < 0 ? styles.negativeAmount : styles.positiveAmount]}>
                  {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
=======
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
>>>>>>> d50809b41a823fa934e07436044d9faba9a5d2fa
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
  simulationContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  simulationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    marginBottom: 10,
    borderRadius: 5,
  },
  calculateButton: {
    backgroundColor: '#511496',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCost: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
