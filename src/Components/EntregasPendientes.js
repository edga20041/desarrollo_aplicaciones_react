import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import axios from '../axiosInstance';
import { useNavigation } from '@react-navigation/native';
import config from '../config/config';

const EntregasPendientes = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
   const navigation = useNavigation();

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const response = await axios.get(config.ENTREGAS.PENDIENTES);
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

  const handleEntregaPress = (entregaId) => {
    navigation.navigate('Detalle Entrega Pendiente', { entrega_id: entregaId });
  };

  return (
    <FlatList
      data={entregas}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleEntregaPress(item.id)}>
          <View style={styles.card}>
            <Text style={styles.title}>Entrega #{item.id}</Text>
            <Text>Cliente: {item.cliente}</Text>
            <Text>Producto: {item.producto}</Text>
          </View>
        </TouchableOpacity>
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