import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RegisterForm from './RegisterForm'; 
import VerifyCode from './VerifyCode';
import {SafeAreaView} from "react-native-safe-area-context";

const RegisterAuth = () => {
    const [email, setEmail] = useState(null);

    const handleRegisterSuccess = (registeredEmail) => {
        setEmail(registeredEmail);
        console.log("Email registrado:", registeredEmail); 
    };

    return (
        <SafeAreaView
            style={[styles.container]}
            edges={['top', 'right', 'left', 'bottom']}
        >
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
        </SafeAreaView>

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
