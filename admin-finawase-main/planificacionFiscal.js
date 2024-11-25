import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import withAdminAuth from "../components/withAdminAuth";
import '../App.css';

const PlanificacionFiscal = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionsRef = db.collection('transactions');
      const snapshot = await transactionsRef.get();
      const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(fetchedTransactions);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="App">
      <div className="main-content">
        <h1>Planificación Fiscal</h1>
        <div>
          <h2>Transacciones</h2>
          <ul>
            {transactions.map(transaccion => (
              <li key={transaccion.id}>
                {transactions.description} - ${transaccion.amount} - {transaccion.type}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(PlanificacionFiscal);
