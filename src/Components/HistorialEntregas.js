import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from '../axiosInstance';

const estadoToString = (estadoId) => {
  if (estadoId === 3) return 'Finalizado';
  // Podés agregar más estados si los necesitás
  return estadoId;
};

const HistorialEntregas = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get('/entregas/historial');
        setHistorial(response.data);
      } catch (error) {
        setHistorial([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#2d3a4b" />;
  }

  if (historial.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay historial de entregas.</Text>;
  }

  return (
    <FlatList
      data={historial}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Entrega #{item.id}</Text>
          <Text>Cliente: {item.cliente}</Text>
          <Text>Producto: {item.producto}</Text>
          <Text>Estado: {estadoToString(item.estadoId)}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f6f8fc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3a4b',
  },
  title: { fontWeight: 'bold', marginBottom: 4 },
});

export default HistorialEntregas;