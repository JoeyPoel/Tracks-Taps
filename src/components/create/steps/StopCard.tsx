
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
    onEdit: () => void;
    onAddChallenge: () => void;
    onEditChallenge: (challengeIndex: number) => void;
    onRemoveChallenge: (challengeIndex: number) => void;
}


export function StopCard({ item, index, isLast, onRemove, onEdit, onAddChallenge, onEditChallenge, onRemoveChallenge }: StopCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.timelineRow}>
            <TimelineLeft index={index} isLast={isLast} />

            <View style={{ flex: 1, paddingBottom: 24 }}>
                <GenericCard style={styles.stopCard} padding="none">
                    <StopCardHeader item={item} onRemove={onRemove} onEdit={onEdit} />

                    <StopCardChallenges
                        challenges={item.challenges}
                        onEditChallenge={onEditChallenge}
                        onRemoveChallenge={onRemoveChallenge}
                    />

                    <TouchableOpacity
                        style={[styles.addChallengeBtn, { backgroundColor: theme.bgTertiary }]}
                        onPress={onAddChallenge}
                    >
                        <Ionicons name="add" size={16} color={theme.primary} />
                        <Text style={[styles.addChallengeText, { color: theme.primary }]}>{t('addChallenge')}</Text>
                    </TouchableOpacity>
                </GenericCard>
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
