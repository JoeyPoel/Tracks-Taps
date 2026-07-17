import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStore } from '../store/store';
import { useIsFocused } from '@react-navigation/native';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [expanded, setExpanded] = React.useState(false);
    const { speak, stop, isSpeaking } = useTextToSpeech();
    const showSpeakButtons = useStore(state => state.showSpeakButtons);

    const handleSpeakItem = (e: any) => {
        e.stopPropagation(); // Prevent toggling expansion
        if (isSpeaking) {
            stop();
        } else {
            speak(`${t('narrationQuestionLabel')}: ${question}. ${t('narrationAnswerLabel')}: ${answer}`, true);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.faqItem, { backgroundColor: theme.bgSecondary }]}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <TextComponent bold style={{ flex: 1, paddingRight: 8 }} color={theme.textPrimary}>
                    {question}
                </TextComponent>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {showSpeakButtons && (
                        <TouchableOpacity onPress={handleSpeakItem} style={{ padding: 4 }}>
                            <Ionicons name="volume-medium-outline" size={18} color={theme.primary} />
                        </TouchableOpacity>
                    )}
                    {expanded ? (
                        <ChevronUpIcon size={20} color={theme.textPrimary} />
                    ) : (
                        <ChevronDownIcon size={20} color={theme.textPrimary} />
                    )}
                </View>
            </View>
            {expanded && (
                <View style={[styles.faqContent, { borderTopColor: theme.borderSecondary }]}>
                    <TextComponent color={theme.textSecondary} variant="body" style={{ lineHeight: 22 }}>
                        {answer}
                    </TextComponent>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function FAQScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isFocused = useIsFocused();
    const { speak, stop, isSpeaking } = useTextToSpeech();
    const narrationMode = useStore(state => state.narrationMode);
    const showSpeakButtons = useStore(state => state.showSpeakButtons);

    const faqs = [
        { q: t('faqQ1'), a: t('faqA1') },
        { q: t('faqQ2'), a: t('faqA2') },
        { q: t('faqQ3'), a: t('faqA3') },
        { q: t('faqQ4'), a: t('faqA4') },
        { q: t('faqQ5'), a: t('faqA5') },
        { q: t('faqQ6'), a: t('faqA6') },
    ];

    React.useEffect(() => {
        if (isFocused && narrationMode === 'full') {
            const formatString = require('../utils/stringUtils').formatString;
            let speechText = formatString(t('narrationFAQScreen'), faqs.length) + '. ';
            if (!showSpeakButtons) {
                const allFaqsText = faqs.map((faq, index) => 
                    `${formatString(t('narrationQuestionIndex'), index + 1)}: ${faq.q}. ${t('narrationAnswerLabel')}: ${faq.a}`
                ).join('. ');
                speechText += allFaqsText;
            }
            speak(speechText, true);
        }
        return () => {
            stop();
        };
    }, [isFocused, narrationMode, showSpeakButtons]);

    const handleSpeakToggle = () => {
        if (isSpeaking) {
            stop();
        } else {
            const formatString = require('../utils/stringUtils').formatString;
            const speechText = faqs.map((faq, index) => 
                `${formatString(t('narrationQuestionIndex'), index + 1)}: ${faq.q}. ${t('narrationAnswerLabel')}: ${faq.a}`
            ).join('. ');
            speak(speechText, true);
        }
    };

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false} withBottomTabs={true}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader
                showBackButton
                title={t('faqTitle') || 'FAQ'}
                rightElement={
                    showSpeakButtons ? (
                        <TouchableOpacity
                            onPress={handleSpeakToggle}
                            style={{ padding: 6, backgroundColor: theme.primary + '15', borderRadius: 8 }}
                            accessibilityLabel="Read all FAQs aloud"
                            accessibilityRole="button"
                        >
                            <Ionicons name={isSpeaking ? "volume-mute" : "volume-medium"} size={18} color={theme.primary} />
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} />
                ))}

                <View style={styles.footer}>
                    <TextComponent color={theme.textSecondary} variant="caption" style={{ textAlign: 'center' }}>
                        Tracks & Taps v1.0.0
                    </TextComponent>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
        marginTop: 12,
    },
    backButton: {
        marginRight: 16,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    faqItem: {
        borderRadius: 12,
        padding: 16,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqContent: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footer: {
        marginTop: 24,
        marginBottom: 20,
    }
});
