import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PointsStepperProps {
    points: string;
    onChange: (val: string) => void;
    label: string;
}

export function PointsStepper({ points, onChange, label }: PointsStepperProps) {
    const { theme } = useTheme();

    const updatePoints = (val: number) => {
        let newVal = val;
        if (newVal < 50) newVal = 50;
        if (newVal > 200) newVal = 200;
        // Round to nearest 5
        newVal = Math.round(newVal / 5) * 5;
        onChange(String(newVal));
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label} (50 - 200)</Text>
            <View style={styles.pointsContainer}>
                <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: theme.bgTertiary }]}
                    onPress={() => {
                        let val = (parseInt(points) || 50) - 5;
                        if (val < 50) val = 50;
                        onChange(String(val)); // Direct pass, let auto-fix on blur or here? 
                        // The user requested strict 5s logic. 
                        // My previous implementation handled it on press.
                    }}
                >
                    <Ionicons name="remove" size={24} color={theme.textPrimary} />
                </TouchableOpacity>

                <TextInput
                    style={[styles.pointsInput, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={points}
                    onChangeText={onChange}
                    onBlur={() => {
                        let val = parseInt(points) || 50;
                        updatePoints(val);
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                />

                <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: theme.bgTertiary }]}
                    onPress={() => {
                        let val = (parseInt(points) || 50) + 5;
                        if (val > 200) val = 200;
                        onChange(String(val));
                    }}
                >
                    <Ionicons name="add" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pointsInput: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        fontSize: 18,
        fontWeight: '700',
    },
    stepperBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
