import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface PubGolfStopCardProps {
    stopNumber: number;
    stopName: string;
    drinkName: string;
    par: number;
    sips?: number; // If undefined, it's not completed yet
    isActive: boolean;
    onSave: (sips: number) => void;
}

const getScoreDetails = (par: number, sips?: number) => {
    if (sips === undefined || sips === null) return null;

    const diff = sips - par;

    // Colors: [GradientStart, GradientEnd, CardBackground]
    
    // Special Case: Hole in One
    if (sips === 1) return { 
        name: 'HOLE IN ONE!', 
        sub: 'Legendary!', 
        color: ['#FFD700', '#F59E0B', '#291c06'] as const, 
        emoji: '🌟' 
    };

    // Under Par
    if (diff <= -3) return { 
        name: 'Albatross!', 
        sub: 'Unreal!', 
        color: ['#A855F7', '#9333EA', '#1e1b4b'] as const, // Deep Indigo/Purple bg
        emoji: '🦕' 
    }; 
    if (diff === -2) return { 
        name: 'EAGLE!', 
        sub: 'Amazing!', 
        color: ['#E879F9', '#D946EF', '#1f0f21'] as const, // Pink/Purple -> Dark Purple bg
        emoji: '🦅' 
    }; 
    if (diff === -1) return { 
        name: 'Birdie!', 
        sub: 'Great job!', 
        color: ['#4ADE80', '#22C55E', '#062115'] as const, // Green -> Dark Green bg
        emoji: '🐦' 
    }; 

    // Par
    if (diff === 0) return { 
        name: 'PAR!', 
        sub: 'Perfect!', 
        color: ['#60A5FA', '#3B82F6', '#0f172a'] as const, // Blue -> Dark Navy bg
        emoji: '⛳' 
    }; 

    // Over Par
    if (diff === 1) return { 
        name: 'Bogey!', 
        sub: 'Nice try!', 
        color: ['#FB923C', '#F97316', '#27150a'] as const, // Orange -> Dark Brown bg
        emoji: '😅' 
    }; 
    if (diff === 2) return { 
        name: 'Double Bogey', 
        sub: '', 
        color: ['#F87171', '#EF4444', '#2b0e0e'] as const, // Red -> Dark Red bg
        emoji: '😳' 
    }; 
    
    // Triple Bogey+
    return { 
        name: 'Triple Bogey+', 
        sub: '', 
        color: ['#9CA3AF', '#6B7280', '#111827'] as const, // Grey -> Black bg
        emoji: '💀' 
    }; 
};

export default function PubGolfStopCard({
    stopNumber,
    stopName,
    drinkName,
    par,
    sips,
    isActive,
    onSave
}: PubGolfStopCardProps) {
    const { theme } = useTheme();
    const [selectedSips, setSelectedSips] = useState<number | null>(null);

    const isCompleted = sips !== undefined;
    const scoreDetails = getScoreDetails(par, sips);

    // Calculate display text for the difference
    const diff = isCompleted ? (sips! - par) : 0;
    const diffText = diff > 0 ? `(+${diff})` : diff === 0 ? '' : `(${diff})`;

    // Determine card background color
    const cardBg = isCompleted && scoreDetails ? scoreDetails.color[2] : theme.bgSecondary;
    const textColor = isCompleted ? '#FFFFFF' : theme.textPrimary;
    const subTextColor = isCompleted ? 'rgba(255,255,255,0.7)' : theme.textSecondary;

    return (
        <View style={[
            styles.container,
            { backgroundColor: cardBg },
            isActive && { borderColor: theme.primary, borderWidth: 2 }
        ]}>
            <View style={styles.topSection}>
                {/* Left: Number Badge */}
                <LinearGradient
                    colors={scoreDetails?.color.slice(0, 2) as [string, string] || ['#374151', '#1F2937']}
                    style={styles.numberBadge}
                >
                    <Text style={styles.numberText}>#{stopNumber}</Text>
                </LinearGradient>

                {/* Middle: Info */}
                <View style={styles.info}>
                    <Text style={[styles.stopName, { color: textColor }]}>{stopName}</Text>
                    <View style={styles.drinkBadge}>
                        <Text style={[styles.drinkName, { color: '#CBD5E1' }]}>
                            {drinkName}
                        </Text>
                    </View>
                </View>

                {/* Right: Score & Par */}
                <View style={styles.rightSection}>
                    <View style={styles.parTag}>
                         <Text style={{fontSize: 10, color: subTextColor, marginRight: 2}}>Par</Text>
                         <Text style={{fontSize: 12, fontWeight: 'bold', color: subTextColor}}>{par}</Text>
                    </View>
                    
                    {isCompleted && scoreDetails && (
                        <View style={styles.scoreContainer}>
                            <Text style={[styles.scoreEmojiBg, {marginRight: 45}, {marginBottom: 10}]}>{scoreDetails.emoji}</Text>
                            <Text style={[styles.scoreValue, { color: scoreDetails.color[0] }]}>
                                {sips}
                            </Text>
                        </View>
                    )}
                     {/* Show just Par if not completed */}
                    {!isCompleted && (
                         <View style={styles.scoreContainer}>
                            <Ionicons name="flag-outline" size={24} color={subTextColor} style={{opacity: 0.2}} />
                        </View>
                    )}
                </View>
            </View>

            {/* Middle: Input Grid (Only when active and playing) */}
            {isActive && !isCompleted && (
                <View style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: subTextColor }]}>
                        Sips taken:
                    </Text>
                    <View style={styles.grid}>
                        {Array.from({ length: par + 3 }, (_, i) => i + 1).map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.sipButton,
                                    { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
                                    selectedSips === num && { backgroundColor: theme.primary, borderColor: theme.primary },
                                ]}
                                onPress={() => {
                                    setSelectedSips(num);
                                    onSave(num);
                                }}
                            >
                                <Text style={[
                                    styles.sipButtonText,
                                    { color: theme.textPrimary },
                                    selectedSips === num && { color: '#FFF' }
                                ]}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Bottom: Result Text */}
            {isCompleted && scoreDetails && (
                <View style={styles.resultFooter}>
                    <Text style={[styles.resultEmoji, { marginRight: 8}]}>{scoreDetails.emoji}</Text>
                    <Text style={[styles.resultText, { color: scoreDetails.color[0] }]}>
                        {scoreDetails.name} <Text style={{color: '#FFF', fontWeight: 'normal'}}>{scoreDetails.sub}</Text> {diffText}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    numberBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    numberText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 18,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    stopName: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    drinkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    drinkName: {
        fontSize: 12,
        marginRight: 6,
        fontWeight: '500',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minWidth: 50,
    },
    parTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    scoreContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    scoreEmojiBg: {
        position: 'absolute',
        fontSize: 46,
        right: -5,
        bottom: -5,
        transform: [{rotate: '-10deg'}]
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 2,
        zIndex: 2,
    },
    inputSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    sipButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    sipButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    resultEmoji: {
        fontSize: 18,
    },
    resultText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});