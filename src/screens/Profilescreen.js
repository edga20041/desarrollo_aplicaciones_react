import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';

const PerfilUsuario = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <ActivityIndicator size="large" color="#F27121" />;
  }

  if (!perfil) {
    return <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.value}>ID:{perfil.id}</Text>

      <Text style={styles.value}>Nombre: {perfil.name}</Text>

      <Text style={styles.value}>Apellido: {perfil.surname}</Text>

      <Text style={styles.value}>Email: {perfil.email}</Text>

      <Text style={styles.value}>Telefono: {perfil.phoneNumber}</Text>

      <Text style={styles.value}>DNI: {perfil.dni}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});

export default PerfilUsuario;

