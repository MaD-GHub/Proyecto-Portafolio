// HomeScreen.js
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import registerActivity from "../components/registerActivity"; 

// Función para obtener la fecha actual
const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Función para formatear las fechas en un formato legible
const formatDate = (date) => {
  if (!date) return "Fecha no disponible"; // Verifica si la fecha es válida
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "Fecha inválida"; // Devuelve un mensaje si la fecha es inválida
  }
  const options = { year: "numeric", month: "long", day: "numeric" };
  return parsedDate.toLocaleDateString("es-CL", options);
};

// Función para agrupar transacciones por fecha
const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.selectedDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

// Componente para la línea de tiempo (proyección financiera)
const Timeline = ({ transactions }) => {
  const [projection, setProjection] = useState([]); // Guardará la proyección futura
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  useEffect(() => {
    calculateProjection();
  }, [transactions]); // La proyección se recalcula cuando cambian las transacciones

  

  // Función para calcular la proyección
  const calculateProjection = () => {
    const projectionMonths = 6; // Proyectamos 6 meses hacia adelante
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const projectionData = [];

    let currentBalance = 0; // Balance inicial, depende de la situación del usuario

    for (let i = 0; i < projectionMonths; i++) {
      let monthlyIncome = 0; // Ingreso mensual (fijo + variable)
      let monthlyExpense = 0; // Gasto mensual (fijo + cuotas)

      // Procesamos todas las transacciones para ajustar ingresos y gastos
      transactions.forEach((transaction) => {
        const amount = parseFloat(transaction.amount);
        const isFixed = transaction.isFixed === "Fijo"; // Ingresos/Gastos fijos
        const isCurrentMonth =
          new Date(transaction.selectedDate).getMonth() ===
          (currentMonth + i) % 12;

        // Ingresos
        if (transaction.type === "Ingreso") {
          if (isFixed) {
            // Ingresos fijos cada mes
            monthlyIncome += amount;
          } else if (isCurrentMonth) {
            // Ingresos variables sólo en el mes correspondiente
            monthlyIncome += amount;
          }
        }

        // Gastos
        if (transaction.type === "Gasto") {
          if (isFixed) {
            // Gastos fijos cada mes
            monthlyExpense += amount;
          } else if (
            transaction.isInstallment &&
            transaction.installmentCount > 0
          ) {
            // Si es un gasto en cuotas, se reparte la cuota en los meses correspondientes
            const installmentAmount = amount / transaction.installmentCount;
            const startMonth = new Date(
              transaction.installmentStartDate
            ).getMonth();

            // Verificamos si la cuota aplica a este mes proyectado
            if (
              (currentMonth + i) % 12 >= startMonth &&
              (currentMonth + i) % 12 <
                startMonth + transaction.installmentCount
            ) {
              monthlyExpense += installmentAmount;
            }
          } else if (isCurrentMonth) {
            // Gastos variables sólo en el mes correspondiente
            monthlyExpense += amount;
          }
        }
      });

      // Balance mensual proyectado (ingresos - gastos)
      currentBalance += monthlyIncome - monthlyExpense;

      const projectedMonth = (currentMonth + i) % 12;
      const projectedYear = currentYear + Math.floor((currentMonth + i) / 12);

      console.log(
        `Proyección para ${months[projectedMonth]} ${projectedYear}: Ingresos: ${monthlyIncome}, Gastos: ${monthlyExpense}, Balance: ${currentBalance}`
      );

      projectionData.push({
        month: `${months[projectedMonth]} ${projectedYear}`,
        balance: currentBalance,
      });
    }

    setProjection(projectionData); // Actualizamos la proyección
  };
  
  


  // Renderizado de la línea de tiempo
  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Proyección Financiera</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          <View style={styles.timelineMonths}>
            {projection.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineVerticalLine} />
                <Text style={styles.timelineMonth}>{item.month}</Text>
                <Text style={styles.timelineBalance}>
                  {formatCurrency(item.balance)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFixed, setEditFixed] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
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
  }, []);

  // Obtener transacciones desde Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transacciones = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transacciones);
    });

    return () => unsubscribe();
  }, []);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "HomeScreen",
        description: 'Usuario visita la página Home', 
        });
    }
  }, []);

  const handleDeleteTransaction = async (id) => {
    Alert.alert(
      "Eliminar transacción",
      "¿Estás seguro de que quieres eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "transactions", id));
              setTransactions((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error("Error al eliminar transacción:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    try {
      const transactionRef = doc(db, "transactions", editingTransaction.id);
      await updateDoc(transactionRef, {
        amount: editAmount,
        category: editCategory,
        description: editDescription,
        isFixed: editFixed,
      });

      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingTransaction.id
            ? { ...item, amount: editAmount, category: editCategory, description: editDescription, isFixed: editFixed }
            : item
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar transacción:", error);
    }
  };

  const toggleLabel = () => {
    setIsOpen(!isOpen);
    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#511496", "#885fd8"]} style={styles.balanceContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
              <MaterialCommunityIcons name="account" size={35} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SimulacionScreen")} style={styles.bellIconContainer}>
              <MaterialCommunityIcons name="play" size={35} color="white" />
            </TouchableOpacity>
          </View>

          {/* Componente de Balance */}
          <Balance transactions={transactions} />

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
            <LinearGradient colors={["#cb70e1", "#885fd8"]} style={styles.labelGradient}>
              <View style={styles.labelContent}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Ingresos</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(transactions.filter((trans) => trans.type === "Ingreso").reduce((total, trans) => total + parseFloat(trans.amount), 0))}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total Gastos</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(transactions.filter((trans) => trans.type === "Gasto").reduce((total, trans) => total + parseFloat(trans.amount), 0))}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </LinearGradient>

        <Timeline transactions={transactions} />

        {/* Componente de Historial de Transacciones */}
        <FilteredTransactionHistory
          transactions={transactions}
          onEdit={(transaction) => {
            setEditingTransaction(transaction);
            setEditAmount(transaction.amount.toString());
            setEditCategory(transaction.category);
            setEditDescription(transaction.description);
            setEditFixed(transaction.isFixed);
            setModalVisible(true);
          }}
          onDelete={handleDeleteTransaction}
        />

        {/* Modal de Edición */}
        <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Editar Transacción</Text>
              <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" placeholder="Monto" />
              <TextInput style={styles.input} value={editCategory} onChangeText={setEditCategory} placeholder="Categoría" />
              <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription} placeholder="Descripción (opcional)" />
              <TextInput style={styles.input} value={editFixed} onChangeText={setEditFixed} placeholder="Tipo (Fijo o Variable)" />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.smallButtonSave} onPress={handleSaveEdit}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButtonCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos aquí...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 20, // Añade algo de espacio en la parte inferior para el scroll
  },
  balanceContainer: {
    padding: 20,
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  bellIconContainer: {
    position: "relative",
  },
  chevronContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  chevronLine: {
    height: 1,
    backgroundColor: "black",
    width: 80,
  },
  chevronIcon: {
    marginHorizontal: 10,
  },
  labelContainer: {
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  labelGradient: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
  },
  labelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  totalItem: {
    alignItems: "center",
    width: "50%",
  },
  totalLabel: {
    fontSize: 16,
    color: "white",
  },
  totalAmount: {
    fontSize: 24,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  smallButtonSave: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  smallButtonCancel: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
