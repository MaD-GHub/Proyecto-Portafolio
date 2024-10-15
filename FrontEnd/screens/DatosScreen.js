import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, TextInput } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';  // Cambiado aquí

export default function DatosScreen() {
  const [selectedTab, setSelectedTab] = useState('Expenses'); // 'Expenses', 'Income', o 'Simulation'
  const [electrodomestico, setElectrodomestico] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [horasUso, setHorasUso] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  
  const screenWidth = Dimensions.get('window').width;

  // Datos de prueba para las categorías de gastos
  const expenseCategories = [
    { id: '1', category: 'Comidas y Bebidas', amount: -200, date: 'Oct 10, 12:21 pm', icon: '🍔' },
    { id: '2', category: 'Vestuario', amount: -150, date: 'Oct 9, 3:30 pm', icon: '👗' },
    { id: '3', category: 'Alojamiento', amount: -800, date: 'Oct 7, 9:00 am', icon: '🏠' },
    { id: '4', category: 'Salud', amount: -250, date: 'Oct 5, 11:15 am', icon: '🏥' },
    { id: '5', category: 'Transporte', amount: -75, date: 'Oct 3, 8:00 am', icon: '🚗' },
    { id: '6', category: 'Educación', amount: -300, date: 'Oct 1, 10:00 am', icon: '🎓' },
  ];

  // Datos de prueba para las categorías de ingresos
  const incomeCategories = [
    { id: '1', category: 'Salario', amount: 1500, date: 'Oct 10, 12:21 pm', icon: '💼' },
    { id: '2', category: 'Ventas de Producto', amount: 800, date: 'Oct 9, 3:30 pm', icon: '🛒' },
  ];

  // Generar etiquetas de meses
  const generateMonthLabels = () => {
    const currentMonthIndex = moment().month();
    const months = [];
    for (let i = 0; i < 7; i++) {
      months.push(moment().month((currentMonthIndex + i) % 12).format('MMM'));
    }
    return months;
  };

  // Datos de prueba para el gráfico
  const chartData = {
    labels: generateMonthLabels(),
    datasets: [
      {
        data: selectedTab === 'Expenses' ? [500, 700, 800, 320, 900, 600, 700] : [1000, 1100, 900, 320, 1150, 920, 970],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Línea en degradado morado
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
    withVerticalLines: false,
    withHorizontalLines: false,
    withInnerLines: false,
    propsForBackgroundLines: {
      stroke: 'transparent',
    },
    withVerticalLabels: true,
    withHorizontalLabels: true,
    labelFontSize: 14,
    labelFontWeight: 'bold',
    propsForHorizontalLabels: {
      fill: '#000',
      fontWeight: 'bold',
    },
    propsForVerticalLabels: {
      fill: '#000',
      fontWeight: 'bold',
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
    <View style={styles.container}>
      {/* Título de la página con el estilo de Actualidad */}
      <Text style={styles.screenTitle}>Datos</Text>

      {/* Apartado de selección de gráfico */}
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
    color: 'white',
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#885fd8',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  negativeAmount: {
    color: '#ff3b30',
  },
  positiveAmount: {
    color: '#4cd964',
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