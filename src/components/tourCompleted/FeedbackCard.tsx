import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { AnimatedButton } from '../common/AnimatedButton';

interface FeedbackCardProps {
    rating: number;
    onRate: (rating: number) => void;
    feedback: string;
    onFeedbackChange: (text: string) => void;
    onSubmit: () => void;
    submitted: boolean;
    showInput: boolean;
}

export default function FeedbackCard({
    rating,
    onRate,
    feedback,
    onFeedbackChange,
    onSubmit,
    submitted,
    showInput
}: FeedbackCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <Animated.View
            entering={FadeInDown.delay(200).springify()}
            layout={Layout.springify()}
            style={[styles.rateAppCard, { backgroundColor: theme.bgSecondary }]}
        >
            <TextComponent style={styles.rateAppTitle} color={theme.textPrimary} bold variant="h3">
                {submitted ? t('thanksFeedback') : t('howWasExperience')}
            </TextComponent>

            {!submitted && (
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => onRate(star)}>
                            <Ionicons
                                name={rating >= star ? "star" : "star-outline"}
                                size={32}
                                color={theme.fixedTrophyGold}
                                style={{ marginHorizontal: 4 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Feedback Input Section */}
            {showInput && !submitted && (
                <Animated.View
                    entering={FadeInDown}
                    style={{ width: '100%', marginTop: 20 }}
                >
                    <TextComponent style={styles.feedbackLabel} color={theme.textSecondary} bold variant="caption">
                        {t('whatImprove')}
                    </TextComponent>
                    <TextInput
                        style={[styles.feedbackInput, {
                            backgroundColor: theme.bgPrimary,
                            color: theme.textPrimary,
                            borderColor: theme.borderPrimary
                        }]}
                        placeholder={t('feedbackPlaceholder')}
                        placeholderTextColor={theme.textSecondary}
                        value={feedback}
                        onChangeText={onFeedbackChange}
                        multiline
                    />
                    <AnimatedButton
                        title={t('submitFeedback')}
                        onPress={onSubmit}
                        size="small"
                        style={{ marginTop: 12, width: '100%' }}

                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    rateAppCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rateAppTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    feedbackLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    feedbackInput: {
        width: '100%',
        minHeight: 80,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        textAlignVertical: 'top', // For multiline on Android
    },
});
