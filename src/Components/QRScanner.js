import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, ActivityIndicator, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from '../axiosInstance';
import config from '../config/config';

const QRScanner = ({ navigation,route }) => {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { entrega_id, repartidor_id } = route.params;

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
     
    requestPermission();

    const qrUrl = `${config.API_URL}${config.QR.GENERAR_VISTA}?text=${entrega_id}`;
    fetch(qrUrl)
    .then(() => console.log("QR generado y abierto en la PC"))
    .catch((err) => console.error("Error al generar QR:", err));

}, [])


  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      const entregaId = data;
      const url = config.API_URL + config.ENTREGAS.CAMBIAR_ESTADO;
      const body = {
        entregaId,
        estadoId: 2,
        repartidorId: repartidor_id,
      };
      const response = await axios.patch(url, body);
      Alert.alert(
        'Código QR escaneado',
        `ID: ${entregaId}\nEstado actualizado: ${response.data.estado}`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setScanned(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Error al procesar el código QR: ${error.message}`, [
        { text: 'Aceptar', onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No hay acceso a la cámara</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <Surface style={[styles.container, { paddingTop: insets.top }]}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={[styles.button, { marginTop: 10 }]}
            >
              Volver
            </Button>
          </View>
        </>
      </CameraView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  unfilled: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 200,
  },
  scanner: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#03dac6',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    borderRadius: 8,
  },
});

export default QRScanner;