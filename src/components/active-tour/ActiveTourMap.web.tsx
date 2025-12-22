import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ActiveTourMapProps {
    currentStop: any;
    previousStop: any;
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, previousStop, onNavigate }: ActiveTourMapProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Map not available on web</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 24,
    },
    text: {
        color: '#666',
        fontSize: 16,
    },
});
