import { ResponsiveContainer } from '@/src/components/common/ResponsiveContainer';
import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ChallengeType } from '@/src/types/models';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActionCard } from '../../common/ActionCard';
import ChallengeCreationModal from '../modals/ChallengeCreationModal';

interface StepChallengesProps {
    draft: any;
    actions: any;
}

export default function StepChallenges({ draft, actions }: StepChallengesProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddChallenge = (challenge: any) => {
        if (editingIndex !== null) {
            actions.editBonusChallenge(editingIndex, challenge);
        } else {
            actions.addBonusChallenge(challenge);
        }
        setModalVisible(false);
        setEditingIndex(null);
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleRemove = (index: number) => {
        actions.removeBonusChallenge(index);
    };

    const handleAddNew = () => {
        setEditingIndex(null);
        setModalVisible(true);
    };

    const getIconForType = (type: ChallengeType) => {
        switch (type) {
            case ChallengeType.LOCATION: return 'location';
            case ChallengeType.TRIVIA: return 'help-circle';
            case ChallengeType.PICTURE: return 'camera';
            case ChallengeType.TRUE_FALSE: return 'checkmark-circle';
            case ChallengeType.DARE: return 'flash';
            case ChallengeType.RIDDLE: return 'help';
            default: return 'trophy';
        }
    };

    return (
        <ResponsiveContainer>
            <View style={styles.container}>
                <View style={styles.infoSection}>
                    <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                        {t('bonusChallengesDesc') || 'Add fun challenges that apply to the entire tour, not just specific stops. Teams can complete these at any time!'}
                    </TextComponent>
                </View>

                {/* Add Button */}
                <ActionCard
                    title={t('addBonusChallenge') || 'Add Bonus Challenge'}
                    subtitle={t('addBonusChallengeSubtitle') || 'Create a new tour-wide challenge'}
                    icon="add-circle"
                    onPress={handleAddNew}
                    variant="primary"
                    style={{ marginBottom: 20 }}
                />

                {/* List of Challenges */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12 }}>
                    {(draft.challenges || []).length === 0 && (
                        <View style={[styles.emptyState, { borderColor: theme.borderPrimary }]}>
                            <Ionicons name="trophy-outline" size={40} color={theme.textSecondary} />
                            <TextComponent style={{ marginTop: 10 }} color={theme.textSecondary} variant="body" center>
                                {t('noBonusChallenges') || 'No bonus challenges added yet.'}
                            </TextComponent>
                        </View>
                    )}

                    {(draft.challenges || []).map((challenge: any, index: number) => (
                        <ActionCard
                            key={index}
                            title={challenge.title}
                            subtitle={`${challenge.points} pts • ${challenge.type}`}
                            icon={getIconForType(challenge.type)}
                            onPress={() => handleEdit(index)}
                            rightAction={{
                                icon: 'trash-outline',
                                onPress: () => handleRemove(index),
                                color: theme.error
                            }}
                        />
                    ))}
                </ScrollView>

                {/* Modal */}
                <ChallengeCreationModal
                    key={editingIndex !== null ? `edit-${editingIndex}` : 'create-new'}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={handleAddChallenge}
                    initialData={editingIndex !== null ? draft.challenges[editingIndex] : undefined}
                />
            </View>
        </ResponsiveContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoSection: {
        marginBottom: 20,
    },
    subtitle: {
        marginBottom: 10,
        lineHeight: 20,
    },
    emptyState: {
        padding: 30,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },
});
