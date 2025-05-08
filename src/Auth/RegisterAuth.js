import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RegisterForm from './RegisterForm'; 
import VerifyCode from './VerifyCode'; 

const RegisterAuth = () => {
    const [email, setEmail] = useState(null);

    const handleRegisterSuccess = (registeredEmail) => {
        setEmail(registeredEmail);
        console.log("Email registrado:", registeredEmail); 
    };
    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.header}>
                    {email ? 'Verify Your Email' : 'Register'}
                </Text>
                {email ? (
                    <VerifyCode email={email} />
                ) : (
                    <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default RegisterAuth;
