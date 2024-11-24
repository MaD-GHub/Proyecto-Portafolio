import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const MostFrequentActionsChart = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    const series = chart.addHistogramSeries();

    const fetchData = async () => {
      const actionCounts = {};
      const querySnapshot = await getDocs(collection(db, "userActivity"));

      querySnapshot.forEach((doc) => {
        const action = doc.data().action;
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });

      series.setData(
        Object.keys(actionCounts).map((action, index) => ({
          time: index + 1,
          value: actionCounts[action],
        }))
      );
    };

    fetchData();

    return () => chart.remove();
  }, []);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};

export default MostFrequentActionsChart;
