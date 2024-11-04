// SimulacionScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import AddTransactionModal from "../components/AddTransactionModal";
import Timeline from "../components/Timeline";
import TransactionHistory from "../components/TransactionHistory";
import SimulatedTransactionHistory from "../components/SimulatedTransactionHistory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc } from "firebase/firestore"; // Importa addDoc
import registerActivity from "../components/registerActivity";


// Funciones auxiliares
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const SimulacionScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmExitModal, setConfirmExitModal] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const heightAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
    checkSimulationSession();
  }, []);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "SimulacionScreen",
        description: 'Usuario visita la página de simulación.', 
        });
    }
  }, []);

  const checkSimulationSession = async () => {
    const simulationActive = await AsyncStorage.getItem("simulationActive");
    if (simulationActive === "true") {
      Alert.alert(
        "Modo Simulación Activo",
        "¿Deseas continuar la simulación o comenzar una nueva?",
        [
          { text: "Continuar", onPress: fetchTransactions },
          { text: "Comenzar nueva", onPress: clearSimulatedTransactions },
        ]
      );
    } else {
      fetchTransactions();
    }
  };

  const fetchTransactions = () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(fetchedTransactions);
      calculateTotals(fetchedTransactions);
    });

    return () => unsubscribe();
  };

  const calculateTotals = (transacciones) => {
    const ingresos = transacciones
      .filter((trans) => trans.type === "Ingreso")
      .reduce((total, trans) => total + parseFloat(trans.amount), 0);

    const gastos = transacciones
      .filter((trans) => trans.type === "Gasto")
      .reduce((total, trans) => total + parseFloat(trans.amount), 0);

    setTotalIngresos(ingresos);
    setTotalGastos(gastos);
    setTotalSaved(ingresos - gastos);
  };

  const toggleLabel = () => {
    setIsOpen(!isOpen);
    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Función para guardar una nueva transacción en Firebase
  const handleSaveTransaction = async (transaction) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId: user.uid, // Añade el ID de usuario
      });
      console.log("Transacción simulada guardada exitosamente.");
    } catch (error) {
      console.error("Error al guardar la transacción simulada:", error);
    }
  };

  const clearSimulatedTransactions = async () => {
    const simulatedTransactions = transactions.filter(
      (trans) => trans.simulation === true
    );

    const batch = simulatedTransactions.map((trans) =>
      deleteDoc(doc(db, "transactions", trans.id))
    );

    await Promise.all(batch);
    setTransactions((prev) =>
      prev.filter((trans) => trans.simulation !== true)
    );
    await AsyncStorage.setItem("simulationActive", "false");
  };

  const handleExitSimulation = async () => {
    await clearSimulatedTransactions();
    setConfirmExitModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#511496", "#885fd8"]}
        style={styles.balanceContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setConfirmExitModal(true)}
        >
          <MaterialCommunityIcons name="pause" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.balanceAmount}>{formatCurrency(totalSaved)}</Text>
        <Text style={styles.balanceDate}>Saldo actual - {getTodayDate()}</Text>

        <TouchableOpacity onPress={toggleLabel} style={styles.chevronContainer}>
          <View style={styles.chevronLine} />
          <MaterialCommunityIcons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color="white"
            style={styles.chevronIcon}
          />
          <View style={styles.chevronLine} />
        </TouchableOpacity>

        <Animated.View style={[styles.labelContainer, { height: heightAnim }]}>
          <LinearGradient
            colors={["#cb70e1", "#885fd8"]}
            style={styles.labelGradient}
          >
            <View style={styles.labelContent}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total Ingresos</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(totalIngresos)}
                </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total Gastos</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(totalGastos)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>

      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        ListHeaderComponent={
          <>
            <Timeline transactions={transactions} />
            <SimulatedTransactionHistory transactions={transactions} />
          </>
        }
        ListFooterComponent={<TransactionHistory transactions={transactions} />}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={modalVisible}
        onSave={handleSaveTransaction} // Usar la función para guardar en Firebase
        onClose={() => setModalVisible(false)}
      />

      <Modal
        visible={confirmExitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConfirmExitModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Salir del modo simulación</Text>
            <Text style={styles.modalText}>
              Estás a punto de salir del modo simulación. Se perderán todos los
              datos de la simulación actual. ¿Deseas continuar?
            </Text>
            <View style={styles.modalButtonContainer}>
              <LinearGradient
                colors={["#B0B0B0", "#8C8C8C"]}
                style={styles.buttonGradient}
              >
                <TouchableOpacity
                  style={styles.button21}
                  onPress={() => setConfirmExitModal(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={["#511496", "#885FD8"]}
                style={styles.buttonGradient}
              >
                <TouchableOpacity
                  style={styles.button21}
                  onPress={handleExitSimulation}
                >
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* Tu código de estilos existente aquí */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#511496",
  },
  modalText: {
    marginVertical: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  buttonGradient: {
    borderRadius: 25,
    overflow: "hidden",
    marginHorizontal: 10, // Margen igual para ambos botones
    marginTop: 10,
  },
  button21: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 5,
    borderRadius: 5,
  },
  balanceContainer: { padding: 20, alignItems: "center" },
  balanceAmount: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 36,
    color: "white",
    marginTop: 80,
  },
  balanceDate: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  chevronContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  chevronLine: { height: 1, backgroundColor: "black", width: 80 },
  chevronIcon: { marginHorizontal: 10 },
  labelContainer: {
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  labelGradient: { width: "100%", padding: 10, borderRadius: 10 },
  labelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  totalItem: { alignItems: "center", width: "50%" },
  totalLabel: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 16,
    color: "white",
  },
  totalAmount: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 24,
    color: "white",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#885fd8",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
});

export default SimulacionScreen;
