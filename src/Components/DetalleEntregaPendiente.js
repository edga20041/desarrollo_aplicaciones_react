import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from '../axiosInstance';
import config from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetalleEntregaPendiente = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { entrega_id } = route.params;

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const url = config.API_URL + config.ENTREGAS.GET_BY_ID.replace('{entrega_id}', entrega_id);
        const response = await axios.get(url);
        setDetalle(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el detalle de la entrega.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [entrega_id]);

  const finalizarEntrega = async () => {
    setFinalizando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const url = config.API_URL + config.ENTREGAS.CAMBIAR_ESTADO; 
      const body = {
        entregaId: detalle.id,
        estadoId: 3,
        repartidorId: detalle.repartidorId 
      };
      await axios.patch(url, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Éxito', 'La entrega fue finalizada.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo finalizar la entrega.');
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2d3a4b" />;
  }

  if (!detalle) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No se encontró la entrega.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de Entrega Pendiente</Text>
      <Text>Cliente: {detalle.cliente}</Text>
      <Text>DNI: {detalle.clienteDni}</Text>
      <Text>Producto: {detalle.producto}</Text>
      <Text>Ruta ID: {detalle.rutaId}</Text>
      <Text>Estado: Pendiente</Text>
      <Text>Fecha Creación: {detalle.fechaCreacion}</Text>
      <TouchableOpacity
        style={styles.qrButton}
        onPress={finalizarEntrega}
        disabled={finalizando}
        activeOpacity={0.8}
      >
        <Text style={styles.qrButtonText}>{finalizando ? 'Finalizando...' : 'QR'}</Text>
      </TouchableOpacity>
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#2d3a4b' },
  qrButton: {
    backgroundColor: '#fff',
    borderColor: '#2d3a4b',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 24,
  },
  qrButtonText: {
    color: '#2d3a4b',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default DetalleEntregaPendiente;