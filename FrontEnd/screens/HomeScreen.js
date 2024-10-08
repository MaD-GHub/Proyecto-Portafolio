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
  Image,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

// Función para obtener la fecha actual
const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Enero es 0
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Componente para la línea de tiempo (proyección financiera)
const Timeline = ({ transactions }) => {
  const [projection, setProjection] = useState([]);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  useEffect(() => {
    calculateProjection();
  }, [transactions]);

  const calculateProjection = () => {
    const projectionMonths = 6; // Proyección a 6 meses
    let currentBalance = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      return transaction.type === "Ingreso" ? acc + amount : acc - amount;
    }, 0);

    const monthlyIncome = transactions
      .filter((t) => t.type === "Ingreso")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === "Egreso")
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const currentMonth = new Date().getMonth(); // Mes actual (0 = Enero)
    const currentYear = new Date().getFullYear();
    const projectionData = [];

    for (let i = 0; i < projectionMonths; i++) {
      if (i !== 0) {
        currentBalance += monthlyIncome - monthlyExpense;
      }
      const projectedMonth = (currentMonth + i) % 12; // Cicla entre los meses del año
      const projectedYear = currentYear + Math.floor((currentMonth + i) / 12);
      projectionData.push({
        month: `${months[projectedMonth]} ${projectedYear}`, // Muestra el nombre del mes y el año
        balance: currentBalance,
      });
    }
    setProjection(projectionData);
  };

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
                <Text style={styles.timelineBalance}>{formatCurrency(item.balance)}</Text>
              </View>
            ))} 
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen({ transactions = [], setTransactions }) {
  const navigation = useNavigation(); // Usamos el hook para la navegación
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0); // Saldo inicial en 0
  const [totalIngresos, setTotalIngresos] = useState(0); // Total de ingresos
  const [totalGastos, setTotalGastos] = useState(0); // Total de gastos
  const [editingTransaction, setEditingTransaction] = useState(null); // Estado de la transacción que se está editando
  const [modalVisible, setModalVisible] = useState(false); // Control del modal de edición
  const [editAmount, setEditAmount] = useState(""); // Monto a editar
  const [editCategory, setEditCategory] = useState(""); // Categoría a editar
  const [isOpen, setIsOpen] = useState(false); // Controlar si está abierto o cerrado
  const heightAnim = useState(new Animated.Value(0))[0]; // Animación para la altura

  const ingresoCategorias = ["Salario", "Venta de producto"];
  const egresoCategorias = [
    "Comida y Bebidas",
    "Vestuario",
    "Alojamiento",
    "Salud",
    "Transporte",
    "Educación",
  ];

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
        "QuattrocentoSans-Italic": require("../assets/fonts/QuattrocentoSans-Italic.ttf"),
        "QuattrocentoSans-BoldItalic": require("../assets/fonts/QuattrocentoSans-BoldItalic.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      console.log("Transactions updated:", transactions);
    }
    calculateTotalSaved();
  }, [transactions]);

  const calculateTotalSaved = () => {
    if (transactions && transactions.length > 0) {
      const ingresos = transactions
        .filter((transaction) => transaction.type === "Ingreso")
        .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

      const gastos = transactions
        .filter((transaction) => transaction.type === "Egreso")
        .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

      setTotalIngresos(ingresos);
      setTotalGastos(gastos);
      setTotalSaved(ingresos - gastos); // Calcula el saldo total
    } else {
      setTotalSaved(0); // Reinicia el saldo si no hay transacciones
      setTotalIngresos(0);
      setTotalGastos(0);
    }
  };

  const toggleLabel = () => {
    setIsOpen(!isOpen);
    Animated.timing(heightAnim, {
      toValue: isOpen ? 0 : 100, // Abrir o cerrar el label
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Función para manejar la edición de una transacción
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction); // Establece la transacción seleccionada para editar
    setEditAmount(transaction.amount); // Rellena el modal con la cantidad actual
    setEditCategory(transaction.category); // Rellena el modal con la categoría actual
    setModalVisible(true); // Abre el modal de edición
  };

  // Función para guardar los cambios de la transacción editada
  const handleSaveEdit = () => {
    const updatedTransactions = transactions.map((item) =>
      item.id === editingTransaction.id
        ? { ...item, amount: editAmount, category: editCategory }
        : item
    );
    setTransactions(updatedTransactions); // Actualiza las transacciones
    setModalVisible(false); // Cierra el modal de edición
  };

  // Función para eliminar una transacción
  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((item) => item.id !== id);
    setTransactions(updatedTransactions); // Elimina la transacción y actualiza la lista
  };

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
          <Image
            source={{ uri: "https://example.com/user-profile-pic.png" }} // Aquí debes colocar la URL de la foto de perfil
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.balanceAmount}>{formatCurrency(totalSaved)}</Text>
        <Text style={styles.balanceDate}>Saldo actual - {getTodayDate()}</Text>

        {/* Flecha con animación */}
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

        {/* Label con animación */}
        <Animated.View style={[styles.labelContainer, { height: heightAnim }]}>
          <LinearGradient
            colors={["#cb70e1", "#885fd8"]}
            style={styles.labelGradient}
          >
            <View style={styles.labelContent}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total Ingresos</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totalIngresos)}</Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Total Gastos</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totalGastos)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>

      {/* Línea de tiempo de proyección */}
      <Timeline transactions={transactions} />

      {/* Historial de Ingresos y Egresos */}
      <View style={styles.transactionContainer}>
        <Text style={styles.timelineTitle}>Historial Ingresos y Gastos</Text>
        {transactions && transactions.length === 0 ? (
          <Text>No hay transacciones aún</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View>
                  <Text
                    style={[
                      styles.transactionText,
                      { color: item.type === "Ingreso" ? "green" : "red" },
                    ]}
                  >
                    {item.type} - {item.category} - {formatCurrency(item.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
                <View style={styles.transactionActions}>
                  <TouchableOpacity onPress={() => handleEditTransaction(item)}>
                    <MaterialCommunityIcons name="pencil" size={24} color="blue" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteTransaction(item.id)}
                    style={styles.deleteIcon}
                  >
                    <MaterialCommunityIcons name="trash-can" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Modal de edición de transacción */}
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
                : egresoCategorias.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
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

      <TouchableOpacity
        onPress={() => navigation.navigate('ProfileScreen', { totalSaved })}
      >
        <Text style={{ color: 'blue', textAlign: 'center', marginTop: 20 }}>
          Ver Perfil
        </Text>
      </TouchableOpacity>
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
  },
  balanceContainer: {
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 10,
    left: 10,
  },
  balanceAmount: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 36,
    color: "white",
    marginTop: 35, // Bajado un poco más para dejar espacio a la imagen de perfil
  },
  balanceDate: {
    fontFamily: "QuattrocentoSans-Bold", // Cambiado a negrita
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
    borderRadius: 10, // Bordes más redondeados
    marginTop: 10,
    alignItems: "center",
  },
  labelGradient: {
    width: "100%",
    padding: 10,
    borderRadius: 10, // Bordes más redondeados
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
    color: "white", // Números en blanco
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
    fontFamily: "QuattrocentoSans-Bold", // Cambiado a negrita
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
});
