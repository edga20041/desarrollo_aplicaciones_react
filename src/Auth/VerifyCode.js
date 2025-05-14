import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import config from '../config/config';

const VerifyCode = ({ email }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verified, setVerified] = useState(false);

    const navigation = useNavigation();

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
                navigation.navigate('Home');
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
        setLoading(true);
        try {
            const response = await axios.post(
                `${config.API_URL}${config.AUTH.RESEND_CODE}`,
                { email }
            );
            console.log(response.data.message);
            Alert.alert("Success", response.data.message);
            navigation.navigate('Home');
        } catch (err) {
            setError(`Error de conexión: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (verified) {
        return (
            <View style={styles.container}>
                <Text>Your email has been verified! You can now log in.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>Please enter the verification code sent to {email}</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={(text) => setCode(text)}
                    placeholder="Enter your code"
                    keyboardType="numeric"
                />
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <Button
                    title={loading ? 'Verifying...' : 'Verify'}
                    onPress={handleVerify}
                    disabled={loading}
                    color="#4B9CE2"
                    style={{ marginBottom: 10 }}
                />
                <Button
                    title={loading ? 'Sending...' : 'Resend Code'}
                    onPress={handleResend}
                    disabled={loading}
                    color="#B0B0B0"
                />
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
    inputContainer: {
        width: '100%',
        marginVertical: 10,
        marginTop: 120, 
    },
    label: {
        fontSize: 16,
        color: '#333', 
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        backgroundColor: 'white', 
        color: 'black', 
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
        marginTop: 50, 
        width: '100%',
        minHeight: 100,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 10,
        alignItems: 'center',
    },
});

export default VerifyCode;