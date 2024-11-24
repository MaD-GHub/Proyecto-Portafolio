// src/components/charts/MostVisitedScreensChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const MostVisitedScreensChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#e1e3e6" },
        horzLines: { color: "#f0f3fa" },
      },
    });

    const series = chart.addHistogramSeries({
      color: "#3b82f6",
      priceFormat: { type: "volume" },
      scaleMargins: { top: 0.2, bottom: 0 },
    });

    const fetchData = async () => {
      const screenCounts = {};
      const q = query(
        collection(db, "userActivity"),
        where("action", "==", "navigate")
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const screen = doc.data().details?.screen;
        if (screen) {
          screenCounts[screen] = (screenCounts[screen] || 0) + 1;
        }
      });

      const data = Object.keys(screenCounts).map((screen, index) => ({
        time: index + 1, // Using index + 1 as a workaround for lightweight-charts
        value: screenCounts[screen],
        color: "#3b82f6",
        screenName: screen, // Storing screen name for tooltip
      }));

      series.setData(data);

      // Customize the labels on the time axis
      chart.timeScale().applyOptions({
        tickMarkFormatter: (time) => {
          const item = data.find((d) => d.time === time);
          return item ? item.screenName : "";
        },
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
    };
    
    fetchData();

    return () => chart.remove();
  }, []);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />
  );
};

export default MostVisitedScreensChart;
