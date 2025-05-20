import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, StatusBar, Button, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from '../axiosInstance';
import config from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const DetalleEntregaPendiente = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { entrega_id } = route.params;

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [showImage, setShowImage] = useState(false);

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
    setShowImage(true);

    setTimeout(async () => {
      setShowImage(false);
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
    }, 7000);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F27121" />
      </LinearGradient>
    );
  }

  if (!detalle) {
    return (
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>No se encontró la entrega.</Text>
      </LinearGradient>
    );
  }

return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" translucent />

        {showImage ? (
          <Image
            source={require('../assets/qr_imagen.jpeg')} 
            style={styles.fullscreenImage}
            resizeMode="contain" // Ajusta la imagen para que cubra toda la pantalla
          />
        ) : (
          <View style={styles.container}>
            <Text style={styles.title}>Detalle de Entrega Pendiente</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Cliente: <Text style={styles.value}>{detalle.cliente}</Text></Text>
              <Text style={styles.label}>DNI: <Text style={styles.value}>{detalle.clienteDni}</Text></Text>
              <Text style={styles.label}>Producto: <Text style={styles.value}>{detalle.producto}</Text></Text>
              <Text style={styles.label}>Ruta ID: <Text style={styles.value}>{detalle.rutaId}</Text></Text>
              <Text style={styles.label}>Estado: <Text style={styles.value}>Pendiente</Text></Text>
              <Text style={styles.label}>Fecha Creación: <Text style={styles.value}>{detalle.fechaCreacion}</Text></Text>
            </View>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={finalizarEntrega}
              disabled={finalizando}
              activeOpacity={0.8}
            >
              <Text style={styles.qrButtonText}>{finalizando ? 'Finalizando...' : 'QR'}</Text>
            </TouchableOpacity>
            <Button title="Volver" color="#F27121" onPress={() => navigation.goBack()} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F27121',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#16213E',
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    color: '#16213E',
    marginBottom: 4,
    fontSize: 16,
  },
  value: {
    fontWeight: 'normal',
    color: '#222',
  },
  qrButton: {
    backgroundColor: '#fff',
    borderColor: '#black',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#F27121',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  qrButtonText: {
    color: '#black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  fullscreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
});

export default DetalleEntregaPendiente;