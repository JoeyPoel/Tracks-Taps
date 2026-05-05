import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import client from '../../api/apiClient';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useUserContext } from '../../context/UserContext';
import { AppSettings } from '../../types/models';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent';

interface AdminSettingsModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isVisible, onClose }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user } = useUserContext();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [freeEnabled, setFreeEnabled] = useState(false);
    const [untilDate, setUntilDate] = useState<Date | null>(null);

    useEffect(() => {
        if (isVisible) {
            fetchSettings();
        }
    }, [isVisible]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await client.get('/app-settings');
            const data = response.data;
            setSettings(data);
            setFreeEnabled(data.freeToursEnabled);
            setUntilDate(data.freeToursUntil ? new Date(data.freeToursUntil) : null);
        } catch (error) {
            console.error('Failed to fetch admin settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await client.patch('/app-settings', {
                userId: user.id,
                freeToursEnabled: freeEnabled,
                freeToursUntil: untilDate ? untilDate.toISOString() : null,
            });
            Alert.alert(t('success'), t('updateSuccess'));
            onClose();
        } catch (error: any) {
            console.error('Failed to update admin settings:', error);
            Alert.alert(t('error'), error.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const setQuickDate = (days: number | null) => {
        if (days === null) {
            setUntilDate(null);
        } else {
            const date = new Date();
            date.setDate(date.getDate() + days);
            // Set to end of day
            date.setHours(23, 59, 59, 999);
            setUntilDate(date);
        }
    };

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            useNativeDriver
            hideModalContentWhileAnimating
            style={styles.modal}
        >
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
                    <TextComponent variant="h3" bold color={theme.textPrimary}>
                        Admin Panel
                    </TextComponent>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <View style={styles.content}>
                        {/* Free Tours Toggle */}
                        <View style={[styles.settingRow, { backgroundColor: theme.bgSecondary }]}>
                            <View style={styles.settingInfo}>
                                <TextComponent variant="body" bold color={theme.textPrimary}>
                                    Enable Global Free Tours
                                </TextComponent>
                                <TextComponent variant="caption" color={theme.textSecondary}>
                                    When enabled, all tours can be started without tokens.
                                </TextComponent>
                            </View>
                            <Switch
                                value={freeEnabled}
                                onValueChange={setFreeEnabled}
                                trackColor={{ false: theme.bgInput, true: theme.primary }}
                                thumbColor={Platform.OS === 'ios' ? '#fff' : (freeEnabled ? theme.primary : '#f4f3f4')}
                            />
                        </View>

                        {/* Date Selection */}
                        {freeEnabled && (
                            <View style={styles.dateSection}>
                                <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.sectionTitle}>
                                    FREE UNTIL...
                                </TextComponent>
                                <View style={styles.quickDates}>
                                    {[
                                        { label: 'Indefinite', value: null },
                                        { label: '1 Day', value: 1 },
                                        { label: '3 Days', value: 3 },
                                        { label: '1 Week', value: 7 },
                                    ].map((opt) => (
                                        <TouchableOpacity
                                            key={opt.label}
                                            style={[
                                                styles.dateCard,
                                                { 
                                                    backgroundColor: theme.bgSecondary,
                                                    borderColor: (opt.value === null && untilDate === null) || 
                                                                 (opt.value !== null && untilDate && Math.abs(untilDate.getTime() - (new Date().getTime() + opt.value * 86400000)) < 1000000)
                                                                 ? theme.primary : 'transparent',
                                                    borderWidth: 1
                                                }
                                            ]}
                                            onPress={() => setQuickDate(opt.value)}
                                        >
                                            <TextComponent 
                                                variant="caption" 
                                                bold={((opt.value === null && untilDate === null) || (opt.value !== null && untilDate && Math.abs(untilDate.getTime() - (new Date().getTime() + opt.value * 86400000)) < 1000000))} 
                                                color={((opt.value === null && untilDate === null) || (opt.value !== null && untilDate && Math.abs(untilDate.getTime() - (new Date().getTime() + opt.value * 86400000)) < 1000000)) ? theme.primary : theme.textSecondary}
                                            >
                                                {opt.label}
                                            </TextComponent>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {untilDate && (
                                    <View style={[styles.dateDisplay, { backgroundColor: theme.primary + '10' }]}>
                                        <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                                        <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 8 }}>
                                            Active until: {untilDate.toLocaleDateString()} {untilDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </TextComponent>
                                    </View>
                                )}
                            </View>
                        )}

                        <AnimatedPressable
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <TextComponent variant="body" bold color="#fff">
                                        Save Settings
                                    </TextComponent>
                                </>
                            )}
                        </AnimatedPressable>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    centerContainer: {
        padding: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    dateSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        letterSpacing: 1,
    },
    quickDates: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    dateCard: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
});
