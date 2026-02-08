import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import ChallengeCreationModal from '@/src/components/create/modals/ChallengeCreationModal';
import StopCreationModal from '@/src/components/create/modals/StopCreationModal';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native'; // Updated import
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'; // Added import
import { EmptyStopState } from './EmptyStopState';
import { StopCard } from './StopCard';

interface StepStopsProps {
    draft: TourDraft;
    actions: {
        addStop: (stop: any) => void;
        editStop: (index: number, stop: any) => void;
        removeStop: (index: number) => void;
        reorderStops: (stops: any[]) => void; // Added
        addChallengeToStop: (stopIndex: number, challenge: any) => void;
        removeChallengeFromStop: (stopIndex: number, challengeIndex: number) => void;
        editChallengeInStop: (stopIndex: number, challengeIndex: number, challenge: any) => void;
    };
    footer?: React.ReactNode;
}

export default function StepStops({ draft, actions, footer }: StepStopsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [isStopModalVisible, setIsStopModalVisible] = useState(false);
    const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);
    const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
    const [editingChallengeIndex, setEditingChallengeIndex] = useState<number | null>(null);
    const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);

    const handleSaveStop = (stop: any) => {
        if (editingStopIndex !== null) {
            actions.editStop(editingStopIndex, stop);
        } else {
            actions.addStop(stop);
        }
        setIsStopModalVisible(false);
        setEditingStopIndex(null);
    };

    const handleEditStop = (index: number) => {
        setEditingStopIndex(index);
        setIsStopModalVisible(true);
    };

    const handleRemoveStop = (index: number) => {
        Alert.alert(
            t('removeStop') || 'Remove Stop',
            t('confirmRemoveStop') || 'Are you sure you want to remove this stop?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('remove') || 'Remove',
                    style: 'destructive',
                    onPress: () => actions.removeStop(index)
                }
            ]
        );
    };

    const openChallengeModal = (index: number) => {
        setActiveStopIndex(index);
        setEditingChallengeIndex(null);
        setIsChallengeModalVisible(true);
    };

    const handleSaveChallenge = (challenge: any) => {
        if (activeStopIndex === null) return;

        if (editingChallengeIndex !== null) {
            actions.editChallengeInStop(activeStopIndex, editingChallengeIndex, challenge);
        } else {
            actions.addChallengeToStop(activeStopIndex, challenge);
        }
        setIsChallengeModalVisible(false);
        setActiveStopIndex(null);
        setEditingChallengeIndex(null);
    };

    const handleEditChallenge = (stopIndex: number, challengeIndex: number) => {
        setActiveStopIndex(stopIndex);
        setEditingChallengeIndex(challengeIndex);
        setIsChallengeModalVisible(true);
    };

    const renderItem = ({ item, getIndex, drag, isActive }: RenderItemParams<any>) => {
        const index = getIndex();
        if (index === undefined) return null;

        return (
            <ScaleDecorator>
                <StopCard
                    item={item}
                    index={index}
                    isLast={index === draft.stops.length - 1}
                    onRemove={() => handleRemoveStop(index)}
                    onEdit={() => handleEditStop(index)}
                    onAddChallenge={() => openChallengeModal(index)}
                    onEditChallenge={(cIdx) => handleEditChallenge(index, cIdx)}
                    onRemoveChallenge={(cIdx) => actions.removeChallengeFromStop(index, cIdx)}
                    drag={drag}
                    isActive={isActive}
                />
            </ScaleDecorator>
        );
    };

    return (
        <View style={styles.container}>
            <DraggableFlatList
                data={draft.stops}
                onDragEnd={({ data }) => actions.reorderStops(data)}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }} // Add padding for footer and sides
                activationDistance={20}
                keyExtractor={(item: any, index) => item.id ? `stop-id-${item.id}` : (item._tempId ? `stop-temp-${item._tempId}` : `stop-${index}`)}
                renderItem={renderItem}
                ListHeaderComponent={
                    <WizardStepHeader
                        title={t('stepStopsTitle')}
                        subtitle={t('stepStopsSubtitle')}
                    />
                }
                ListEmptyComponent={<EmptyStopState />}
                ListFooterComponent={
                    <View style={{ gap: 20 }}>
                        <AnimatedPressable
                            style={[styles.addButton, { borderColor: theme.borderPrimary, borderStyle: 'dashed' }]}
                            onPress={() => {
                                setEditingStopIndex(null);
                                setIsStopModalVisible(true);
                            }}
                        >
                            <Ionicons name="location" size={24} color={theme.primary} />
                            <TextComponent style={styles.addButtonText} color={theme.primary} bold variant="label">
                                {t('addStop')}
                            </TextComponent>
                        </AnimatedPressable>
                        {footer}
                    </View>
                }
            />

            <StopCreationModal
                visible={isStopModalVisible}
                onClose={() => {
                    setIsStopModalVisible(false);
                    setEditingStopIndex(null);
                }}
                onSave={handleSaveStop}
                modes={draft.modes}
                existingStops={draft.stops}
                initialData={editingStopIndex !== null ? draft.stops[editingStopIndex] : undefined}
            />

            <ChallengeCreationModal
                visible={isChallengeModalVisible}
                onClose={() => {
                    setIsChallengeModalVisible(false);
                    setEditingChallengeIndex(null);
                }}
                onSave={handleSaveChallenge}
                initialData={
                    (activeStopIndex !== null && editingChallengeIndex !== null)
                        ? draft.stops[activeStopIndex]?.challenges?.[editingChallengeIndex]
                        : undefined
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensure it takes full height
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
        // fontSize and fontWeight handled by TextComponent
    }
});
