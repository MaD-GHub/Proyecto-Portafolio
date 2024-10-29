import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Animated,
  StyleSheet,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Icons
import { LinearGradient } from "expo-linear-gradient"; // Para degradados
import { auth, db } from "../firebase"; // Firebase auth y Firestore
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"; // Funciones Firestore

export default function AhorroScreen() {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(600));
  const [goalName, setGoalName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date()); // Estado para fecha de inicio
  const [endDate, setEndDate] = useState(new Date()); // Estado para fecha de fin
  const [deductionDay, setDeductionDay] = useState("");
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false); // Para mostrar el picker de fecha de inicio
  const [showEndDate, setShowEndDate] = useState(false); // Para mostrar el picker de fecha de fin

  // Fetch metas desde Firestore (por usuario autenticado)
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, "savings"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userGoals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(userGoals);
      });
      return () => unsubscribe(); // Limpiar listener
    }
  }, []);

  // Abrir Modal
  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Cerrar Modal
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // Añadir una nueva meta de ahorro a Firestore
  const handleAddGoal = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "savings"), {
          userId: user.uid,
          goalName,
          amount: parseFloat(amount),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          deductionDay,
          status: "En progreso", // Nueva meta en progreso
        });
        closeModal(); // Cerrar modal después de añadir
        resetForm(); // Resetear formulario
      } catch (error) {
        console.error("Error al añadir meta:", error);
      }
    }
  };

  const resetForm = () => {
    setGoalName("");
    setAmount("");
    setStartDate(new Date());
    setEndDate(new Date());
    setDeductionDay("");
  };

  // Calcular el ahorro mensual y la cantidad de meses
  const calculateMonthlySavings = (goalAmount, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return months > 0 ? (goalAmount / months).toFixed(2) : goalAmount;
  };

  // Pausar una meta
  const pauseGoal = async (goalId) => {
    await updateDoc(doc(db, "savings", goalId), {
      status: "Pausada",
    });
  };

  // Eliminar una meta
  const deleteGoal = async (goalId) => {
    await deleteDoc(doc(db, "savings", goalId));
  };

  // Alternar entre mostrar una o todas las metas
  const toggleShowGoals = () => {
    setShowAllGoals(!showAllGoals);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#511496" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="piggy-bank" size={28} color="white" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mis Metas</Text>
          <Text style={styles.headerSubtitle}>
            Tienes {goals.length} metas en progreso
          </Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={openModal}>
          <Text style={styles.payButtonText}>Agregar Meta</Text>
        </TouchableOpacity>
      </View>

      {/* Estado de las Metas */}
      <View style={styles.statusContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>{goals.length}</Text>
          <Text style={styles.statusLabel}>Todas</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "En progreso").length}
          </Text>
          <Text style={styles.statusLabel}>Activas</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "Pausada").length}
          </Text>
          <Text style={styles.statusLabel}>En pausa</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "Completada").length}
          </Text>
          <Text style={styles.statusLabel}>Completadas</Text>
        </View>
      </View>

      {/* Lista de Metas */}
      <View style={styles.goalListContainer}>
        {goals.length > 0 ? (
          <>
            {/* Mostrar solo una meta inicialmente */}
            <View style={styles.goalCard}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalAmount}>
                  CLP {goals[0]?.amount?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.goalDates}>
                  Desde: {goals[0]?.startDate ? new Date(goals[0].startDate).toLocaleDateString() : 'N/A'} -
                  Hasta: {goals[0]?.endDate ? new Date(goals[0].endDate).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.goalDates}>
                  Ahorro mensual: CLP{" "}
                  {goals[0]?.amount && goals[0]?.startDate && goals[0]?.endDate
                    ? calculateMonthlySavings(goals[0].amount, goals[0].startDate, goals[0].endDate)
                    : '0'}
                </Text>
              </View>
              {/* Acciones */}
              <View style={styles.goalActions}>
                <TouchableOpacity onPress={() => pauseGoal(goals[0].id)}>
                  <MaterialCommunityIcons
                    name="pause-circle-outline"
                    size={24}
                    color="orange"
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color="purple"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteGoal(goals[0].id)}>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={24}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón para mostrar todas las metas */}
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleShowGoals}
            >
              <Text style={styles.expandButtonText}>
                {showAllGoals ? "Ver menos" : "Ver todas las metas"}
              </Text>
              <MaterialCommunityIcons
                name={showAllGoals ? "chevron-up" : "chevron-down"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>

            {/* Mostrar todas las metas si está expandido */}
            {showAllGoals &&
              goals.slice(1).map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalAmount}>
                      CLP {goal?.amount?.toLocaleString() || '0'}
                    </Text>
                    <Text style={styles.goalDates}>
                      Desde: {goal?.startDate ? new Date(goal.startDate).toLocaleDateString() : 'N/A'} -
                      Hasta: {goal?.endDate ? new Date(goal.endDate).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={styles.goalDates}>
                      Ahorro mensual: CLP{" "}
                      {goal?.amount && goal?.startDate && goal?.endDate
                        ? calculateMonthlySavings(goal.amount, goal.startDate, goal.endDate)
                        : '0'}
                    </Text>
                  </View>
                  {/* Acciones */}
                  <View style={styles.goalActions}>
                    {/* Botón de Pausar */}
                    <TouchableOpacity onPress={() => pauseGoal(goal.id)}>
                      <MaterialCommunityIcons
                        name="pause-circle-outline"
                        size={24}
                        color="orange"
                      />
                    </TouchableOpacity>

                    {/* Botón de Modificar */}
                    <TouchableOpacity>
                      <MaterialCommunityIcons
                        name="pencil"
                        size={24}
                        color="purple"
                      />
                    </TouchableOpacity>

                    {/* Botón de Eliminar */}
                    <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={24}
                        color="red"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </>
        ) : (
          <Text style={styles.noGoalsText}>No tienes metas de ahorro aún.</Text>
        )}
      </View>

      {/* Modal para añadir una nueva meta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Nueva Meta de Ahorro</Text>

            {/* Campo de descripción */}
            <TextInput
              placeholder="Descripción"
              value={goalName}
              onChangeText={(text) => setGoalName(text)}
              style={styles.inputBox}
            />

            {/* Campo de monto total */}
            <TextInput
              placeholder="Monto total (CLP)"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              style={styles.inputBox}
            />

            {/* Fecha de inicio */}
            <TouchableOpacity
              onPress={() => setShowStartDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Inicio: {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || startDate;
                  setShowStartDate(false); // Ocultar el picker después de seleccionar
                  setStartDate(currentDate); // Actualizar la fecha de inicio
                }}
              />
            )}

            {/* Fecha de término */}
            <TouchableOpacity
              onPress={() => setShowEndDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Término: {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showEndDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || endDate;
                  setShowEndDate(false); // Ocultar el picker después de seleccionar
                  setEndDate(currentDate); // Actualizar la fecha de término
                }}
              />
            )}

            {/* Día de deducción */}
            <TextInput
              placeholder="Día de deducción"
              keyboardType="numeric"
              value={deductionDay}
              onChangeText={(text) =>
                setDeductionDay(text.replace(/[^0-9]/g, ""))
              }
              style={styles.inputBox}
            />

            {/* Botón de Confirmar */}
            <LinearGradient
              colors={["#511496", "#885FD8"]}
              style={styles.pickerContainer}
            >
              <TouchableOpacity
                onPress={handleAddGoal}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    paddingBottom: 200,
    backgroundColor: "#f1f1f1", // Fondo claro para toda la pantalla
  },
  header: {
    backgroundColor: "#511496", // Color morado para el encabezado
    padding: 24,
    paddingTop: 28,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#e0e0e0", // Subtítulo en gris claro
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  payButtonText: {
    color: "#2D2D2D",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 23,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginHorizontal: 10,
    marginTop: 12,
  },
  statusBox: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 15,
    width: 70,
  },
  statusNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D2D2D",
  },
  statusLabel: {
    fontSize: 14,
    color: "#2D2D2D",
  },
  goalListContainer: {
    marginTop: 20,
  },
  goalCard: {
    backgroundColor: "#2D2D2D", // Fondo oscuro para las tarjetas de metas
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalInfo: {
    flex: 1,
  },
  goalAmount: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  goalDates: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  goalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 90,
  },
  expandButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  expandButtonText: {
    color: "gray",
    fontSize: 16,
    marginRight: 5,
  },
  noGoalsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#673072",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673072",
    marginBottom: 20,
    fontWeight: "bold",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 10,
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 17,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 25,
    fontWeight: "bold",
  },
  confirmButton: {
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});




