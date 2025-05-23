import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import config from '../config/config';
import axiosInstance from '../axiosInstance';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

const DetalleEntregaHistorial = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { entrega_id } = route.params;

    const [detalleEntrega, setDetalleEntrega] = useState(null);
    const [detalleRuta, setDetalleRuta] = useState(null);
    const [estadoNombre, setEstadoNombre] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [origenAddress, setOrigenAddress] = useState('');
    const [destinoAddress, setDestinoAddress] = useState('');

    useEffect(() => {
        if (entrega_id) {
            cargarDetalleEntrega(entrega_id);
        } else {
            Alert.alert('Error', 'ID de entrega no encontrado');
            navigation.goBack();
        }
    }, [entrega_id, navigation]);

    const cargarDetalleEntrega = async (id) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Cargando detalle de entrega con ID:', id);
            const token = await SecureStore.getItemAsync('token');
            console.log('Token enviado:', token);
            const url = config.API_URL + config.ENTREGAS.GET_BY_ID.replace('{entrega_id}', id);
            console.log('URL de la petición de detalle de entrega:', url);
            const responseEntrega = await axiosInstance.get(url);
            console.log('Respuesta de detalle de entrega:', responseEntrega);
            if (responseEntrega.status === 200 && responseEntrega.data) {
                setDetalleEntrega(responseEntrega.data);
                cargarNombreEstado(responseEntrega.data.estadoId);
                cargarDetalleRuta(responseEntrega.data.rutaId);
            } else {
                const errorMessage = `Error al cargar detalle de entrega. Status: ${responseEntrega.status}`;
                setError(errorMessage);
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('Error al cargar detalle de entrega:', error);
            setError(`Error de conexión al cargar detalle: ${error.message}`);
            Alert.alert('Error', `Error de conexión al cargar detalle: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cargarDetalleRuta = async (rutaId) => {
        setError(null);
        try {
            console.log('Cargando detalle de ruta con ID:', rutaId);
            const url = config.API_URL + config.RUTAS.GET_BY_ID.replace('{ruta_id}', rutaId);
            console.log('URL de la petición de detalle de ruta:', url);
            const responseRuta = await axiosInstance.get(url);
            console.log('Respuesta de detalle de ruta:', responseRuta);
            if (responseRuta.status === 200 && responseRuta.data) {
                setDetalleRuta(responseRuta.data);
            } else {
                const errorMessage = `Error al cargar detalle de la ruta. Status: ${responseRuta.status}`;
                setError(errorMessage);
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('Error al cargar detalle de la ruta:', error);
            setError(`Error de conexión al cargar detalle de la ruta: ${error.message}`);
            Alert.alert('Error', `Error de conexión al cargar detalle de la ruta: ${error.message}`);
        }
    };

    const cargarNombreEstado = async (estadoId) => {
        setError(null);
        try {
            console.log('Cargando nombre de estado con ID:', estadoId);
            const url = config.API_URL + config.ESTADOS.GET_BY_ID.replace('{estado_id}', estadoId);
            console.log('URL de la petición de estado:', url);
            const responseEstado = await axiosInstance.get(url);
            console.log('Respuesta de estado:', responseEstado);
            if (responseEstado.status === 200 && responseEstado.data) {
                setEstadoNombre(responseEstado.data.nombre);
            } else {
                setEstadoNombre(`Estado ID: ${estadoId} (Error al cargar nombre. Status: ${responseEstado.status})`);
            }
        } catch (error) {
            console.error('Error al cargar nombre de estado:', error);
            setEstadoNombre(`Estado ID: ${estadoId} (Error de conexión: ${error.message})`);
        }
    };

    const configurarMapa = async () => {
        if (detalleRuta && mapReady) {
            const origen = { latitude: detalleRuta.latitudOrigen, longitude: detalleRuta.longitudOrigen };
            const destino = { latitude: detalleRuta.latitudDestino, longitude: detalleRuta.longitudDestino };

            try {
                const origenResult = await Geocoder.from(origen.latitude, origen.longitude);
                if (origenResult.results.length > 0) {
                    setOrigenAddress(`Origen: ${origenResult.results[0].formatted_address}`);
                }

                const destinoResult = await Geocoder.from(destino.latitude, destino.longitude);
                if (destinoResult.results.length > 0) {
                    setDestinoAddress(`Destino: ${destinoResult.results[0].formatted_address}`);
                }
            } catch (error) {
            }
        }
    };

    const onMapReadyHandler = () => {
        setMapReady(true);
    };

    useEffect(() => {
        configurarMapa();
    }, [detalleRuta, mapReady]);

    const handleVolver = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#F27121" />
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>{error}</Text>
            </LinearGradient>
        );
    }

    if (!detalleEntrega) {
        return (
            <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>No se encontraron detalles de la entrega.</Text>
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
                <ScrollView style={styles.scrollView}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Detalle de Entrega</Text>
                        <View style={styles.card}>
                            <Text style={styles.label}>Cliente: <Text style={styles.value}>{detalleEntrega.cliente}</Text></Text>
                            <Text style={styles.label}>DNI: <Text style={styles.value}>{detalleEntrega.clienteDni}</Text></Text>
                            <Text style={styles.label}>Producto: <Text style={styles.value}>{detalleEntrega.producto}</Text></Text>
                            <Text style={styles.label}>Ruta ID: <Text style={styles.value}>{detalleEntrega.rutaId}</Text></Text>
                            <Text style={styles.label}>Estado: <Text style={styles.value}>{estadoNombre}</Text></Text>
                            <Text style={styles.label}>Fecha Creación: <Text style={styles.value}>{detalleEntrega.fechaCreacion}</Text></Text>
                            <Text style={styles.label}>Fecha Finalización: <Text style={styles.value}>{detalleEntrega.fechaFinalizacion}</Text></Text>
                        </View>
                        <Text style={styles.mapTitle}>Ubicación de la Ruta</Text>
                        {detalleRuta ? (
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: (detalleRuta.latitudOrigen + detalleRuta.latitudDestino) / 2,
                                        longitude: (detalleRuta.longitudOrigen + detalleRuta.longitudDestino) / 2,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,
                                    }}
                                    onMapReady={onMapReadyHandler}
                                >
                                    <Marker
                                        coordinate={{ latitude: detalleRuta.latitudOrigen, longitude: detalleRuta.longitudOrigen }}
                                        title="Origen"
                                    />
                                    <Marker
                                        coordinate={{ latitude: detalleRuta.latitudDestino, longitude: detalleRuta.longitudDestino }}
                                        title="Destino"
                                    />
                                    <Polyline
                                        coordinates={[
                                            { latitude: detalleRuta.latitudOrigen, longitude: detalleRuta.longitudOrigen },
                                            { latitude: detalleRuta.latitudDestino, longitude: detalleRuta.longitudDestino },
                                        ]}
                                        strokeColor="#F27121"
                                        strokeWidth={3}
                                    />
                                </MapView>
                                <Text style={styles.addressText}>{origenAddress}</Text>
                                <Text style={styles.addressText}>{destinoAddress}</Text>
                            </View>
                        ) : (
                            <Text style={{ color: '#fff' }}>Cargando mapa...</Text>
                        )}
                        <Button title="Volver" color="#F27121" onPress={handleVolver} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#F27121',
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
    mapTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#fff',
        textAlign: 'center',
    },
    mapContainer: {
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
        borderColor: '#F27121',
        borderWidth: 2,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    addressText: {
        marginTop: 5,
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
    },
});

export default DetalleEntregaHistorial;