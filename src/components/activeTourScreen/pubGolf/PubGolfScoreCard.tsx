import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

interface PubGolfScoreCardProps {
    totalSips: number;
    totalPar: number;
    currentScore: number; // Sum of (sips - par)
}

export default function PubGolfScoreCard({ totalSips, totalPar, currentScore }: PubGolfScoreCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const isUnderPar = currentScore < 0;
    const isOverPar = currentScore > 0;
    const isEven = currentScore === 0;

    let statusText = "Even Par";
    let statusIcon = "golf";

    if (isUnderPar) {
        statusText = "Under Par!";
        statusIcon = "flame";
    } else if (isOverPar) {
        statusText = "Over Par";
        statusIcon = "alert-circle";
    }

    return (
        <LinearGradient
            colors={['#FFC107', '#FF9800', '#FF5722']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="trophy-outline" size={32} color="#FFF" />
                </View>
                <View>
                    <Text style={styles.title}>Pub Golf</Text>
                    <Text style={styles.subtitle}>Official Scorecard</Text>
                </View>
            </View>

            <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Total Score</Text>
                <Text style={styles.scoreValue}>{totalSips} / {totalPar}</Text>
                <View style={styles.statusContainer}>
                    <Ionicons name={statusIcon as any} size={16} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>
                        Try to finish each drink in <Text style={styles.bold}>par or under</Text>! Lower score wins.
                    </Text>
                </View>
                <Text style={styles.legend}>
                    Eagle (-2) • Birdie (-1) • Par (0) • Bogey (+1)
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginVertical: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '55%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    scoreContainer: {
        width: '40%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
    },
    infoContainer: {
        width: '100%',
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#FFF',
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    legend: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
});
