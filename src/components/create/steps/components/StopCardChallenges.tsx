import { useTheme } from '@/src/context/ThemeContext';
import { getChallengeIconProps } from '@/src/utils/challengeIcons';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    challenges: any[];
    onRemoveChallenge: (index: number) => void;
}

export function StopCardChallenges({ challenges, onRemoveChallenge }: Props) {
    const { theme } = useTheme();

    if (!challenges || challenges.length === 0) return null;

    return (
        <View style={styles.challengesList}>
            {challenges.map((c: any, cIdx: number) => {
                const { icon, color } = getChallengeIconProps(c.type, theme);
                return (
                    <View key={cIdx} style={[styles.challengeRow, { borderTopColor: theme.borderPrimary }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                            <Ionicons name={icon} size={16} color={color} />
                            <Text style={[styles.challengeTitle, { color: theme.textSecondary }]}>{c.title}</Text>
                        </View>
                        <TouchableOpacity onPress={() => onRemoveChallenge(cIdx)}>
                            <Ionicons name="close-circle" size={16} color={theme.textDisabled} />
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    challengesList: {
        paddingHorizontal: 16,
        marginTop: -4,
    },
    challengeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    challengeTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
});
