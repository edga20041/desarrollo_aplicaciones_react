import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import config from '../config/config';

const VerifyCode = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [verified, setVerified] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => null,
            gestureEnabled: false,
        });
    }, [navigation]);

    const handleVerify = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}${config.AUTH.VERIFY}`,
                { email, code }
            );

            if (response.status === 200) {
                setVerified(true);
                console.log("Verification successful");
                navigation.navigate('Home')
            } else {
                setError('Código de verificación incorrecto.');
            }
        } catch (err) {
            setError(`Error de conexión: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError(null);
        setResendLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}${config.AUTH.RESEND_CODE}`,
                { email }
            );
            console.log(response.data.message);
            Alert.alert("Codigo reenviado", response.data.message);

        } catch (err) {
            setError(`Error de conexión: ${err.message}`);
        } finally {
            setResendLoading(false); 
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verifica tu cuenta</Text>
            <Text style={styles.subtitle}>
                Ingresa el código de verificación enviado a tu correo electrónico.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de verificación</Text>
                <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={(text) => setCode(text)}
                    placeholder="Ingrese el código"
                    keyboardType="numeric"
                />
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title={loading ? 'Verificando...' : 'Verificar Codigo'}
                        onPress={handleVerify}
                        disabled={loading}
                        color="#4B9CE2"
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title={resendLoading ? 'Enviando...' : 'Reenviar Codigo'} 
                        onPress={handleResend}
                        disabled={resendLoading} 
                        color="#B0B0B0"
                    />
                </View>
            </View>
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
        marginTop: 50,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    errorContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ffdddd',
        borderRadius: 5,
    },
    errorText: {
        color: '#e74c3c',
    },
    buttonContainer: {
        marginTop: 10,
        width: '100%',
        minHeight: 100,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonWrapper: {
        marginVertical: 5,
        width: '80%',
    },
});

export default VerifyCode;