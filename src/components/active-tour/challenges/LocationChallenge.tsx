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
    index?: number;
}

const LocationChallenge: React.FC<LocationChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    index
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="location"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={() => onComplete(challenge)}
            actionLabel={t('claimPoints') || "Claim Points"}
            disabled={isDone}
            index={index}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
            </Text>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    successText: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
});

export default LocationChallenge;
