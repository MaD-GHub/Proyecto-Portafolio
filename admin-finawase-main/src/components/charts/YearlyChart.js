// src/components/charts/YearlyChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const YearlyChart = ({ transactions }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (transactions.length > 0) {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const yearlyData = transactions.reduce((acc, transaction) => {
        const transactionDate = typeof transaction.selectedDate === "string"
          ? new Date(transaction.selectedDate)
          : transaction.selectedDate.toDate();
        const year = transactionDate.getFullYear();
        const amount = parseFloat(transaction.amount) || 0;

        if (transaction.type === "Ingreso") {
          acc.incomes[year] = (acc.incomes[year] || 0) + amount;
        } else if (transaction.type === "Gasto") {
          acc.expenses[year] = (acc.expenses[year] || 0) + amount;
        }
        return acc;
      }, { incomes: {}, expenses: {} });

      const chart = createChart(chartContainerRef.current, {
        width: 400,
        height: 300,
      });
      chartRef.current = chart;

      chart.addLineSeries({
        color: "rgba(75, 192, 192, 1)",
        lineWidth: 2,
      }).setData(
        Object.keys(yearlyData.incomes).map((year) => ({
          time: new Date(year, 0, 1).getTime() / 1000,
          value: parseFloat(yearlyData.incomes[year]),
        }))
      );

      

      chart.addLineSeries({
        color: "rgba(255, 99, 132, 1)",
        lineWidth: 2,
      }).setData(
        Object.keys(yearlyData.expenses).map((year) => ({
          time: new Date(year, 0, 1).getTime() / 1000,
          value: parseFloat(yearlyData.expenses[year]),
        }))
      );
    }
  }, [transactions]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }}></div>;
};

export default YearlyChart;
