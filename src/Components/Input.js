import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    rightIcon,
    style,
    labelStyle,
    inputStyle,
    placeholderTextColor,
}) => {
    return (
        <View style={[{ marginBottom: 10 }, style]}>
            <Text style={labelStyle}>{label}</Text>
            <View style={[{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderRadius: 5, 
                paddingLeft: 10, 
                marginBottom: 5,
                height: 45,
                width: '95%',
                alignSelf: 'center'
            }, inputStyle]}>
                <TextInput
                    style={{ 
                        flex: 1, 
                        height: 45,
                        color: '#fff',
                        fontSize: 15
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                />
                {rightIcon && (
                    <View style={{ marginRight: 10 }}>
                        {rightIcon}
                    </View>
                )}
            </View>
        </View>
    );
};

export default Input;
