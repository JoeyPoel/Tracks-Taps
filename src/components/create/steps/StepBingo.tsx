
import { TextComponent } from '@/src/components/common/TextComponent';
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import ChallengeCreationModal from '@/src/components/create/modals/ChallengeCreationModal';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { ChallengeType } from '@/src/types/models';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

interface StepBingoProps {
    draft: TourDraft;
    actions: {
        addBingoChallenge: (challenge: any) => void;
        removeBingoChallenge: (row: number, col: number) => void;
    };
}

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 24; // Parent padding
const CELL_SIZE = (width - (PADDING * 2) - (GAP * 2)) / 3;

export default function StepBingo({ draft, actions }: StepBingoProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);

    const handleCellPress = (row: number, col: number) => {
        setSelectedCell({ row, col });
        setModalVisible(true);
    };

    const handleSaveChallenge = (challengeData: any) => {
        if (!selectedCell) return;

        actions.addBingoChallenge({
            ...challengeData,
            row: selectedCell.row,
            col: selectedCell.col,
            isBingo: true // Marker
        });
        setModalVisible(false);
        setSelectedCell(null);
    };

    const getChallengeAt = (row: number, col: number) => {
        return draft.bingoChallenges.find(c => c.row === row && c.col === col);
    };

    const getIcon = (type: ChallengeType) => {
        switch (type) {
            case ChallengeType.LOCATION: return 'location';
            case ChallengeType.TRIVIA: return 'help';
            case ChallengeType.PICTURE: return 'camera';
            case ChallengeType.TRUE_FALSE: return 'checkmark-circle';
            case ChallengeType.DARE: return 'flash';
            case ChallengeType.RIDDLE: return 'bulb';
            default: return 'trophy';
        }
    };

    const renderGrid = () => {
        const cells = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const challenge = getChallengeAt(row, col);
                cells.push(
                    <TouchableOpacity
                        key={`${row}-${col}`}
                        activeOpacity={0.8}
                        onPress={() => handleCellPress(row, col)}
                        style={[
                            styles.cell,
                            {
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                backgroundColor: challenge ? theme.primary : theme.bgSecondary,
                                borderColor: theme.borderPrimary
                            }
                        ]}
                    >
                        {challenge ? (
                            <Animated.View entering={ZoomIn} style={styles.cellContent}>
                                <Ionicons name={getIcon(challenge.type) as any} size={28} color="#FFF" />
                                <TextComponent
                                    variant="caption"
                                    color="#FFF"
                                    numberOfLines={2}
                                    style={{ marginTop: 4, textAlign: 'center', fontSize: 10 }}
                                >
                                    {challenge.title}
                                </TextComponent>
                            </Animated.View>
                        ) : (
                            <Ionicons name="add" size={32} color={theme.textTertiary} />
                        )}
                    </TouchableOpacity>
                );
            }
        }
        return cells;
    };

    return (
        <View style={styles.container}>
            <WizardStepHeader
                title="Bingo Grid" // TODO: Add translation
                subtitle="Tap a cell to add a challenge." // TODO: Add translation
            />

            <View style={styles.gridContainer}>
                {renderGrid()}
            </View>

            <View style={styles.explainer}>
                <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                <TextComponent variant="caption" color={theme.textSecondary} style={{ flex: 1 }}>
                    Bingo challenges are separate from regular tour stops.
                </TextComponent>
            </View>

            <ChallengeCreationModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveChallenge}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        justifyContent: 'center',
        marginTop: 16,
    },
    cell: {
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    cellContent: {
        alignItems: 'center',
        width: '100%',
    },
    explainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
        alignItems: 'center'
    }
});
