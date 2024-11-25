import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import withAdminAuth from "../components/withAdminAuth";
import Sidebar from '../components/Sidebar';
import '../App.css';

const PlanificacionFiscal = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Obtén las transacciones de la colección 'transactions'
        const transactionsRef = collection(db, 'transactions');
        const snapshot = await getDocs(transactionsRef);
        const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="analytics-screen">
      <Sidebar />
      <div className="content">
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
          Planificación
        </h1>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Resumen de las transacciones */}
          <div
            style={{
              flex: 1,
              minWidth: "300px",
              background: "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", marginBottom: "10px" }}>
              Resumen
            </h2>
            <p style={{ fontSize: "16px" }}>
              Total de transacciones: <strong>{transactions.length}</strong>
            </p>
            <p style={{ fontSize: "16px" }}>
              Total de ingresos: <strong>${transactions.reduce((acc, t) => (t.type === 'Ingreso' ? acc + t.amount : acc), 0).toFixed(2)}</strong>
            </p>
            <p style={{ fontSize: "16px" }}>
              Total de egresos: <strong>${transactions.reduce((acc, t) => (t.type === 'Gasto' ? acc + t.amount : acc), 0).toFixed(2)}</strong>
            </p>
          </div>

          {/* Lista de transacciones */}
          <div
            style={{
              flex: 2,
              minWidth: "400px",
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", marginBottom: "10px" }}>
              Lista de Transacciones
            </h2>
            {transactions.length > 0 ? (
              <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                {transactions.map(transaccion => (
                  <li
                    key={transaccion.id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#f9f9f9",
                      border: "1px solid #ddd",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "bold", color: "#333" }}>{transaccion.description}</span>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: transaccion.type === "Ingreso" ? "green" : "red",
                        }}
                      >
                        ${transaccion.amount.toFixed(2)}
                      </span>
                    </div>
                    <small style={{ color: "#666" }}>{transaccion.type}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron transacciones.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(PlanificacionFiscal);
