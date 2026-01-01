import { FormInput } from '@/src/components/common/FormInput';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface PubGolfSectionProps {
    isPubGolfEnabled: boolean;
    isPubGolfStop: boolean;
    setIsPubGolfStop: (val: boolean) => void;
    drink: string;
    setDrink: (val: string) => void;
    par: string;
    setPar: (val: string) => void;
}

export function PubGolfSection({
    isPubGolfEnabled,
    isPubGolfStop, setIsPubGolfStop,
    drink, setDrink,
    par, setPar
}: PubGolfSectionProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    if (!isPubGolfEnabled) return null;

    return (
        <View style={[styles.pubGolfContainer, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="beer" size={20} color={theme.accent} />
                    <TextComponent style={styles.sectionTitle} color={theme.textPrimary} size={16} bold variant="body">
                        {t('isPubGolfStop')}
                    </TextComponent>
                </View>
                <Switch
                    value={isPubGolfStop}
                    onValueChange={setIsPubGolfStop}
                    trackColor={{ false: theme.bgTertiary, true: theme.primary }}
                />
            </View>

            {isPubGolfStop && (
                <View style={[styles.row, { marginTop: 12 }]}>
                    <View style={{ flex: 2 }}>
                        <FormInput
                            label={t('drink')}
                            value={drink}
                            onChange={setDrink}
                            placeholder={t('drinkPlaceholder')}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormInput
                            label={t('parSips')}
                            value={par}
                            onChange={setPar}
                            keyboardType="numeric"
                            placeholder={t('parPlaceholder')}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    pubGolfContainer: {
        padding: 20,
        borderRadius: 24,
        gap: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputLabel: {
        // Obsolete
    },
    input: {
        // Obsolete
    },
});
