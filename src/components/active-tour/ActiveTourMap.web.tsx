import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

interface ActiveTourMapProps {
    currentStop: any;
    previousStop: any;
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, previousStop, onNavigate }: ActiveTourMapProps) {
    const { t } = useLanguage();
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{t('mapNotAvailableWeb')}</Text>
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
