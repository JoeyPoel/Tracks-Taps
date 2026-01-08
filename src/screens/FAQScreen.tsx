import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const { theme } = useTheme();
    const [expanded, setExpanded] = React.useState(false);

    return (
        <TouchableOpacity
            style={[styles.faqItem, { backgroundColor: theme.bgSecondary }]}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <TextComponent bold style={{ flex: 1, paddingRight: 8 }}>{question}</TextComponent>
                {expanded ? (
                    <ChevronUpIcon size={20} color={theme.textSecondary} />
                ) : (
                    <ChevronDownIcon size={20} color={theme.textSecondary} />
                )}
            </View>
            {expanded && (
                <View style={styles.faqContent}>
                    <TextComponent color={theme.textSecondary} style={{ lineHeight: 22 }}>
                        {answer}
                    </TextComponent>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function FAQScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    const faqs = [
        { q: t('faqQ1'), a: t('faqA1') },
        { q: t('faqQ2'), a: t('faqA2') },
        { q: t('faqQ3'), a: t('faqA3') },
        { q: t('faqQ4'), a: t('faqA4') },
        { q: t('faqQ5'), a: t('faqA5') },
        { q: t('faqQ6'), a: t('faqA6') },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false} withBottomTabs={true}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader
                showBackButton
                title={t('faqTitle') || 'FAQ'}
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
