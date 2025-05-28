import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import config from '../config/config'; 

const VerifyCode = ({ email }) => {

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [verified, setVerified] = useState(false); 

    const navigation = useNavigation();

    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setIsModalVisible(true);
    };

    const handleVerify = async () => {
        setMessage(null); 
        setLoading(true);

        if (!email) {
            showMessage('Error: No se proporcionó el email para la verificación.', true);
            setLoading(false);
            return;
        }
        if (!code) {
            showMessage('Por favor, ingresa el código de verificación.', true);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${config.API_URL}${config.AUTH.VERIFY}`,
                { email, code }
            );

            if (response.status === 200) {
                setVerified(true);
                const { token, name } = response.data;
                if (token) {
                    await SecureStore.setItemAsync('token', token); 
                }
                if (name) {
                    await AsyncStorage.setItem('userName', name); 
                }
                console.log("Verification successful");
                showMessage("¡Tu email ha sido verificado exitosamente!", false);
                setTimeout(() => {
                    navigation.replace('Login');
                }, 1500);
            } else {
                showMessage('Código de verificación incorrecto.', true);
            }
        } catch (err) {
            console.error("Error de verificación:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.message || 'Error de conexión desconocido.';
            showMessage(`Error de conexión: ${errorMessage}`, true);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setMessage(null); 
        setLoading(true);

        if (!email) {
            showMessage('Error: No se proporcionó el email para reenviar el código.', true);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${config.API_URL}${config.AUTH.RESEND_CODE}`,
                { email }
            );
            console.log(response.data.message);
            showMessage(response.data.message || "Código reenviado exitosamente.", false);
        } catch (err) {
            console.error("Error al reenviar código:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.message || 'Error de conexión desconocido.';
            showMessage(`Error de conexión: ${errorMessage}`, true);
        } finally {
            setLoading(false);
        }
    };

    if (verified) {
        return (
            <View style={styles.container}>
                <Text style={styles.verifiedText}>¡Tu email ha sido verificado!</Text>
                <Text style={styles.verifiedSubText}>Redirigiendo al inicio...</Text>
                <ActivityIndicator size="large" color="#4B9CE2" style={{ marginTop: 20 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verificación de Código</Text>
            <Text style={styles.instructionText}>
                Por favor, ingresa el código de verificación enviado a {email || 'tu correo electrónico'}.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de Verificación</Text>
                <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={(text) => setCode(text)}
                    placeholder="Ingresa tu código"
                    keyboardType="numeric"
                    editable={!loading}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title={loading ? 'Verificando...' : 'Verificar'}
                    onPress={handleVerify}
                    disabled={loading || code.length === 0} 
                    color="#4B9CE2"
                />
                <View style={{ height: 15 }} /> 
                <Button
                    title={loading ? 'Enviando...' : 'Reenviar Código'}
                    onPress={handleResend}
                    disabled={loading}
                    color="#B0B0B0"
                />
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setIsModalVisible(false)} 
                >
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalText, message?.isError ? styles.modalErrorText : styles.modalSuccessText]}>
                            {message?.text}
                        </Text>
                        <Pressable onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    instructionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#555',
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 15,
        backgroundColor: 'white',
        color: 'black',
        fontSize: 18,
    },
    buttonContainer: {
        marginTop: 40,
        width: '100%',
        minHeight: 100,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 10,
        alignItems: 'center',
    },
    verifiedText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'green',
        marginBottom: 10,
    },
    verifiedSubText: {
        fontSize: 16,
        color: '#555',
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

export default VerifyCode;
