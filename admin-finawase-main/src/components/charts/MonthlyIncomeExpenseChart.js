// src/components/charts/MonthlyIncomeExpenseChart.js

import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const MonthlyIncomeExpenseChart = ({ monthlyData }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Verificación completa para asegurarse de que los datos existen y tienen valores válidos
    if (
      monthlyData &&
      Array.isArray(monthlyData.incomes) &&
      Array.isArray(monthlyData.expenses) &&
      monthlyData.incomes.length > 0 &&
      monthlyData.expenses.length > 0
    ) {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          backgroundColor: "#ffffff",
          textColor: "#333",
        },
        rightPriceScale: { visible: true },
        timeScale: {
          barSpacing: 20,
          lockVisibleTimeRangeOnResize: true,
        },
        grid: {
          vertLines: { color: "#e1e3e6" },
          horzLines: { color: "#f0f3fa" },
        },
      });

      chartRef.current = chart;

      // Configurar la serie de ingresos
      const incomeSeries = chart.addLineSeries({
        color: "rgba(0, 128, 0, 0.8)",
        lineWidth: 2,
      });
      incomeSeries.setData(
        monthlyData.incomes.map((value, index) => ({
          time: new Date(2023, index, 1).getTime() / 1000,
          value: parseFloat(value) || 0,
        }))
      );

      // Configurar la serie de gastos
      const expenseSeries = chart.addLineSeries({
        color: "rgba(255, 0, 0, 0.8)",
        lineWidth: 2,
      });
      expenseSeries.setData(
        monthlyData.expenses.map((value, index) => ({
          time: new Date(2023, index, 1).getTime() / 1000,
          value: parseFloat(value) || 0,
        }))
      );

      chart.timeScale().applyOptions({
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          const monthNames = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
          ];
          return monthNames[date.getMonth()];
        },
      });

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [monthlyData]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }}>
      {(!monthlyData ||
        !Array.isArray(monthlyData.incomes) ||
        !Array.isArray(monthlyData.expenses) ||
        monthlyData.incomes.length === 0 ||
        monthlyData.expenses.length === 0) && (
        <p>Cargando datos del gráfico...</p>
      )}
    </div>
  );
};

export default MonthlyIncomeExpenseChart;
