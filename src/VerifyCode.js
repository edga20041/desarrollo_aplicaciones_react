import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const VerifyCode = ({ email }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verified, setVerified] = useState(false);

    const handleVerify = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8081/auth/verify', { email, code });

            if (response.status === 200) {
                setVerified(true);
                console.log("Verification successful");
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
            const response = await axios.post('http://localhost:8080/auth/resend-code', { email });
            console.log(response.data.message);
            Alert.alert("Success", response.data.message);
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

            <Button
                title={loading ? 'Verifying...' : 'Verify'}
                onPress={handleVerify}
                disabled={loading}
                color="#4B9CE2"
            />
            <Button
                title={loading ? 'Sending...' : 'Resend Code'}
                onPress={handleResend}
                disabled={loading}
                color="#B0B0B0"
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
        backgroundColor: '#f8f8f8',
    },
    inputContainer: {
        width: '100%',
        marginVertical: 10,
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
});

export default VerifyCode;
