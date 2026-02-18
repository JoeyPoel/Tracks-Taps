import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function CustomerCenterScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Manage Subscription', presentation: 'modal' }} />
            <RevenueCatUI.CustomerCenterView />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
