import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedButton } from '../common/AnimatedButton';

interface PostTourFooterProps {
    handleViewResults: () => void;
}

export default function PostTourFooter({ handleViewResults }: PostTourFooterProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.footerContainer, { backgroundColor: 'transparent', borderTopWidth: 0 }]}>

            <AnimatedButton
                title={t('viewResults')}
                onPress={handleViewResults}
                icon="chevron-forward"
                variant="primary"
                style={styles.viewResultsButton}
            />

            <TextComponent style={styles.autoRedirectText} color={theme.textSecondary} variant="caption" center>
                {t('autoResults')}
            </TextComponent>
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        width: '100%',
        paddingVertical: 10,
    },
    viewResultsButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    autoRedirectText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
