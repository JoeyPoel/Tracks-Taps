import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ChallengeItem from './ChallengeItem';

interface TourChallengesSectionProps {
    challenges: any[];
    completedChallenges: Set<number>;
    failedChallenges: Set<number>;
    triviaSelected: Record<number, number>;
    setTriviaSelected: (value: React.SetStateAction<Record<number, number>>) => void;
    handleChallengeComplete: (challenge: any) => void;
    handleChallengeFail: (challenge: any) => void;
    handleSubmitTrivia: (challenge: any) => void;
}

const TourChallengesSection: React.FC<TourChallengesSectionProps> = ({
    challenges,
    completedChallenges,
    failedChallenges,
    triviaSelected,
    setTriviaSelected,
    handleChallengeComplete,
    handleChallengeFail,
    handleSubmitTrivia
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{t('tourWideChallenges')}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Complete these anytime during the tour!
                </Text>
            </View>

            {challenges.length === 0 ? (
                <View style={[styles.noChallengesContainer, { backgroundColor: theme.bgTertiary }]}>
                    <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>
                        No tour-wide challenges available.
                    </Text>
                </View>
            ) : (
                challenges.map((challenge: any) => {
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
                        />
                    )
                })
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 34,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
    },
    noChallengesContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    noChallengesText: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.6,
    },
});

export default TourChallengesSection;
