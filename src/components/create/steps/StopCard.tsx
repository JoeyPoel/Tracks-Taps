
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GenericCard } from '../../common/GenericCard'; // Added import
import { TextComponent } from '../../common/TextComponent'; // Added import
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
    drag?: () => void; // Added
    isActive?: boolean; // Added
}


export function StopCard({ item, index, isLast, onRemove, onEdit, onAddChallenge, onEditChallenge, onRemoveChallenge, drag, isActive }: StopCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.timelineRow, { opacity: isActive ? 0.7 : 1 }]}>
            {/* When dragging, hide the timeline so only the card floats */}
            <View style={{ opacity: isActive ? 0 : 1 }}>
                <TimelineLeft index={index} isLast={isLast} />
            </View>

            <View style={{ flex: 1, paddingBottom: 24 }}>
                <GenericCard style={styles.stopCard} padding="none">
                    <StopCardHeader item={item} onRemove={onRemove} onEdit={onEdit} onDrag={drag} />

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
                        <TextComponent style={styles.addChallengeText} color={theme.primary} bold variant="caption">
                            {t('addChallenge')}
                        </TextComponent>
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
        textTransform: 'uppercase',
    },
});
