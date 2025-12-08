import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface PictureChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
}

const PictureChallenge: React.FC<PictureChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;

    const handlePress = () => {
        // In a real app, this would open the camera
        // For now, we simulate success
        onComplete(challenge);
    };

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            description={challenge.description}
            type="camera"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handlePress}
            actionLabel={t('takePhoto') || "Take Photo"}
            disabled={isDone}
        >
            <View style={styles.content}>
                <Text style={[styles.instruction, { color: theme.textSecondary }]}>
                    {challenge.content}
                </Text>
                {isCompleted && (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="image" size={40} color={theme.textSecondary} />
                        <Text style={{ color: theme.textSecondary }}>[Image Placeholder]</Text>
                    </View>
                )}
            </View>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    content: {
        marginBottom: 8,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    placeholderImage: {
        height: 100,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    }
});

export default PictureChallenge;
