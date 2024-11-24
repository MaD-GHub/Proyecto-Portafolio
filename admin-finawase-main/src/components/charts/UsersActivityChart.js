// src/components/charts/UsersActivityChart.js

import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const UsersActivityChart = ({ userActivityData }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Verificar si los datos existen y tienen al menos un elemento
    if (userActivityData && userActivityData.length > 0) {
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
        rightPriceScale: {
          visible: true,
        },
        timeScale: {
          barSpacing: 10,
          lockVisibleTimeRangeOnResize: true,
          rightOffset: 12,
        },
        grid: {
          vertLines: { color: "#e1e3e6" },
          horzLines: { color: "#f0f3fa" },
        },
      });

      chartRef.current = chart;

      const series = chart.addHistogramSeries({
        color: "#3b82f6",
        priceFormat: { type: "volume" },
        scaleMargins: { top: 0.2, bottom: 0 },
      });

      series.setData(
        userActivityData.map((data, index) => ({
          time: index + 1,
          value: data.activityCount,
          color: "#3b82f6",
        }))
      );

      chart.timeScale().applyOptions({
        tickMarkFormatter: (time) => userActivityData[time - 1]?.date || "",
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
  }, [userActivityData]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }}>
      {/* Mensaje alternativo de carga */}
      {(!userActivityData || userActivityData.length === 0) && (
        <p>Cargando datos del gráfico...</p>
      )}
    </div>
  );
};

export default UsersActivityChart;
