import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await fetch(config.API_URL + config.AUTH.PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPerfil(data);
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.gradient}>
        <ActivityIndicator size="large" color="#F27121" style={{ flex: 1, justifyContent: 'center' }} />
      </LinearGradient>
    );
  }

  if (!perfil) {
    return (
      <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.gradient}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" translucent />
        <View style={styles.container}>
          <Text style={styles.title}>Mi Perfil</Text>
          <View style={styles.card}>
            <Text style={styles.label}>ID: <Text style={styles.value}>{perfil.id}</Text></Text>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{perfil.name}</Text></Text>
            <Text style={styles.label}>Apellido: <Text style={styles.value}>{perfil.surname}</Text></Text>
            <Text style={styles.label}>Email: <Text style={styles.value}>{perfil.email}</Text></Text>
            <Text style={styles.label}>Teléfono: <Text style={styles.value}>{perfil.phoneNumber}</Text></Text>
            <Text style={styles.label}>DNI: <Text style={styles.value}>{perfil.dni}</Text></Text>
          </View>
          <Button title="Volver" color="#F27121" onPress={() => navigation.goBack()} />
        </View>
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
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PerfilUsuario;
