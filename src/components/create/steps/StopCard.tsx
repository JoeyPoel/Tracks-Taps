import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StopCardChallenges } from './components/StopCardChallenges';
import { StopCardHeader } from './components/StopCardHeader';
import { TimelineLeft } from './components/TimelineLeft';

interface StopCardProps {
    item: any;
    index: number;
    isLast: boolean;
    onRemove: () => void;
    onAddChallenge: () => void;
    onRemoveChallenge: (challengeIndex: number) => void;
}

export function StopCard({ item, index, isLast, onRemove, onAddChallenge, onRemoveChallenge }: StopCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.timelineRow}>
            <TimelineLeft index={index} isLast={isLast} />

            <View style={{ flex: 1, paddingBottom: 24 }}>
                <View style={[styles.stopCard, { backgroundColor: theme.bgSecondary }]}>
                    <StopCardHeader item={item} onRemove={onRemove} />

                    <StopCardChallenges challenges={item.challenges} onRemoveChallenge={onRemoveChallenge} />

                    <TouchableOpacity
                        style={[styles.addChallengeBtn, { backgroundColor: theme.bgTertiary }]}
                        onPress={onAddChallenge}
                    >
                        <Ionicons name="add" size={16} color={theme.primary} />
                        <Text style={[styles.addChallengeText, { color: theme.primary }]}>{t('addChallenge')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    timelineRow: {
        flexDirection: 'row',
    },
    stopCard: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    addChallengeBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        gap: 6,
        marginTop: 8,
    },
    addChallengeText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
