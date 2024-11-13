// components/ChartSection.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const ChartSection = ({ transactions, selectedTab }) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Mes');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filtrar transacciones según el `selectedTimeFrame`
    filterData();
  }, [selectedTimeFrame, selectedTab, transactions]);

  const filterData = () => {
    // Realizar el filtrado de datos en base al `selectedTimeFrame` y `selectedTab`
    let filteredTransactions = transactions;
    // Aplicar filtros de tiempo aquí usando `moment()`
    setFilteredData(filteredTransactions);
  };

  const timeFrames = ['Día', 'Semana', 'Mes', 'Año'];
  const chartData = {
    labels: filteredData.map((data) => moment(data.date).format('DD MMM')),
    datasets: [
      {
        data: filteredData.map((data) => data.amount),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffffff' },
  };

  return (
    <View>
      <View style={styles.timeFrameButtons}>
        {timeFrames.map((frame) => (
          <TouchableOpacity
            key={frame}
            style={[styles.timeFrameButton, selectedTimeFrame === frame && styles.activeButton]}
            onPress={() => setSelectedTimeFrame(frame)}
          >
            <Text style={[styles.timeFrameText, selectedTimeFrame === frame && styles.activeText]}>
              {frame}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <LineChart
        data={chartData}
        width={300}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timeFrameButtons: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 },
  timeFrameButton: { padding: 8 },
  activeButton: { borderBottomWidth: 2, borderBottomColor: '#511496' },
  timeFrameText: { fontSize: 14, color: '#6d6d6d' },
  activeText: { color: '#511496' },
  chart: { borderRadius: 16 },
});

export default ChartSection;
