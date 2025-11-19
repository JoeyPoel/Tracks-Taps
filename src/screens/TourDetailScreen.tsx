import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TourDetailScreen() {
    return (
        <View style={styles.container}>
            <Text>Tour detail Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});