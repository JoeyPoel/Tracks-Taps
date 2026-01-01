import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface TrueFalseInputProps {
    value: boolean;
    onChange: (val: boolean) => void;
}

export function TrueFalseInput({ value, onChange }: TrueFalseInputProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.rowBetween}>
            <TextComponent style={styles.label} color={theme.textSecondary} bold variant="label">
                Correct Answer is TRUE?
            </TextComponent>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: theme.bgTertiary, true: theme.success }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
