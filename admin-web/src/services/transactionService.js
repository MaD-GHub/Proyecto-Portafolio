import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de importar el Firestore configurado

export const fetchRecentTransactions = async () => {
  try {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, orderBy("creationDate", "desc"), limit(5));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
};
