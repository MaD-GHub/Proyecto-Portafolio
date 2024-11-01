// HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
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
  const [confirmSimulationModal, setConfirmSimulationModal] = useState(false); // Modal para confirmar entrada al modo simulación
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState(""); // Nuevo estado para la descripción
  const [editFixed, setEditFixed] = useState(""); // Nuevo estado para saber si es fijo
  const [isOpen, setIsOpen] = useState(false);
  const heightAnim = useState(new Animated.Value(0))[0];
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const ingresoCategorias = ["Salario", "Venta de producto"];
  const gastoCategorias = [
    "Comida y Bebidas",
    "Vestuario",
    "Alojamiento",
    "Salud",
    "Transporte",
    "Educación",
  ];

  useEffect(() => {
    const loadFonts = async () => {
      console.log("Cargando fuentes...");
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
        "QuattrocentoSans-Italic": require("../assets/fonts/QuattrocentoSans-Italic.ttf"),
        "QuattrocentoSans-BoldItalic": require("../assets/fonts/QuattrocentoSans-BoldItalic.ttf"),
      });
      setFontsLoaded(true);
      console.log("Fuentes cargadas correctamente");
    };
    loadFonts();
  }, []);

  // Obtener transacciones desde Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("Usuario no autenticado");
      return;
    }

    console.log("Consultando transacciones para el usuario:", user.uid);

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
      console.log("Transacciones obtenidas:", transacciones);
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
    console.log("Intentando eliminar transacción con ID:", id);
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
              const updatedTransactions = transactions.filter(
                (item) => item.id !== id
              );
              setTransactions(updatedTransactions);
              console.log("Transacción eliminada con éxito:", id);
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
    console.log("Guardando edición para la transacción:", editingTransaction);
    try {
      const transactionRef = doc(db, "transactions", editingTransaction.id);
      await updateDoc(transactionRef, {
        amount: editAmount,
        category: editCategory,
        description: editDescription, // Guardar la descripción editada
        isFixed: editFixed, // Guardar el estado de fijo
      });

      const updatedTransactions = transactions.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...item,
              amount: editAmount,
              category: editCategory,
              description: editDescription,
              isFixed: editFixed,
            }
          : item
      );
      setTransactions(updatedTransactions);
      setModalVisible(false);
      console.log("Transacción actualizada:", editingTransaction.id);
    } catch (error) {
      console.error("Error al actualizar transacción:", error);
    }
  };

  const calculateTotalSaved = () => {
    console.log("Calculando totales...");

    if (transactions && transactions.length > 0) {
      const ingresos = transactions
        .filter((transaction) => transaction.type === "Ingreso")
        .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0); // Sumar ingresos totales

      const gastos = transactions
        .filter((transaction) => transaction.type === "Gasto")
        .reduce((acc, transaction) => {
          if (transaction.isInstallment && transaction.installmentCount > 0) {
            return (
              acc +
              parseFloat(transaction.amount) / transaction.installmentCount
            ); // Dividir cuotas
          }
          return acc + parseFloat(transaction.amount); // Sumar gasto completo
        }, 0); // Sumar gastos totales

      setTotalIngresos(ingresos); // Ingresos totales
      setTotalGastos(gastos); // Gastos totales
      setTotalSaved(ingresos - gastos); // Guardar balance final
      console.log(
        "Totales calculados: Ingresos =",
        ingresos,
        "Gastos =",
        gastos
      );
    } else {
      setTotalSaved(0);
      setTotalIngresos(0);
      setTotalGastos(0);
      console.log("No hay transacciones disponibles para calcular.");
    }
  };

  useEffect(() => {
    calculateTotalSaved();
  }, [transactions]);

  const toggleLabel = () => {
    setIsOpen(!isOpen);
    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  };

  const groupedTransactions = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#511496", "#885fd8"]}
        style={styles.balanceContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <MaterialCommunityIcons name="account" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmSimulationModal(true)} // Abre el modal de confirmación
            style={styles.bellIconContainer}
          >
            <MaterialCommunityIcons name="play" size={35} color="white" />
          </TouchableOpacity>
        </View>

        {notificationsVisible && (
          <View style={styles.notificationsLabel}>
            <Text style={styles.notificationsText}>
              No hay notificaciones por ahora
            </Text>
          </View>
        )}

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

      <Timeline transactions={transactions} />

      <View style={styles.transactionContainer}>
        <Text style={styles.timelineTitle}>Historial Ingresos y Gastos</Text>
        {transactions && transactions.length === 0 ? (
          <Text>No hay transacciones aún</Text>
        ) : (
          <FlatList
            data={sortedDates}
            keyExtractor={(item) => item}
            renderItem={({ item: date }) => (
              <View>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {groupedTransactions[date]
                  .sort(
                    (a, b) =>
                      new Date(b.selectedDate) - new Date(a.selectedDate)
                  ) // Ordenamos las transacciones dentro de cada fecha
                  .map((item) => (
                    <View key={item.id} style={styles.transactionItem}>
                      <View>
                        <Text
                          style={[
                            styles.transactionText,
                            {
                              color: item.type === "Ingreso" ? "green" : "red",
                            },
                          ]}
                        >
                          {item.category} - {formatCurrency(item.amount)}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {item.description}
                        </Text>
                      </View>
                      <View style={styles.transactionActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingTransaction(item);
                            setEditAmount(item.amount.toString());
                            setEditCategory(item.category);
                            setEditDescription(item.description); // Cargar la descripción para editar
                            setEditFixed(item.isFixed); // Cargar el estado de fijo para editar
                            setModalVisible(true); // Abrir el modal
                          }}
                        >
                          <MaterialCommunityIcons
                            name="pencil"
                            size={24}
                            color="blue"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteTransaction(item.id)}
                          style={styles.deleteIcon}
                        >
                          <MaterialCommunityIcons
                            name="trash-can"
                            size={24}
                            color="red"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Editar Transacción</Text>
            <TextInput
              style={styles.input}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              placeholder="Monto"
            />
            <Picker
              selectedValue={editCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setEditCategory(itemValue)}
            >
              <Picker.Item label="Seleccione categoría" value="" />
              {editingTransaction?.type === "Ingreso"
                ? ingresoCategorias.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))
                : gastoCategorias.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
            </Picker>
            <TextInput
              style={styles.input}
              value={editDescription} // Añadido para la descripción
              onChangeText={setEditDescription}
              placeholder="Descripción (opcional)"
            />
            <Picker
              selectedValue={editFixed}
              style={styles.picker}
              onValueChange={(itemValue) => setEditFixed(itemValue)}
            >
              <Picker.Item label="Seleccione tipo" value="" />
              <Picker.Item label="Fijo" value="Fijo" />
              <Picker.Item label="Variable" value="Variable" />
            </Picker>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.smallButtonSave}
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButtonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
  visible={confirmSimulationModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setConfirmSimulationModal(false)}
>
  <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Entrar en Modo Simulación</Text>
      <Text style={styles.modalMessage}>
        Estás a punto de entrar en el modo simulación. Los datos generados en esta
        sesión serán temporales y se perderán al salir.
      </Text>
      <View style={styles.buttonRow}>
        <LinearGradient
          colors={["#B0B0B0", "#8C8C8C"]}
          style={styles.cancelButtonGradient}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => setConfirmSimulationModal(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </LinearGradient>
        <LinearGradient
          colors={["#511496", "#885FD8"]}
          style={styles.confirmButtonGradient}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setConfirmSimulationModal(false);
              navigation.navigate("SimulacionScreen", {
                totalSaved,
                transactions,
              });
            }}
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
}

// Función para formatear a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 0,
    marginBottom: 110, // Añadido margen inferior
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
  notificationsLabel: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    width: "80%",
    alignSelf: "center",
  },
  notificationsText: {
    color: "#333",
    textAlign: "center",
  },
  balanceAmount: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 36,
    color: "white",
    marginTop: 20,
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
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 16,
    color: "white",
  },
  totalAmount: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 24,
    color: "white",
  },
  timelineContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  timelineTitle: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "black",
    marginBottom: 10,
    textAlign: "center",
  },
  timeline: {
    position: "relative",
    flexDirection: "row",
  },
  timelineLine: {
    height: 2,
    backgroundColor: "#673072",
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
  },
  timelineMonths: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  timelineItem: {
    alignItems: "center",
    width: 120,
    marginHorizontal: 10,
  },
  timelineVerticalLine: {
    height: 30,
    width: 2,
    backgroundColor: "#673072",
    marginBottom: 5,
  },
  timelineMonth: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 14,
    color: "#673072",
  },
  timelineBalance: {
    fontFamily: "QuattrocentoSans-Regular",
    fontSize: 14,
    color: "gray",
  },
  transactionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
  },
  dateHeader: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 18,
    color: "#673072",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  transactionText: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 16,
  },
  transactionDate: {
    fontFamily: "QuattrocentoSans-Regular",
    fontSize: 16,
    color: "gray",
  },
  transactionActions: {
    flexDirection: "row",
  },
  deleteIcon: {
    marginLeft: 10,
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
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "#673072",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButtonGradient: {
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 5,
  },
  confirmButtonGradient: {
    borderRadius: 25,
    overflow: "hidden",
    marginLeft: 5,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});
