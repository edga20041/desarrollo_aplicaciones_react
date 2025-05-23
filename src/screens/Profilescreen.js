import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';
import axiosInstance from '../axiosInstance';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
 
const ProfileScreen = () => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
 
    const navigation = useNavigation();
 
    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setIsModalVisible(true);
    };
 
    useEffect(() => {
        const fetchPerfil = async () => {
            setLoading(true);
            setPerfil(null);
            setMessage(null);
            try {
                const response = await axiosInstance.get(config.AUTH.PROFILE);
               
                if (response.data) {
                    setPerfil(response.data);
                    showMessage('Perfil cargado exitosamente.', false);
                } else {
                    showMessage('Respuesta vacía del servidor al cargar el perfil.', true);
                }
            } catch (error) {
                console.error('Error al obtener el perfil:', error);
                let errorMessage = 'Error desconocido al obtener el perfil.';
 
                if (error.response) {
                    console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
                    if (error.response.status === 401) {
                        errorMessage = 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.';
                        await SecureStore.deleteItemAsync('token'); 
                        await AsyncStorage.removeItem('userName');
                        navigation.replace('Login');
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = `Error del servidor: ${error.response.status}`;
                    }
                } else if (error.request) {
                    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o la IP del backend.';
                } else {
                    errorMessage = `Error de la aplicación: ${error.message}`;
                }
                showMessage(`Error al obtener el perfil: ${errorMessage}`, true);
            } finally {
                setLoading(false);
            }
        };
 
        fetchPerfil();
    }, [navigation]);
    const handleLogout = async () => {
        setLoading(true);
        try {
            await SecureStore.deleteItemAsync('token');
            await AsyncStorage.removeItem('userName');
            showMessage('Sesión cerrada exitosamente.', false);
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }, 2000);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            showMessage('Error al cerrar sesión.', true);
        } finally {
            setLoading(false);
        }
    };
 
    if (loading) {
        return (
            <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.gradient}>
                <ActivityIndicator size="large" color="#F27121" style={{ flex: 1, justifyContent: 'center' }} />
            </LinearGradient>
        );
    }
 
    return (
        <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.gradient}>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" translucent />
                <View style={styles.container}>
                    <Text style={styles.title}>Mi Perfil</Text>
                    {perfil ? (
                        <View style={styles.card}>
                            <Text style={styles.label}>ID: <Text style={styles.value}>{perfil.id}</Text></Text>
                            <Text style={styles.label}>Nombre: <Text style={styles.value}>{perfil.name}</Text></Text>
                            <Text style={styles.label}>Apellido: <Text style={styles.value}>{perfil.surname}</Text></Text>
                            <Text style={styles.label}>Email: <Text style={styles.value}>{perfil.email}</Text></Text>
                            <Text style={styles.label}>Teléfono: <Text style={styles.value}>{perfil.phoneNumber}</Text></Text>
                            <Text style={styles.label}>DNI: <Text style={styles.value}>{perfil.dni}</Text></Text>
                        </View>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.errorText}>No se pudo cargar la información del perfil.</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => fetchPerfil()}>
                                <Text style={styles.retryButtonText}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
 
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
 
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalText, message?.isError ? styles.modalErrorText : styles.modalSuccessText]}>
                            {message?.text}
                        </Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
        marginBottom: 8,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E94057',
        elevation: 2,
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    logoutText: {
        color: '#E94057',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '80%',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalErrorText: {
        color: '#e74c3c',
    },
    modalSuccessText: {
        color: 'green',
    },
    modalButton: {
        backgroundColor: '#4B9CE2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
    noDataContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    retryButton: {
        backgroundColor: '#4B9CE2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
 
export default ProfileScreen;