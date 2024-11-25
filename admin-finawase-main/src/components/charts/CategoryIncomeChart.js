// src/components/charts/IncomeCategoryChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const IncomeCategoryChart = ({ transactions }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (transactions.length > 0) {
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // Filtrar ingresos y agrupar por categoría
      const categoryData = transactions.reduce((acc, transaction) => {
        if (transaction.type === "Ingreso") {
          const category = transaction.category || "Sin Categoría";
          acc[category] = (acc[category] || 0) + parseFloat(transaction.amount || 0);
        }
        return acc;
      }, {});

      const categories = Object.keys(categoryData);
      const amounts = Object.values(categoryData);

      // Crear el gráfico
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });
      chartRef.current = chart;

      // Configuración del gráfico de barras
      const barSeries = chart.addHistogramSeries({
        color: "#4CAF50",
        priceFormat: {
          type: "volume",
        },
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      barSeries.setData(
        categories.map((category, index) => ({
          time: index + 1,
          value: amounts[index],
          color: "#4CAF50",
          name: category,
        }))
      );

      // Configurar el eje de tiempo para mostrar todas las categorías
      chart.timeScale().applyOptions({
        timeVisible: true,
        barSpacing: 30,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time) => categories[time - 1] || "",
      });

      // Ajustar el tamaño inicial para mostrar todas las barras
      chart.timeScale().fitContent();
    }
  }, [transactions]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }}></div>;
};

export default IncomeCategoryChart;
