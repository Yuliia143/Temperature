/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import binaryToBase64, {
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {BleManager} from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const manager = new BleManager();
  const devices = [];
  let dev = {};
  let connectedDevice = {};

  const scan = () => {
    console.log('scan');
    manager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
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
    });
  };

  const connect = () => {
    manager.connectToDevice(dev.id).then(d => {
      console.log(d, 'CONNECTED DEV');
      connectedDevice = d;
      d.discoverAllServicesAndCharacteristics().then(data => {
        console.log(data, 'DATA');
        data.services().then(services => {
          console.log(services, 'SERV');
          // d.readCharacteristicForService(
          //   '71712a7e-bc95-4e65-a522-ea125ba4ac47',
          //   '131f59b3-75da-45bc-baac-bc0a698b6371',
          // ).then(cha => console.log(cha, 'CHA-DATA'));
          d.characteristicsForService(
            '71712a7e-bc95-4e65-a522-ea125ba4ac47',
          ).then(ch => {
            console.log(ch, 'CH');
            ch.forEach(c => {
              if (c.uuid === '131f59b3-75da-45bc-baac-bc0a698b6371') {
                console.log('UUID', c.uuid);
                c.monitor((err, chadata) => {
                  if (err) {
                    console.log(err, 'ERROR');
                  }
                  console.log('READ-1', chadata);
                });

                c.writeWithResponse(base64.encode('C'))
                  .then(res => {
                    console.log('Success', res);

                    c.monitor((err, chadata) => {
                      if (err) {
                        console.log(err, 'ERROR');
                      }
                      console.log('READ-1', chadata);
                    });
                  })

                  .catch(e => console.log('Error', e));
              }
            });
          });

          // d.characteristicsForService(
          //   '71712a7e-bc95-4e65-a522-ea125ba4ac47',
          // ).then(ch => {
          //   console.log(ch, 'CH');
          //   ch.forEach(c => {
          //     if (c.uuid === '86f4e91d-07ac-47cc-916b-69c8789635d3') {
          //       console.log('UUID', c.uuid);
          //       d.monitorCharacteristicForService(
          //         '71712a7e-bc95-4e65-a522-ea125ba4ac47',
          //         c.uuid,
          //         (err, cr) => {
          //           console.log('monitor');
          //           if (err) {
          //             console.log(err, 'error');
          //           }
          //           console.log('Cha', cr);
          //         },
          //       );
          //     }
          //   });
          // });
        });
      });
    });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <Button title={'Scan'} onPress={scan} />
        <Button title={'Connect'} onPress={connect} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
