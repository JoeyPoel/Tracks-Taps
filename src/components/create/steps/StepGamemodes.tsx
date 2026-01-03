import { ModeCard } from '@/src/components/create/common/ModeCard';
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StepGamemodesProps {
    draft: TourDraft;
    actions: {
        toggleMode: (mode: string) => void;
    };
    updateDraft: (key: keyof TourDraft, value: any) => void;
}

export default function StepGamemodes({ draft, actions, updateDraft }: StepGamemodesProps) {
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

                <View>
                    <ModeCard
                        mode="BINGO"
                        icon="grid"
                        label={t('bingo')}
                        description={t('bingoDescription')}
                        colors={[theme.primary, theme.accent]}
                        isSelected={draft.modes.includes('BINGO')}
                        onPress={() => toggleMode('BINGO')}
                    />
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
    settingsContainer: {
        marginTop: 12,
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
    }
});
