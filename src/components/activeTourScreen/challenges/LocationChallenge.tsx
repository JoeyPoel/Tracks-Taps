import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface LocationChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
}

const LocationChallenge: React.FC<LocationChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            description={challenge.description}
            type="location"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={() => onComplete(challenge)}
            actionLabel={t('claimPoints') || "Claim Points"}
            disabled={isDone}
        >
            <Text style={[styles.successText, { color: theme.primary }]}>
                {t('rightLocation') || "You are at the right location!"}
            </Text>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    successText: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
});

export default LocationChallenge;
