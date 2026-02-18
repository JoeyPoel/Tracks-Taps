import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function PaywallScreen() {
    return (
        <View style={styles.container}>
            <RevenueCatUI.Paywall />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
