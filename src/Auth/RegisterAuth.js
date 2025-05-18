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
                <Text style={styles.title}>
                    {email ? 'Verifica tu Correo Electrónico' : 'Registrarse'}
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
        backgroundColor: 'white' 
    },
    formContainer: { 
        padding: 20, 
        borderRadius: 10, 
        width: '90%' 
    },
    title: {
        fontSize: 28,
        marginBottom: 5,
        textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold',
        color: 'black',
    },
});

export default RegisterAuth;
