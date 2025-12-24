import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

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

    if (!isPubGolfEnabled) return null;

    return (
        <View style={[styles.pubGolfContainer, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="beer" size={20} color={theme.accent} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: 16 }]}>Pub Golf Stop?</Text>
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
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Drink</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bgPrimary, color: theme.textPrimary }]}
                            value={drink}
                            onChangeText={setDrink}
                            placeholder="e.g. Pint of Lager"
                            placeholderTextColor={theme.textDisabled}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Par (Sips)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bgPrimary, color: theme.textPrimary }]}
                            value={par}
                            onChangeText={setPar}
                            keyboardType="numeric"
                            placeholder="3"
                            placeholderTextColor={theme.textDisabled}
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
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    input: {
        borderRadius: 24,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
});
