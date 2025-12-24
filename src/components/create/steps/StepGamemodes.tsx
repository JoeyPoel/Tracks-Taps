import { ModeCard } from '@/src/components/create/common/ModeCard';
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StepGamemodesProps {
    draft: TourDraft;
    actions: {
        toggleMode: (mode: string) => void;
    };
}

export default function StepGamemodes({ draft, actions }: StepGamemodesProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const toggleMode = (mode: string) => {
        actions.toggleMode(mode);
    };

    return (
        <View style={styles.container}>
            <WizardStepHeader
                title={t('stepGamemodesTitle')}
                subtitle={t('stepGamemodesSubtitle')}
            />

            <View style={styles.grid}>
                <ModeCard
                    mode="PUBGOLF"
                    icon="beer"
                    label={t('pubgolf')}
                    description={t('pubGolfDescription')}
                    colors={[theme.accent, theme.warning]}
                    isSelected={draft.modes.includes('PUBGOLF')}
                    onPress={() => toggleMode('PUBGOLF')}
                />

                {/* Coming Soon Placeholder */}
                <View style={[styles.comingSoonCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                    <Ionicons name="flask-outline" size={24} color={theme.textTertiary} />
                    <View>
                        <Text style={[styles.comingSoonTitle, { color: theme.textSecondary }]}>{t('comingSoon')}</Text>
                        <Text style={[styles.comingSoonDesc, { color: theme.textTertiary }]}>{t('comingSoonDesc')}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    grid: {
        gap: 16,
    },
    comingSoonCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        opacity: 0.7,
    },
    comingSoonTitle: {
        fontWeight: '700',
        fontSize: 16,
    },
    comingSoonDesc: {
        fontSize: 12,
        maxWidth: 240,
    }
});
