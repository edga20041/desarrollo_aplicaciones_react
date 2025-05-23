import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, StatusBar } from 'react-native';
import * as SecureStore from 'expo-secure-store'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from '../axiosInstance';
import Input from '../Components/Input'; 
import { useNavigation } from '@react-navigation/native';
import config from '../config/config'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const LoginAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); 
    const [isModalVisible, setIsModalVisible] = useState(false); 

    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setIsModalVisible(true);
    };

    useEffect(() => {
        const checkToken = async () => {
            const savedToken = await SecureStore.getItemAsync('token');
            if (savedToken) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            }
        };
        checkToken();
    }, [navigation]);

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showMessage('Por favor, completa todos los campos.', true);
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Por favor, introduce un email válido.', true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.LOGIN}`, {
                email,
                password,
            });

            const token = response.data.token;
            const name = response.data.name; 
            if (token) {
                await SecureStore.setItemAsync('token', token);
                if (name) {
                    await AsyncStorage.setItem('userName', name);
                }
                showMessage('¡Bienvenido!', false);
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }, 1500); 
            } else {
                showMessage('Token no recibido del servidor.', true);
            }
        } catch (error) {
            console.error("Error de login:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Credenciales incorrectas o problema de conexión.';
            showMessage(errorMessage, true);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E94057" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Input
                label="Correo electrónico"
                placeholder="Correo electrónico"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                labelStyle={styles.label}
                inputStyle={styles.inputField}
            />
            <Input
                label="Contraseña"
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                labelStyle={styles.label}
                inputStyle={styles.inputField}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#E94057" style={styles.loadingSpinner} />
            ) : (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <LinearGradient colors={['#F27121', '#E94057']} style={styles.buttonGradient}>
                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
            <View style={styles.links}>
                <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')}>
                    <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
                </TouchableOpacity>
            </View>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 35,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    loadingSpinner: {
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold',
        color: 'black',
    },
    input: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        fontFamily: 'Montserrat_400Regular',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Montserrat_400Regular',
    },
    loginButton: {
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20, 
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
    },
    links: {
        marginTop: 30,
        alignItems: 'center',
    },
    link: {
        color: '#007AFF',
        marginTop: 15,
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
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
});

export default LoginAuth;