// src/components/charts/MonthlyChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const MonthlyChart = ({ transactions }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (transactions.length > 0) {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const monthlyData = transactions.reduce(
        (acc, transaction) => {
          const transactionDate = typeof transaction.selectedDate === "string"
            ? new Date(transaction.selectedDate)
            : transaction.selectedDate.toDate();
          const month = transactionDate.getMonth();
          const amount = parseFloat(transaction.amount) || 0;

          if (transaction.type === "Ingreso") {
            acc.incomes[month] = (acc.incomes[month] || 0) + amount;
          } else if (transaction.type === "Gasto") {
            acc.expenses[month] = (acc.expenses[month] || 0) + amount;
          }
          return acc;
        },
        { incomes: Array(12).fill(0), expenses: Array(12).fill(0) }
      );

      

      const chart = createChart(chartContainerRef.current, {
        width: 400,
        height: 300,
      });
      chartRef.current = chart;

      chart.addLineSeries({
        color: "rgba(75, 192, 192, 1)",
        lineWidth: 2,
      }).setData(
        monthlyData.incomes.map((value, index) => ({
          time: new Date(2023, index, 1).getTime() / 1000,
          value: parseFloat(value),
        }))
      );

      chart.addLineSeries({
        color: "rgba(255, 99, 132, 1)",
        lineWidth: 2,
      }).setData(
        monthlyData.expenses.map((value, index) => ({
          time: new Date(2023, index, 1).getTime() / 1000,
          value: parseFloat(value),
        }))
      );

      // Ajustar el gráfico para mostrar todas las categorías al cargar
      chart.timeScale().fitContent();

       // Manejo del redimensionamiento
       const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        chart.timeScale().fitContent(); // Reajustar el rango visible en caso de cambio de tamaño
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    }
  }, [transactions]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }}></div>;
};

export default MonthlyChart;
