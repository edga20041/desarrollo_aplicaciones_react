import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken } from '../redux/authSlice'; // Asegúrate de que la ruta sea correcta
// Configuración de la API (similar a tu ApiService de Android)
const api = axios.create({
    baseURL: 'http://192.168.1.10:8081', //  Asegúrate de que esta URL sea correcta
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para manejar las llamadas a la API (adaptador)
const apiCall = async (method, url, data = null) => {
    try {
        const response = await api({
            method,
            url,
            data,
        });
        return response.data;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        if (error.response) {
             console.error("Detalles del error:", error.response.data);
            Alert.alert("Error", `Error del servidor: ${error.response.status}`);
        } else if (error.request) {
             console.error("No se recibió respuesta del servidor:", error.request);
            Alert.alert("Error", "No se recibió respuesta del servidor.");
        } else {
             console.error("Error al configurar la solicitud:", error.message);
            Alert.alert("Error", "Error al configurar la solicitud.");
        }
        throw error; // Re-lanza el error para que el componente lo maneje
    }
};

const VerifyCodeScreen = () => {
    const navigation = useNavigation();
    const [codigo, setCodigo] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const API_VERIFY_CODE = '/user/verify';  // Endpoint para verificar
    const API_RESEND_CODE = '/user/resendVerificationCode'; // Endpoint para reenviar

    useEffect(() => {
        const getEmail = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('email');
                if (storedEmail) {
                    setEmail(storedEmail);
                } else {
                    Alert.alert("Error", "Email no encontrado. Por favor, regístrate nuevamente.");
                    navigation.navigate('Register');
                }
            } catch (error) {
                console.error("Error al obtener el email:", error);
                Alert.alert("Error", "No se pudo obtener el email.");
            }
        };
        getEmail();
    }, []);

    const verificarCodigo = async () => {
        if (!codigo) {
            Alert.alert('Error', 'Por favor, ingresa el código de verificación.');
            return;
        }
        setLoading(true);
        try {
            const data = await apiCall('POST', API_VERIFY_CODE, { 
                verificationCode: codigo, 
                email: email
            });
            console.log('Verificación exitosa. JWT:', data.token);
            await AsyncStorage.setItem('userToken', data.token);
            dispatch(saveToken(data.token));

            Alert.alert(
                'Verificación Exitosa',
                'Tu cuenta ha sido verificada.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Home');
                        },
                    },
                ],
            );
        } catch (error) {
           // El error ya fue manejado por apiCall, no necesitas hacer nada aquí, pero debes quitar el finally
        } finally{
            setLoading(false);
        }
    };

    const reenviarCodigo = async () => {
         if (!email) {
            Alert.alert('Error', 'No se puede reenviar el código. Email no disponible.');
            return;
        }
        setLoading(true);
        try {
            Alert.alert('Reenviando', 'Enviando nuevo código de verificación...');
            const data = await apiCall('POST', API_RESEND_CODE, { email });
             Alert.alert('Código Reenviado', data.message, [{ text: 'OK' }]);
        } catch (error) {
             // El error ya fue manejado por apiCall
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Ingresa el código de verificación"
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="number-pad"
            />
            <Button
                title={loading ? 'Verificando...' : 'Confirmar Código'}
                onPress={verificarCodigo}
                disabled={loading}
            />
            <Button
                title={loading ? 'Reenviando...' : 'Reenviar Código'}
                onPress={reenviarCodigo}
                color="gray"
                disabled={loading}
                style={{ marginTop: 10 }}
            />
             <Button
                title="Volver"
                onPress={() => navigation.goBack()}
                color="gray"
                style={{ marginTop: 10 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
        borderRadius: 5,
    },
    button: {
        width: '100%',
        marginTop: 10,
    },
});

export default VerifyCodeScreen;
