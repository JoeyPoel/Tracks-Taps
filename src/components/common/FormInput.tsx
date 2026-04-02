import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TextComponent } from './TextComponent';

interface FormInputProps {
    label?: string;
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    error?: string;
    success?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    description?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    editable?: boolean;
    pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
    autoFocus?: boolean;
    secureTextEntry?: boolean;
    showPasswordToggle?: boolean;
    textContentType?: string;
    autoComplete?: any;
}

export function FormInput({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    maxLength,
    error,
    success,
    keyboardType = 'default',
    description,
    leftIcon,
    rightIcon,
    editable = true,
    pointerEvents,
    autoFocus,
    secureTextEntry,
    showPasswordToggle,
    textContentType,
    autoComplete
}: FormInputProps) {
    const { theme } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(!secureTextEntry);

    // Sync visibility if secureTextEntry changes
    React.useEffect(() => {
        setIsPasswordVisible(!secureTextEntry);
    }, [secureTextEntry]);

    return (
        <View style={styles.container} pointerEvents={pointerEvents}>
            <View style={styles.headerRow}>
                {label && (
                    <TextComponent style={styles.label} color={theme.textSecondary} bold variant="label">{label}</TextComponent>
                )}
                {maxLength && (
                    <TextComponent style={styles.charCount} color={value.length >= maxLength ? theme.danger : theme.textTertiary} variant="caption">
                        {value.length}/{maxLength}
                    </TextComponent>
                )}
            </View>

            <View style={[
                styles.inputContainer,
                multiline && styles.textAreaContainer,
                {
                    backgroundColor: theme.bgSecondary,
                    borderColor: error ? theme.danger : success ? theme.success : theme.borderPrimary,
                }
            ]}>
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.textPrimary
                        }
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textDisabled}
                    value={value}
                    onChangeText={onChange}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    editable={editable}
                    autoFocus={autoFocus}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    textContentType={textContentType as any}
                    autoComplete={autoComplete}
                />
                {showPasswordToggle ? (
                    <View style={styles.iconRight}>
                        <React.Suspense fallback={null}>
                            {/* We'll use Ionicons directly logic or pass through iconRight */}
                            <TextComponent 
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                style={{ padding: 4 }}
                            >
                                <Ionicons 
                                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color={theme.textTertiary} 
                                />
                            </TextComponent>
                        </React.Suspense>
                    </View>
                ) : rightIcon ? (
                    <View style={styles.iconRight}>{rightIcon}</View>
                ) : null}
            </View>

            {description && !error && (
                <TextComponent style={styles.helperText} color={theme.textTertiary} variant="caption">
                    {description}
                </TextComponent>
            )}

            {error && (
                <TextComponent style={styles.errorText} color={theme.danger} bold variant="caption">
                    {error}
                </TextComponent>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        textTransform: 'uppercase',
    },
    charCount: {
        // handled
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
    },
    textAreaContainer: {
        height: 120,
        alignItems: 'flex-start',
        paddingTop: 8,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    iconLeft: {
        paddingLeft: 16,
    },
    iconRight: {
        paddingRight: 16,
    },
    helperText: {
        marginLeft: 4,
    },
    errorText: {
        marginLeft: 4,
    }
});
