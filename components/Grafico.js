import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Grafico({ registros }) {
  if (registros.length < 2) {
    return (
      <Text style={{ textAlign: 'center', margin: 10 }}>
        Adicione pelo menos 2 registros para ver o gráfico.
      </Text>
    );
  }

  const data = {
    labels: registros
      .map(reg => new Date(reg.id).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
      .reverse(),
    datasets: [
      {
        data: registros.map(reg => reg.whey).reverse(), // 🧃 gráfico de whey
      },
    ],
  };

  return (
    <View>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Evolução (Whey)</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisSuffix=" copos"
        chartConfig={{
          backgroundColor: '#1e3a5f',
          backgroundGradientFrom: '#3b5998',
          backgroundGradientTo: '#192f6a',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
}
