import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TeamNameInputProps {
    value: string;
    onChange: (text: string) => void;
}

export const TeamNameInput: React.FC<TeamNameInputProps> = ({ value, onChange }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('teamName')}</Text>
            <TextInput
                style={[styles.input, {
                    backgroundColor: theme.bgSecondary,
                    color: theme.textPrimary,
                    borderColor: theme.borderPrimary
                }]}
                placeholder={t('enterTeamName')}
                placeholderTextColor={theme.textSecondary}
                value={value}
                onChangeText={onChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
});
