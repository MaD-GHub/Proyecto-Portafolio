import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Picker } from "@react-native-picker/picker";

// Componente para la línea de tiempo
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
    const projectionData = [];

    for (let i = 0; i < projectionMonths; i++) {
      currentBalance += monthlyIncome - monthlyExpense;
      const projectedMonth = (currentMonth + i) % 12; // Cicla entre los meses del año
      projectionData.push({
        month: months[projectedMonth], // Muestra el nombre del mes
        balance: currentBalance,
      });
    }
    setProjection(projectionData);
  };

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Proyección Financiera</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {projection.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <Text style={styles.timelineMonth}>{item.month}</Text>
            <Text style={styles.timelineBalance}>
              {formatCurrency(item.balance)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function HomeScreen({ transactions = [], setTransactions }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0); // Saldo inicial en 0
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

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
      const total = transactions.reduce((acc, transaction) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === "Ingreso") {
          return acc + amount;
        } else if (transaction.type === "Egreso") {
          return acc - amount;
        }
        return acc;
      }, 0);
      setTotalSaved(total);
    } else {
      setTotalSaved(0); // Reinicia el saldo si no hay transacciones
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  const userName = "Matías";

  // Función para eliminar una transacción y actualizar el saldo
  const handleDeleteTransaction = (id) => {
    const transactionToDelete = transactions.find((item) => item.id === id);

    if (transactionToDelete) {
      setTransactions((prevTransactions) =>
        prevTransactions.filter((item) => item.id !== id)
      );
    }
  };

  // Función para preparar la transacción que será editada
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction); // Se establece la transacción seleccionada
    setEditAmount(String(transaction.amount)); // Inicializamos el monto en el modal
    setEditCategory(transaction.category); // Inicializamos la categoría en el modal
    setModalVisible(true); // Mostramos el modal
  };

  // Función para guardar la transacción editada y ajustar el saldo si se modifica la cantidad
  const handleSaveEdit = () => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((item) => {
        if (item.id === editingTransaction.id) {
          const originalAmount = parseFloat(item.amount);
          const newAmount = parseFloat(editAmount);

          if (!isNaN(originalAmount) && !isNaN(newAmount)) {
            return { ...item, amount: newAmount, category: editCategory };
          }
        }
        return item;
      })
    );
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/images/Logo_F1.png")}
            style={styles.logo}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>Finawise</Text>
            <Text style={styles.welcomeText}>¡Bienvenid@, {userName}!</Text>
          </View>
        </View>
      </View>

      {/* Sección de Saldo Actual */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Saldo actual</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalSaved)}</Text>
      </View>

      {/* Línea de tiempo de proyección */}
      <Timeline transactions={transactions} />

      {/* Historial de Ingresos y Egresos */}
      <View style={styles.transactionContainer}>
        <Text style={styles.balanceTitle}>Ingresos y Egresos 💼</Text>
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

      {/* Modal para editar transacciones */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Editar Transacción</Text>
            <TextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <Picker
              selectedValue={editCategory}
              onValueChange={(itemValue) => setEditCategory(itemValue)}
              style={styles.picker}
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
              <TouchableOpacity onPress={handleSaveEdit} style={styles.smallButtonSave}>
                <Text style={styles.buttonText}>Guardar ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.smallButtonCancel}
              >
                <Text style={styles.buttonText}>Cancelar ❌</Text>
              </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 10,
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    marginLeft: 10,
  },
  title: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 24,
    color: "black",
  },
  welcomeText: {
    fontFamily: "QuattrocentoSans-Regular",
    fontSize: 18,
    color: "gray",
  },
  balanceContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  balanceTitle: {
    fontFamily: "ArchivoBlack-Regular",
    fontSize: 20,
    color: "black",
  },
  balanceAmount: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 22,
    color: "gray",
    marginTop: 5,
  },
  // Estilos para la línea de tiempo
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
  },
  timelineItem: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 15,
  },
  timelineMonth: {
    fontFamily: "QuattrocentoSans-Bold",
    fontSize: 16,
    color: "#8f539b",
  },
  timelineBalance: {
    fontFamily: "QuattrocentoSans-Regular",
    fontSize: 16,
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
