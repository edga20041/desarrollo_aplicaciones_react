import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterForm from './RegisterForm';
import VerifyCode from './VerifyCode';

const Stack = createNativeStackNavigator();

const RegisterAuth = () => {
     return (
         <Stack.Navigator initialRouteName="RegisterForm">
            <Stack.Screen
                name="RegisterForm"
                component={RegisterForm}
                options={{ title: 'Registrarse' }}
            />
            <Stack.Screen
                name="VerifyCode"
                component={VerifyCode}
                options={{ title: 'Verificar Email' }}
            />
        </Stack.Navigator>
    );
};  
export default RegisterAuth;