import { AlertCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton } from './AnimatedButton';
import { TextComponent } from './TextComponent';

interface ErrorViewProps {
    title?: string;
    message?: string;
    onAction?: () => void;
    actionScript?: string;
    icon?: React.ReactNode;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
    title = "Something went wrong",
    message = "We encountered an unexpected error. Please try again or go back home.",
    onAction,
    actionScript = "Go Home",
    icon
}) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.danger + '20' }]}>
                    {icon || <AlertCircle size={48} color={theme.danger} />}
                </View>

                <TextComponent variant="h2" center style={{ marginVertical: 16 }}>
                    {title}
                </TextComponent>

                <TextComponent variant="body" color={theme.textSecondary} center style={{ marginBottom: 32 }}>
                    {message}
                </TextComponent>

                {onAction && (
                    <AnimatedButton
                        title={actionScript}
                        onPress={onAction}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    }
});
