import React, {useState} from 'react';
import type {Node} from 'react';
import {
  Button,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import base64 from 'react-native-base64';

import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const App: () => Node = () => {
  const manager = new BleManager();
  const devices = [];
  let dev = {};
  let connectedDevice = {};

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission for bluetooth scanning',
          message: 'wahtever',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission for bluetooth scanning granted');
        return true;
      } else {
        console.log('Location permission for bluetooth scanning revoked');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async function requestTurnOnBluetoothPermission() {
    return await BluetoothStateManager.requestToEnable()
      .then(() => true)
      .catch(() => false);
  }

  const scan = () => {
    const permission =
      requestLocationPermission() && requestTurnOnBluetoothPermission();
    if (permission) {
      console.log('scan');
      manager.startDeviceScan(
        null,
        {allowDuplicates: false},
        (error, device) => {
          if (error) {
            console.log('error', error);
            return;
          }
          if (device) {
            devices.push(device);
          }
          if (device?.name === 'TMW012BT') {
            console.log(device);
            dev = device;
            manager.stopDeviceScan();
          }
        },
      );
    }
  };

  const [values, setValues] = useState([]);

  console.log(values, 'VALUES');

  const connect = async () => {
    const permission = await requestTurnOnBluetoothPermission();
    console.log(permission, 'before if');
    if (permission) {
      console.log('permission', permission);
      console.log('connect', dev.id);
      manager
        .connectToDevice('00:A0:50:D2:D2:90', {requestMTU: 512})
        .then(async d => {
          console.log(d, 'CONNECTED DEV');
          connectedDevice = d;
          console.log(connectedDevice);

          d.discoverAllServicesAndCharacteristics().then(data => {
            console.log(data, 'DATA');
            data.services().then(services => {
              d.characteristicsForService(
                '71712a7e-bc95-4e65-a522-ea125ba4ac47',
              ).then(ch => {
                console.log(ch, 'CH');
                ch.forEach(c => {
                  if (c.uuid === '86f4e91d-07ac-47cc-916b-69c8789635d3') {
                    console.log('UUID', c.uuid);
                    c.isNotifiable &&
                      c
                        .writeWithResponse(base64.encode('RD'))
                        .then(res => {
                          console.log('Success', res);
                          c.monitor((err, chadata) => {
                            if (err) {
                              console.log(err, 'ERROR');
                            }
                            setValues(prev => [...prev, chadata.value]);
                            console.log('READ-1', chadata);
                          });
                        })

                        .catch(e => console.log('Error', e));
                  }
                });
              });
            });
          });
        });
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Button title={'Scan'} onPress={scan} />
        {/*<Button title={'Connect'} onPress={connect} />*/}
      </View>

      <TouchableOpacity
        style={{
          width: 300,
          height: 100,
          marginTop: 20,
          alignSelf: 'center',
          backgroundColor: 'pink',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={connect}>
        <Text>Id : 00:A0:50:D2:D2:90</Text>
      </TouchableOpacity>

      <View>
        {values.map(val => (
          <Text key={val}>
            {val} - {base64.decode(val)}
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default App;
