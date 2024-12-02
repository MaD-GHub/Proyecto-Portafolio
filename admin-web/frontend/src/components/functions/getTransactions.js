import { db } from './firebase'; // Importamos la configuración de Firebase
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

// Función para obtener las transacciones desde Firestore y agruparlas por mes
const getTransactions = async () => {
  try {
    const transactionsRef = collection(db, 'transactions');
    
    // Realizamos la consulta: obtenemos todas las transacciones de la base de datos
    const q = query(
      transactionsRef,
      orderBy('selectedDate', 'asc') // Ordenamos por fecha de la transacción
    );

    const querySnapshot = await getDocs(q);

    let transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data());
    });

    // Agrupamos las transacciones por mes
    const groupedData = groupTransactionsByMonth(transactions);

    return groupedData;
  } catch (error) {
    console.error("Error al obtener las transacciones:", error);
    throw new Error("No se pudieron obtener las transacciones");
  }
};

// Función para agrupar las transacciones por mes
const groupTransactionsByMonth = (transactions) => {
  const grouped = {};

  transactions.forEach((transaction) => {
    // Convertimos la fecha en un formato adecuado (Año-Mes)
    const date = new Date(transaction.selectedDate);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Ejemplo: "2024-11"

    // Si no existe la clave, la inicializamos
    if (!grouped[monthKey]) {
      grouped[monthKey] = { income: 0, expense: 0 };
    }

    // Sumamos los valores de ingreso y gasto
    if (transaction.type === 'Ingreso') {
      grouped[monthKey].income += transaction.amount;
    } else if (transaction.type === 'Gasto') {
      grouped[monthKey].expense += transaction.amount;
    }
  });

  // Convertimos el objeto agrupado en un array adecuado para el gráfico
  const result = Object.keys(grouped).map((key) => ({
    month: key,
    income: grouped[key].income,
    expense: grouped[key].expense,
  }));

  return result;
};

export { getTransactions };
