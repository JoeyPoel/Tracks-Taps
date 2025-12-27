import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface LobbyTourInfoProps {
    activeTour: any;
}

export const LobbyTourInfo: React.FC<LobbyTourInfoProps> = ({ activeTour }) => {
    const { theme } = useTheme();

    return (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.tourCard, { backgroundColor: theme.bgSecondary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                    colors={[theme.primary + '40', theme.primary + '10']}
                    style={styles.tourIconBadge}
                >
                    <Ionicons name="map" size={24} color={theme.primary} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.tourTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {activeTour?.tour?.title || "Loading..."}
                    </Text>
                    <Text style={[styles.tourSubtitle, { color: theme.textSecondary }]}>
                        {activeTour?.tour?._count?.stops || 0} stops • 2.5 km
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    tourCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        // Soft Styling
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    tourIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    tourTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    tourSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7
    },
});
