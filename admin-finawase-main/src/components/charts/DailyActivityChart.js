import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const DailyActivityChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    const series = chart.addHistogramSeries();

    const fetchData = async () => {
      const dataByDay = {};
      const querySnapshot = await getDocs(collection(db, "userActivity"));
      querySnapshot.forEach((doc) => {
        const date = doc.data().timestamp.toDate().toLocaleDateString();
        dataByDay[date] = (dataByDay[date] || 0) + 1;
      });

      series.setData(
        Object.keys(dataByDay).map((date, index) => ({
          time: index + 1,
          value: dataByDay[date],
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
    };

    fetchData();

    return () => chart.remove();
  }, []);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};

export default DailyActivityChart;
