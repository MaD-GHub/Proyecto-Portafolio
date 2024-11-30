const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Función para agregar tarea
exports.addTask = functions.https.onCall(async (data, context) => {
  const { text } = data;
  if (!text) {
    throw new functions.https.HttpsError('invalid-argument', 'El texto de la tarea es obligatorio');
  }

  try {
    const docRef = await admin.firestore().collection("tasks").add({
      text,
      status: "Pendiente", // Estado inicial
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Tarea creada con ID:", docRef.id);
    return { success: true, taskId: docRef.id };
  } catch (e) {
    console.error("Error al crear tarea:", e);
    throw new functions.https.HttpsError('unknown', 'Error al crear tarea');
  }
});

// Función para marcar una tarea como completada
exports.markTaskAsCompleted = functions.https.onCall(async (data, context) => {
  const taskId = data.taskId;
  const status = "Completada"; // El nuevo estado

  try {
    // Obtener la tarea por ID
    const taskRef = admin.firestore().collection("tasks").doc(taskId);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      throw new functions.https.HttpsError('not-found', 'Tarea no encontrada');
    }

    // Actualizar el estado de la tarea
    await taskRef.update({
      status: status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Tarea ${taskId} marcada como completada.`);
    return { success: true, message: `Tarea ${taskId} marcada como completada.` };
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    throw new functions.https.HttpsError('unknown', 'Error al actualizar la tarea');
  }
});

// Función para obtener todas las tareas activas
exports.getActiveTasks = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("tasks")
        .where("status", "==", "Progreso")
        .get();

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      status: doc.data().status,
      dateCreated: doc.data().dateCreated.toDate(),
    }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    res.status(500).send("Error al obtener las tareas");
  }
});
