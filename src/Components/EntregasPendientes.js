import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from '../axiosInstance';

const EntregasPendientes = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get('/entregas/pendientes');
        setEntregas(response.data);
      } catch (error) {
        setEntregas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregas();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#2d3a4b" />;
  }

  if (entregas.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay entregas pendientes.</Text>;
  }

  return (
    <FlatList
      data={entregas}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Entrega #{item.id}</Text>
          <Text>Cliente: {item.cliente}</Text>
          <Text>Producto: {item.producto}</Text>
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

export default EntregasPendientes;