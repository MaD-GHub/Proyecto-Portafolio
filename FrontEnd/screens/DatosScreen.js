import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, TextInput } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import registerActivity from "../components/registerActivity";
import { auth } from "../firebase";

import InversionScreen from './InversionScreen'; // Importar la pantalla de Inversión

export default function DatosScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('Expenses'); // 'Expenses', 'Income', o 'Inversiones'

  const screenWidth = Dimensions.get('window').width;

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "DatosScreen",
        description: 'Usuario visita la página DatosScreen.', 
        });
    }
  }, []);

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
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
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

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Datos</Text>

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
          style={[styles.tabButton, selectedTab === 'Inversiones' && styles.activeTab]}
          onPress={() => navigation.navigate('Inversiones')} // Navega a la pantalla de Inversiones
        >
          <Text style={[styles.tabText, selectedTab === 'Inversiones' && styles.activeTabText]}>
            Inversiones
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab !== 'Inversiones' && (
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

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Última Actividad</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver Todo</Text>
            </TouchableOpacity>
          </View>

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
    backgroundColor: "#f1f1f1",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#511496",
    textAlign: "center",
    marginVertical: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 16,
    padding: 2,
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.15, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 4, // Elevación para Android
    marginTop: 50,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
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
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Espacio al final para el scroll
  },
  graphWrapper: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 2,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 20,
    marginVertical: 5, // Espacio adicional
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.15, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
    elevation: 4, // Elevación para Android
    marginTop: 15,
  },
  filterButton: {
    flex: 1, // Ocupará todo el espacio disponible
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 1, // Espacio lateral mínimo
  },
  activeFilter: {
    backgroundColor: "#511496",
  },
  filterText: {
    fontSize: 13,
    color: "#6d6d6d",
    textAlign: "center",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  contentContainer: {
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
});
