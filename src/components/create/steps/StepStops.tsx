import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import ChallengeCreationModal from '@/src/components/create/modals/ChallengeCreationModal';
import StopCreationModal from '@/src/components/create/modals/StopCreationModal';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyStopState } from './EmptyStopState';
import { StopCard } from './StopCard';

interface StepStopsProps {
    draft: TourDraft;
    actions: {
        addStop: (stop: any) => void;
        removeStop: (index: number) => void;
        addChallengeToStop: (stopIndex: number, challenge: any) => void;
        removeChallengeFromStop: (stopIndex: number, challengeIndex: number) => void;
    };
}

export default function StepStops({ draft, actions }: StepStopsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [isStopModalVisible, setIsStopModalVisible] = useState(false);
    const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
    const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);

    const handleAddStop = (newStop: any) => {
        actions.addStop(newStop);
        setIsStopModalVisible(false);
    };

    const openChallengeModal = (index: number) => {
        setActiveStopIndex(index);
        setIsChallengeModalVisible(true);
    };

    const handleAddChallenge = (challenge: any) => {
        if (activeStopIndex === null) return;
        actions.addChallengeToStop(activeStopIndex, challenge);
        setIsChallengeModalVisible(false);
        setActiveStopIndex(null);
    };

    return (
        <View style={styles.container}>
            <WizardStepHeader
                title={t('stepStopsTitle')}
                subtitle={t('stepStopsSubtitle')}
            />

            {draft.stops.length === 0 ? (
                <EmptyStopState />
            ) : (
                <View style={styles.listContainer}>
                    {draft.stops.map((item, index) => (
                        <StopCard
                            key={index}
                            item={item}
                            index={index}
                            isLast={index === draft.stops.length - 1}
                            onRemove={() => actions.removeStop(index)}
                            onAddChallenge={() => openChallengeModal(index)}
                            onRemoveChallenge={(cIdx) => actions.removeChallengeFromStop(index, cIdx)}
                        />
                    ))}
                </View>
            )}

            <AnimatedPressable
                style={[styles.addButton, { borderColor: theme.borderPrimary, borderStyle: 'dashed' }]}
                onPress={() => setIsStopModalVisible(true)}
            >
                <Ionicons name="location" size={24} color={theme.primary} />
                <Text style={[styles.addButtonText, { color: theme.primary }]}>{t('addStop')}</Text>
            </AnimatedPressable>

            <StopCreationModal
                visible={isStopModalVisible}
                onClose={() => setIsStopModalVisible(false)}
                onSave={handleAddStop}
                modes={draft.modes}
                existingStops={draft.stops}
            />

            <ChallengeCreationModal
                visible={isChallengeModalVisible}
                onClose={() => setIsChallengeModalVisible(false)}
                onSave={handleAddChallenge}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    listContainer: {
        marginBottom: 24,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        borderRadius: 30,
        borderWidth: 2,
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.02)'
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
    }
});
