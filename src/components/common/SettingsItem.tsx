import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';

interface SettingsItemProps {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    showBorder?: boolean;
    rightElement?: React.ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
    icon,
    title,
    onPress,
    showBorder = true,
    rightElement
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.settingsRow,
                {
                    borderBottomColor: theme.borderSecondary,
                    borderBottomWidth: showBorder ? 1 : 0
                }
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {icon}
                <TextComponent style={styles.settingsLabel} color={theme.textPrimary} bold variant="body">{title}</TextComponent>
            </View>

            {rightElement || <ChevronRightIcon size={20} color={theme.textSecondary} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingsLabel: {
        fontSize: 16,
        fontWeight: '500',
    }
});
