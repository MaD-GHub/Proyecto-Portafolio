import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CategoryExpenseChart = ({ transactions }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (transactions.length > 0) {
      // Filtrar gastos y agrupar por categoría
      const categoryData = transactions.reduce((acc, transaction) => {
        if (transaction.type === "Gasto") {
          const category = transaction.category || "Sin Categoría";
          acc[category] = (acc[category] || 0) + parseFloat(transaction.amount || 0);
        }
        return acc;
      }, {});

      const categories = Object.keys(categoryData);
      const amounts = Object.values(categoryData);

      // Verificar si el gráfico ya existe y eliminarlo si es necesario
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null; // Limpiar referencia para evitar múltiples remociones
      }

      // Crear el gráfico de barras
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#333',
        },
        rightPriceScale: {
          visible: true,
        },
        timeScale: {
          visible: true,
          barSpacing: 20, // Ajuste del espacio entre barras
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
        },
        grid: {
          vertLines: {
            color: '#e1e3e6',
          },
          horzLines: {
            color: '#f0f3fa',
          },
        },
      });
      chartRef.current = chart;

      const barSeries = chart.addHistogramSeries({
        color: "#ff6384",
        priceFormat: {
          type: "volume",
        },
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      // Configuración de los datos de la serie
      barSeries.setData(
        categories.map((category, index) => ({
          time: index + 1, // Usar índice como simulación de tiempo
          value: amounts[index],
          color: "#ff6384",
        }))
      );

      // Etiquetas personalizadas para el eje de tiempo con categorías
      chart.timeScale().applyOptions({
        tickMarkFormatter: (time) => categories[time - 1] || "",
      });

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

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};

export default CategoryExpenseChart;
