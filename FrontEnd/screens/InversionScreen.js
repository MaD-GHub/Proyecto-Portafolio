import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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
  const [simulationDuration, setSimulationDuration] = useState(1); // en años
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState("BancoEstado"); // Banco seleccionado
  const [propósitoAhorro, setPropósitoAhorro] = useState('');
  const [result, setResult] = useState(null); // Para guardar el resultado de la simulación
  const [growthData, setGrowthData] = useState([]); // Datos para el gráfico

  // Configuración de los bancos y tasas
  const banks = {
    BancoEstado: { name: "BancoEstado – Ahorro Premium", rate: 0.017 },
    BancoChile: { name: "Banco de Chile – Cuenta FAN Ahorro", rate: 0.0216 },
    MercadoPago: { name: "Mercado Pago", rate: 0.052 },
  };

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

  const handleSimulation = () => {
    if (balance === null || balance === 0) {
      alert("Saldo insuficiente para la simulación.");
      return;
    }

    const bankRate = banks[selectedBank].rate;
    const initialBalance = balance;
    const saldoAhorro = initialBalance * Math.pow(1 + bankRate, simulationDuration);
    const intereses = saldoAhorro - initialBalance;

    // Genera los datos del gráfico para cada año
    const data = Array.from({ length: simulationDuration }, (_, i) =>
      initialBalance * Math.pow(1 + bankRate, i + 1)
    );
    setGrowthData(data);

    // Guarda el resultado y muestra el modal
    setResult({ initialBalance, intereses, saldoAhorro });
    setIsModalVisible(true);
  };

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

      {/* Sección de Simulación de Inversión */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulación de Inversión</Text>

        <Text style={styles.label}>Propósito de tu ahorro:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Automóvil"
          value={propósitoAhorro}
          onChangeText={setPropósitoAhorro}
        />

        {/* Selector de bancos */}
        <Text style={styles.label}>Selecciona un Banco:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankCarousel}>
          {Object.keys(banks).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.bankCard,
                selectedBank === key && styles.selectedBankCard,
              ]}
              onPress={() => setSelectedBank(key)}
            >
              <Text style={styles.bankName}>{banks[key].name}</Text>
              <Text style={styles.bankRate}>Tasa anual: {(banks[key].rate * 100).toFixed(2)}%</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Tiempo de ahorro (en años):</Text>
        <Slider
          value={simulationDuration}
          onValueChange={(value) => setSimulationDuration(value)}
          minimumValue={1}
          maximumValue={5} // Cambiado a años
          step={1}
          thumbProps={{
            children: (
              <Image
                source={require('../assets/billete.png')}
                style={{ width: 40, height: 40 }}
              />
            ),
          }}
          minimumTrackTintColor="#885fd8"
          maximumTrackTintColor="#ddd"
          trackStyle={{ backgroundColor: 'transparent' }}
          thumbStyle={{ backgroundColor: 'transparent' }}
          style={styles.slider}
        />
        <Text style={[styles.sliderValue, { marginBottom: 20 }]}>{simulationDuration} años</Text>

        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulation}>
          <Text style={styles.simulateButtonText}>Simular</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Resultados */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Resultados de la Simulación</Text>
            {result && (
              <>
                <Text style={styles.modalText}>Tu saldo: ${result.initialBalance.toFixed(0)}</Text>
                <Text style={styles.modalText}>Intereses recibidos: ${result.intereses.toFixed(0)}</Text>
                <Text style={styles.modalText}>Saldo de tu ahorro: ${result.saldoAhorro.toFixed(0)}</Text>
              </>
            )}

            {/* Gráfico de Crecimiento Proyectado */}
            {growthData.length > 0 && (
              <LineChart
                data={{
                  labels: Array.from({ length: simulationDuration }, (_, i) => `${new Date().getFullYear() + i}`),
                  datasets: [{ data: growthData }],
                }}
                width={screenWidth * 0.8}
                height={200}
                yAxisLabel="$"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#e3d8f1',
                  backgroundGradientTo: '#d3bce6',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(136, 95, 216, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  fillShadowGradient: '#d1b3ff',
                  fillShadowGradientOpacity: 0.3,
                  propsForDots: {
                    r: '6',
                    fill: '#a48edc',
                    strokeWidth: '2',
                    stroke: '#885fd8',
                  },
                }}
                bezier
                style={{ marginVertical: 10, borderRadius: 8 }}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
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
  balanceAmount: { fontSize: 30, color: 'white', marginTop: 20 },
  balanceDate: { fontSize: 16, color: 'white', marginTop: 5, opacity: 0.9 },
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
  label: { fontSize: 16, color: '#333', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, fontSize: 16, marginBottom: 15 },
  slider: { marginBottom: 15 },
  sliderValue: { fontSize: 16, color: '#511496', textAlign: 'center' },
  simulateButton: { backgroundColor: '#511496', padding: 15, borderRadius: 8, alignItems: 'center' },
  simulateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  helpIcon: { paddingRight: 15 },
  bankCarousel: { marginBottom: 15 },
  bankCard: {
    padding: 15,
    backgroundColor: '#f0f0f5',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.6,
  },
  selectedBankCard: { borderColor: '#511496', borderWidth: 2 },
  bankName: { fontSize: 16, fontWeight: 'bold', color: '#511496', textAlign: 'center' },
  bankRate: { fontSize: 14, color: '#333', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#511496', marginBottom: 10 },
  modalText: { fontSize: 16, color: '#333', marginVertical: 5 },
  closeButton: { backgroundColor: '#511496', padding: 10, borderRadius: 8, marginTop: 15 },
  closeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default InversionScreen;
