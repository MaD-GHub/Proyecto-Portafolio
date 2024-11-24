import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const UserActivityDistributionChart = () => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });
    const series = chart.addHistogramSeries();

    const fetchData = async () => {
      const userActivityCounts = {};
      const querySnapshot = await getDocs(collection(db, "userActivity"));

      querySnapshot.forEach((doc) => {
        const userId = doc.data().userId;
        userActivityCounts[userId] = (userActivityCounts[userId] || 0) + 1;
      });

      series.setData(
        Object.keys(userActivityCounts).map((userId, index) => ({
          time: index + 1,
          value: userActivityCounts[userId],
        }))
      );
    };

    fetchData();

    return () => chart.remove();
  }, []);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};

export default UserActivityDistributionChart;
