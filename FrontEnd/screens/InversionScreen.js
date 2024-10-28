import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Slider } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit';

const InversionScreen = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulationDuration, setSimulationDuration] = useState(12); // en meses
  const [projectedBalance, setProjectedBalance] = useState(null);
  const [growthData, setGrowthData] = useState([]); // Datos para el gráfico
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para el modal de ayuda

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("Usuario no autenticado");
      setBalance(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const totalIngresos = transactions
        .filter((t) => t.type === "Ingreso")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      const totalGastos = transactions
        .filter((t) => t.type === "Gasto")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      setBalance(totalIngresos - totalGastos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getInvestmentRecommendations = () => {
    if (balance <= 500000) {
      return { type: "Cuentas de Ahorro", rate: 0.03 };
    } else if (balance <= 5000000) {
      return { type: "Fondos Balanceados", rate: 0.05 };
    } else {
      return { type: "Fondos Internacionales y ETF", rate: 0.07 };
    }
  };

  const handleSimulation = () => {
    const { rate } = getInvestmentRecommendations();
    const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
    let futureBalance = balance;
    const projectedData = [];

    for (let i = 0; i < simulationDuration; i++) {
      futureBalance *= 1 + monthlyRate;
      projectedData.push(futureBalance);
    }

    setProjectedBalance(futureBalance);
    setGrowthData(projectedData);
  };

  // Obtener el mes actual y los nombres abreviados de los meses en español
  const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const currentMonth = new Date().getMonth(); // Mes actual (0 = Enero, 11 = Diciembre)
  
  // Generar etiquetas de meses comenzando desde el mes actual
  const monthLabels = Array.from({ length: simulationDuration }, (_, i) => monthNames[(currentMonth + i) % 12]);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#511496', '#885fd8']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.helpIcon}>
            <MaterialCommunityIcons name="help-circle-outline" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inversiones</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />
        ) : (
          <Text style={styles.balanceAmount}>
            {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(balance)}
          </Text>
        )}
        <Text style={styles.balanceDate}>Saldo actual - {new Date().toLocaleDateString("es-CL")}</Text>
      </LinearGradient>

      {/* Sección de Recomendaciones de Inversión */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendaciones de Inversión</Text>
        <View style={styles.investmentCard}>
          <Text style={styles.investmentTitle}>{getInvestmentRecommendations().type}</Text>
          <Text style={styles.investmentDescription}>
            Proyecte su inversión con una tasa de crecimiento estimada.
          </Text>
        </View>
      </View>

      {/* Gráfico de Crecimiento Proyectado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crecimiento Proyectado</Text>
        {growthData.length > 0 ? (
          <LineChart
            data={{
              labels: monthLabels, // Usamos las etiquetas de meses generadas
              datasets: [{ data: growthData }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`, // Color de línea morado suave
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              fillShadowGradient: '#d1b3ff', // Relleno degradado suave debajo de la línea
              fillShadowGradientOpacity: 0.3,
              propsForDots: {
                r: '6', // Tamaño de los puntos
                fill: '#a48edc', // Color de los puntos
                strokeWidth: '2',
                stroke: '#8b5bc0', // Borde de los puntos
              },
              propsForBackgroundLines: {
                stroke: '#ffffff', // Fondo blanco para eliminar las líneas de cuadrícula
              },
              strokeWidth: 3, // Grosor de la línea
            }}
            bezier // Hace la línea curva
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <Text style={styles.simulationText}>Realiza una simulación para ver el crecimiento proyectado.</Text>
        )}
      </View>

      {/* Sección de Simulación de Crecimiento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulación de Crecimiento</Text>
        <Text style={styles.simulationText}>Duración: {simulationDuration} meses</Text>
        <Slider
          value={simulationDuration}
          onValueChange={value => setSimulationDuration(value)}
          minimumValue={1}
          maximumValue={12} // Cambiamos el máximo a 12
          step={1}
          thumbStyle={styles.sliderThumb}
          thumbProps={{
            children: (
              <Image
                source={require('../assets/billete.png')}
                style={{ width: 40, height: 40 }}
              />
            ),
          }}
          minimumTrackTintColor="#511496"
          maximumTrackTintColor="#ddd"
          style={{ width: screenWidth - 40, height: 40 }}
        />

        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulation}>
          <Text style={styles.simulateButtonText}>Simular</Text>
        </TouchableOpacity>
        {projectedBalance && (
          <Text style={styles.projectionResult}>
            Balance proyectado: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(projectedBalance)}
          </Text>
        )}
      </View>

      {/* Modal para información de ayuda */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#ffffff', '#f0f0f5']} style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cómo se calculan las simulaciones?</Text>
            
            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#511496" />
              <Text style={styles.modalSectionTitle}>1. Obtener la Tasa de Crecimiento</Text>
            </View>
            <Text style={styles.modalText}>
              Dependiendo de tu saldo actual, se asigna una tasa de crecimiento anual:
            </Text>
            <Text style={styles.bulletPoint}>• Cuentas de Ahorro: 3% anual</Text>
            <Text style={styles.bulletPoint}>• Fondos Balanceados: 5% anual</Text>
            <Text style={styles.bulletPoint}>• Fondos Internacionales y ETF: 7% anual</Text>

            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#511496" />
              <Text style={styles.modalSectionTitle}>2. Convertir a Tasa Mensual</Text>
            </View>
            <Text style={styles.modalText}>
              La tasa anual se convierte a mensual usando:{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Tasa Mensual = (1 + Tasa Anual) ^ (1 / 12) - 1</Text>
            </Text>

            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#511496" />
              <Text style={styles.modalSectionTitle}>3. Simulación del Crecimiento</Text>
            </View>
            <Text style={styles.modalText}>
              Cada mes, el saldo actual se multiplica por (1 + Tasa Mensual) para calcular el crecimiento compuesto.
            </Text>

            <View style={styles.sectionContainer}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color="#511496" />
              <Text style={styles.modalSectionTitle}>4. Proyección Final</Text>
            </View>
            <Text style={styles.modalText}>
              Al final del período, se muestra el saldo proyectado, reflejando el valor estimado después del crecimiento compuesto mensual.
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 40, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, color: 'white', fontWeight: 'bold', marginLeft: 10 },
  balanceAmount: {
    fontFamily: 'ArchivoBlack-Regular',
    fontSize: 40,
    color: 'white',
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  balanceDate: {
    fontFamily: 'QuattrocentoSans-Bold',
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#511496', marginBottom: 10 },
  investmentCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#885fd8',
  },
  investmentTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  investmentDescription: { fontSize: 15, color: '#555', marginVertical: 5, lineHeight: 22 },
  simulationText: { fontSize: 16, color: '#511496', textAlign: 'center', marginTop: 10 },
  simulateButton: {
    backgroundColor: '#511496',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  simulateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  projectionResult: { fontSize: 18, color: '#333', textAlign: 'center', marginTop: 15, fontWeight: 'bold' },
  sliderThumb: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffff',
    borderColor: '#511496',
    borderWidth: 2,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  helpIcon: { paddingRight: 15 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#511496',
    marginLeft: 5,
    textAlign: 'left',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    marginBottom: 5,
    textAlign: 'left',
  },
  closeButton: {
    backgroundColor: '#511496',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InversionScreen;
