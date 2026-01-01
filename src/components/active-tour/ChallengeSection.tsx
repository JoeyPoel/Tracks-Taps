import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from '../common/TextComponent'; // Added import
import ChallengeItem from './ChallengeItem';
import StopCard from './StopCard';

interface ChallengeSectionProps {
    currentStop: any;
    stopChallenges: any[];
    completedChallenges: Set<number>;
    failedChallenges: Set<number>;
    triviaSelected: Record<number, number>;
    setTriviaSelected: (value: React.SetStateAction<Record<number, number>>) => void;
    handleChallengeComplete: (challenge: any) => void;
    handleChallengeFail: (challenge: any) => void;  // Add prop
    handleSubmitTrivia: (challenge: any) => void;
}

const ChallengeSection: React.FC<ChallengeSectionProps> = ({
    currentStop,
    stopChallenges,
    completedChallenges,
    failedChallenges,
    triviaSelected,
    setTriviaSelected,
    handleChallengeComplete,
    handleChallengeFail, // Destructure
    handleSubmitTrivia
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <>
            {currentStop && <StopCard stop={currentStop} />}

            {stopChallenges.length === 0 ? (
                <View style={[styles.noChallengesContainer, { backgroundColor: theme.bgTertiary }]}>
                    <TextComponent style={styles.noChallengesText} color={theme.textSecondary} variant="body">
                        {t('noChallengesAtStop')}
                    </TextComponent>
                </View>
            ) : (
                stopChallenges.map((challenge: any, index: number) => {
                    const isFailed = failedChallenges.has(challenge.id);
                    const isCompleted = completedChallenges.has(challenge.id);

                    return (
                        <ChallengeItem
                            key={challenge.id}
                            challenge={challenge}
                            isCompleted={isCompleted}
                            isFailed={isFailed}
                            triviaSelected={triviaSelected}
                            setTriviaSelected={setTriviaSelected}
                            onClaimArrival={handleChallengeComplete}
                            onFail={handleChallengeFail}
                            onSubmitTrivia={handleSubmitTrivia}
                            index={index} // Pass index
                        />
                    )
                })
            )}
        </>
    );
};

const styles = StyleSheet.create({
    noChallengesContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        marginBottom: 16,
    },
    noChallengesText: {
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default ChallengeSection;
