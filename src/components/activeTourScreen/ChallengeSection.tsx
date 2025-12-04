import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
    handleSubmitTrivia
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <>
            {currentStop && <StopCard stop={currentStop} />}

            {stopChallenges.length === 0 ? (
                <View style={[styles.noChallengesContainer, { backgroundColor: theme.bgTertiary }]}>
                    <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>
                        {t('noChallengesAtStop')}
                    </Text>
                </View>
            ) : (
                stopChallenges.map((challenge: any) => {
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
                            onSubmitTrivia={handleSubmitTrivia}
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
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default ChallengeSection;
