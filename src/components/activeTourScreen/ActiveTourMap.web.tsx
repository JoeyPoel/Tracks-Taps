import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ActiveTourMapProps {
    currentStop: {
        latitude: number;
        longitude: number;
        name: string;
    };
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, onNavigate }: ActiveTourMapProps) {
    const { theme } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const jumpAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulsing animation for the blue dot
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.5,
                    duration: 1000,
                    useNativeDriver: false, // Web doesn't support native driver for some properties usually, but transforms are okay. Safe to use false or true depending on web support.
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        ).start();

        // Jumping animation for the map icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(jumpAnim, {
                    toValue: -10,
                    duration: 800,
                    useNativeDriver: false,
                }),
                Animated.timing(jumpAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.container, styles.fallbackContainer, { backgroundColor: '#1E1E2E' }]}>
            {/* Dotted Path */}
            <View style={styles.pathContainer}>
                <View style={styles.dottedLine} />
            </View>

            {/* Pulsing Blue Dot (Current Position) */}
            <View style={styles.currentPosContainer}>
                <Animated.View
                    style={[
                        styles.pulseCircle,
                        {
                            transform: [{ scale: pulseAnim }],
                            backgroundColor: 'rgba(33, 150, 243, 0.3)',
                        },
                    ]}
                />
                <View style={[styles.solidCircle, { backgroundColor: '#2196F3' }]} />
            </View>

            {/* Jumping Pin (Destination) */}
            <Animated.View
                style={[
                    styles.pinContainer,
                    {
                        transform: [{ translateY: jumpAnim }],
                    },
                ]}
            >
                <Ionicons name="location" size={40} color="#E91E63" />
            </Animated.View>

            <TouchableOpacity style={[styles.navigateButton, { backgroundColor: '#2A2A3C' }]} onPress={onNavigate}>
                <Ionicons name="navigate" size={20} color="#2196F3" />
                <Text style={[styles.navigateText, { color: "#2196F3" }]}>Navigate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
    },
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pathContainer: {
        position: 'absolute',
        width: '80%',
        height: 60,
        borderBottomWidth: 4,
        borderColor: '#2196F3',
        borderStyle: 'dotted',
        borderRadius: 100,
        top: 80,
    },
    dottedLine: {
        width: '100%',
        height: '100%',
        borderBottomWidth: 4,
        borderColor: '#2196F3',
        borderStyle: 'dotted',
        opacity: 0.5,
    },
    currentPosContainer: {
        position: 'absolute',
        left: '25%',
        top: 130,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        position: 'absolute',
    },
    solidCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    pinContainer: {
        position: 'absolute',
        right: '25%',
        top: 80,
    },
    navigateButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    navigateText: {
        fontWeight: 'bold',
    },
});
