import React, { useState, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Slider } from "react-native-elements";
import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import registerActivity from "../components/RegisterActivity";

const InversionScreen = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulationDuration, setSimulationDuration] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState("BancoEstado");
  const [propósitoAhorro, setPropósitoAhorro] = useState("");
  const [result, setResult] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [investorProfile, setInvestorProfile] = useState("Desconocido");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("Simulación");

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

      const calculateInvestorProfile = (answers, income, expenses) => {
        const spendingRatio = expenses / income;
        const questionsWeight =
          answers.riskTolerance === "Alto"
            ? 0.3
            : answers.riskTolerance === "Medio"
            ? 0.5
            : 0.7;
        if (answers.riskTolerance === "Alto" && spendingRatio < 0.3) {
          return "Arriesgado";
        } else if (questionsWeight > 0.5 || spendingRatio < 0.6) {
          return "Moderado";
        } else if (answers.longTermGoal === "Sí" && spendingRatio < 0.4) {
          return "Planificador";
        } else if (answers.incomeStability === "Estable") {
          return "Conservador";
        } else {
          return "Precavido";
        }
      };

      if (totalIngresos > 0) {
        const profile = calculateInvestorProfile(
          quizAnswers,
          totalIngresos,
          totalGastos
        );
        setInvestorProfile(profile);
      } else {
        setInvestorProfile("Perfil no disponible");
      }
    });

    return () => unsubscribe();
  }, [quizAnswers]);

  const handleSimulation = () => {
    if (balance === null || balance === 0) {
      alert("Saldo insuficiente para la simulación.");
      return;
    }

    const bankRate = banks[selectedBank].rate;
    const initialBalance = balance;
    const saldoAhorro =
      initialBalance * Math.pow(1 + bankRate, simulationDuration);
    const intereses = saldoAhorro - initialBalance;

    const data = Array.from(
      { length: simulationDuration },
      (_, i) => initialBalance * Math.pow(1 + bankRate, i + 1)
    );
    setGrowthData(data);

    setResult({ initialBalance, intereses, saldoAhorro });
    setIsModalVisible(true);
  };

  const handleQuizCompletion = () => {
    setIsQuizModalVisible(false);
  };

  const openQuiz = () => {
    setIsQuizModalVisible(true);
  };

  const quizQuestions = [
    {
      question: "¿Cuentas con experiencia en el mundo de las inversiones?",
      key: "experienciaInversiones",
      options: [
        "Ninguna",
        "Depósitos a plazo",
        "Fondos de inversión",
        "Operaciones bursátiles",
        "Experiencia en estrategias avanzadas de inversión",
      ],
    },
    {
      question: "¿Cuál es el plazo máximo que mantendrías tus inversiones?",
      key: "plazoInversiones",
      options: [
        "Hasta 1 mes",
        "Hasta 3 meses",
        "Hasta 6 meses",
        "Hasta 1 año",
        "Entre 1 y 3 años",
        "Más de 3 años",
      ],
    },
    {
      question:
        "¿Cuál de las siguientes afirmaciones describe mejor tu tolerancia al riesgo?",
      key: "afirmacionRiesgo",
      options: [
        "No invertir si hay riesgos",
        "Aceptar un riesgo mínimo",
        "Asumir un riesgo moderado si hay mejores perspectivas de ganancia",
        "Buscar el mayor rendimiento posible, sin importar los riesgos",
      ],
    },
    {
      question:
        "¿Qué harías si el valor de tus inversiones sufre una baja importante?",
      key: "accionBajaInversion",
      options: [
        "Retirar inmediatamente",
        "Extraer parcialmente las inversiones",
        "Conservar las inversiones esperando una recuperación",
        "Invertir más aprovechando la baja",
      ],
    },
    {
      question: "¿Qué seguro elegirías para un auto nuevo?",
      key: "seguroAuto",
      options: [
        "Cobertura completa",
        "Cobertura parcial",
        "Contra terceros",
        "Ninguno",
      ],
    },
    {
      question:
        "¿Cuál de las siguientes opciones de inversión te resulta más cómoda?",
      key: "opcionInversion",
      options: [
        "Mantener el capital",
        "Superar el rendimiento de un depósito a plazo",
        "Obtener una renta moderada afrontando posibles riesgos",
        "Conseguir mayor rentabilidad más allá del riesgo",
      ],
    },
    {
      question:
        "Si el valor de tus activos sube abruptamente, ¿hasta qué porcentaje de ganancias considerarías vender?",
      key: "porcentajeGanancias",
      options: [
        "Hasta un 10%",
        "Hasta un 20%",
        "Hasta un 50%",
        "Hasta un 65%",
        "Más del 65%",
      ],
    },
    {
      question:
        "Frente a una pérdida en el valor de tus activos, ¿en qué porcentaje retirarías la inversión?",
      key: "porcentajePerdidas",
      options: [
        "Hasta un 10%",
        "Hasta un 20%",
        "Hasta un 50%",
        "Hasta un 65%",
        "Más del 65%",
      ],
    },
    {
      question:
        "Del total de tu patrimonio, ¿cuál es el porcentaje líquido disponible?",
      key: "porcentajeLiquido",
      options: [
        "Menos del 5%",
        "Entre el 5% y 20%",
        "Entre el 20% y 50%",
        "Entre el 50% y 70%",
        "Más del 70%",
      ],
    },
    {
      question:
        "¿Qué porcentaje de tu patrimonio líquido estarías dispuesto a invertir?",
      key: "porcentajeInversionLiquido",
      options: [
        "Menos del 20%",
        "Entre el 20% y 40%",
        "Entre el 40% y 65%",
        "Más del 65%",
      ],
    },
  ];

  const getSuggestedMonth = (profile) => {
    const recommendations = {
      Arriesgado: {
        month: "Marzo",
        reason:
          "Iniciar en marzo te permitirá aprovechar el crecimiento inicial del mercado luego de los ajustes anuales, ideal para estrategias de mayor riesgo.",
      },
      Moderado: {
        month: "Mayo",
        reason:
          "Invertir en mayo puede ofrecer estabilidad luego de los primeros meses del año, un buen balance entre riesgo y seguridad para perfiles moderados.",
      },
      Conservador: {
        month: "Agosto",
        reason:
          "En agosto, el mercado tiende a estabilizarse después de mitad de año, una excelente oportunidad para perfiles conservadores que buscan seguridad.",
      },
      Planificador: {
        month: "Octubre",
        reason:
          "Octubre es un buen mes para aprovechar oportunidades de planificación de fin de año y ajustar estrategias de largo plazo.",
      },
      Precavido: {
        month: "Diciembre",
        reason:
          "Diciembre ofrece estabilidad a fin de año, ideal para inversiones seguras y perfiles que priorizan la liquidez.",
      },
    };

    return (
      recommendations[profile] || {
        month: "No disponible",
        reason: "No hay una recomendación específica para tu perfil.",
      }
    );
  };

  const { month, reason } = getSuggestedMonth(investorProfile);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "InversionScreen",
        description: 'Usuario visita la página de Inversion', 
        });
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#511496", "#885fd8"]} style={styles.header}>
        <View style={styles.headerContent}>
          {/* Botón de retroceso */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Datos", { tab: "Gráficos" })} // Asegúrate de que "Datos" es el nombre correcto en el Navigator
          >
            <MaterialCommunityIcons name="arrow-left" size={35} color="white" />
          </TouchableOpacity>

          {/* Título */}
          <Text style={styles.headerTitle}>Inversiones</Text>

          {/* Botón de ayuda */}
          <TouchableOpacity onPress={openQuiz} style={styles.helpIcon}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Contenido del encabezado */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="white"
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            <Text style={styles.balanceAmount}>
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(balance)}
            </Text>
            <Text style={styles.balanceDate}>
              Saldo actual - {new Date().toLocaleDateString("es-CL")}
            </Text>
          </>
        )}
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "Recomendaciones" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Recomendaciones")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Recomendaciones" && styles.activeTabText,
            ]}
          >
            Recomendaciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Simulación" && styles.activeTab]}
          onPress={() => setActiveTab("Simulación")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Simulación" && styles.activeTabText,
            ]}
          >
            Simulación
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "Recomendaciones" && (
        <View style={styles.profileSection}>
          <Text style={styles.investorProfile}>
            Perfil de Inversor: {investorProfile}
          </Text>
          <Text style={styles.recommendationText}>
            {investorProfile === "Arriesgado" &&
              "Como inversor arriesgado, considera invertir en activos con mayor riesgo como acciones para obtener mejores rendimientos a largo plazo."}
            {investorProfile === "Moderado" &&
              "Como inversor moderado, una cartera balanceada entre acciones y bonos podría ser ideal para ti."}
            {investorProfile === "Conservador" &&
              "Como inversor conservador, opta por inversiones seguras, como bonos y cuentas de ahorro."}
            {investorProfile === "Planificador" &&
              "Tu perfil de planificador sugiere que te enfoques en inversiones con retorno estable y diversificación de riesgo."}
            {investorProfile === "Precavido" &&
              "Un perfil precavido indica que prefieres evitar el riesgo; prioriza inversiones de bajo riesgo y liquidez."}
          </Text>
          <Text style={styles.recommendationText}>
            Mes sugerido para invertir: {month}
          </Text>
          <Text style={styles.recommendationReason}>{reason}</Text>
        </View>
      )}

      {activeTab === "Simulación" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simulación de Inversión</Text>
          <Text style={styles.label}>Propósito de tu ahorro:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ejemplo: Automóvil"
            value={propósitoAhorro}
            onChangeText={setPropósitoAhorro}
          />
          <Text style={styles.label}>Selecciona un Banco:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bankCarousel}
          >
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
                <Text style={styles.bankRate}>
                  Tasa anual: {(banks[key].rate * 100).toFixed(2)}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>Tiempo de ahorro (en años):</Text>
          <Slider
            value={simulationDuration}
            onValueChange={(value) => setSimulationDuration(value)}
            minimumValue={1}
            maximumValue={5}
            step={1}
            thumbProps={{
              children: (
                <Image
                  source={require("../assets/billete.png")}
                  style={{ width: 40, height: 40 }}
                />
              ),
            }}
            minimumTrackTintColor="#885fd8"
            maximumTrackTintColor="#ddd"
            trackStyle={{ backgroundColor: "transparent" }}
            thumbStyle={{ backgroundColor: "transparent" }}
            style={styles.slider}
          />
          <Text style={[styles.sliderValue, { marginBottom: 20 }]}>
            {simulationDuration} años
          </Text>
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={handleSimulation}
          >
            <Text style={styles.simulateButtonText}>Simular</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal del cuestionario */}
      <Modal
        visible={isQuizModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Quiz Perfil Inversor</Text>

            <ScrollView>
              {quizQuestions.map((q, index) => (
                <View key={index} style={styles.questionContainer}>
                  {/* Barra de progreso */}
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${
                            ((index + 1) / quizQuestions.length) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.modalText}>{q.question}</Text>

                  <View style={styles.buttonGroup}>
                    {q.options.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() =>
                          setQuizAnswers({ ...quizAnswers, [q.key]: option })
                        }
                        style={[
                          styles.optionButton,
                          quizAnswers[q.key] === option &&
                            styles.selectedOptionButton, // Resalta la opción seleccionada
                        ]}
                      >
                        <Text style={styles.optionButtonText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleQuizCompletion}
              >
                <Text style={styles.completeButtonText}>Completar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                <Text style={styles.modalText}>
                  Tu saldo: ${result.initialBalance.toFixed(0)}
                </Text>
                <Text style={styles.modalText}>
                  Intereses recibidos: ${result.intereses.toFixed(0)}
                </Text>
                <Text style={styles.modalText}>
                  Saldo de tu ahorro: ${result.saldoAhorro.toFixed(0)}
                </Text>
              </>
            )}
            <LineChart
              data={{
                labels: Array.from(
                  { length: simulationDuration },
                  (_, i) => `${new Date().getFullYear() + i}`
                ),
                datasets: [{ data: growthData }],
              }}
              width={screenWidth * 0.8}
              height={200}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#e3d8f1",
                backgroundGradientTo: "#d3bce6",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(136, 95, 216, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                fillShadowGradient: "#d1b3ff",
                fillShadowGradientOpacity: 0.3,
                propsForDots: {
                  r: "6",
                  fill: "#a48edc",
                  strokeWidth: "2",
                  stroke: "#885fd8",
                },
              }}
              bezier
              style={{ marginVertical: 10, borderRadius: 8 }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, color: "white", fontWeight: "bold" },
  balanceAmount: { fontSize: 30, color: "white", marginTop: 20 },
  balanceDate: { fontSize: 16, color: "white", marginTop: 5, opacity: 0.9 },
  profileSection: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  investorProfile: {
    fontSize: 18,
    color: "#511496",
    fontWeight: "bold",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#f0f0f5",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#511496",
  },
  tabText: {
    fontSize: 16,
    color: "#511496",
  },
  activeTabText: {
    color: "#ffffff",
  },
  section: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f5",
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#511496",
    marginBottom: 10,
  },
  label: { fontSize: 16, color: "#333", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  slider: { marginBottom: 15 },
  sliderValue: { fontSize: 16, color: "#511496", textAlign: "center" },
  simulateButton: {
    backgroundColor: "#511496",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  simulateButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  recommendationText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 15,
  },
  recommendationReason: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 10,
  },
  helpIcon: { paddingRight: 15 },
  bankCarousel: { marginBottom: 15 },
  bankCard: {
    padding: 15,
    backgroundColor: "#f0f0f5",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    width: Dimensions.get("window").width * 0.6,
  },
  selectedBankCard: { borderColor: "#511496", borderWidth: 2 },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#511496",
    textAlign: "center",
  },
  bankRate: { fontSize: 14, color: "#333", textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#511496",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#885fd8",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  optionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  picker: {
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f5",
    borderRadius: 8,
    marginVertical: 10,
  },
  completeButton: {
    backgroundColor: "#511496",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  completeButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#511496",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  closeButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  questionContainer: { marginBottom: 15 },

  progressContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#511496",
  },

  questionContainer: {
    marginBottom: 15,
    backgroundColor: "#f0f0f5",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#511496",
    marginBottom: 15,
    textAlign: "center",
  },

  modalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 15,
    fontWeight: "bold",
  },

  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#885fd8",
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    minWidth: "40%",
    alignItems: "center",
  },
  selectedOptionButton: {
    backgroundColor: "#511496", // Color de fondo diferente para la opción seleccionada
  },

  optionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  completeButton: {
    backgroundColor: "#511496",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 10,
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default InversionScreen;
