import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useJoinTour } from '../hooks/useJoinTour';

export default function JoinTourScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const {
        tourCode,
        setTourCode,
        loading,
        error,
        setError,
        handleJoinTour
    } = useJoinTour();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            {/* Header removed for Tab consistency */}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                            <Ionicons name="people" size={32} color="#FFF" />
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('enterTourCode')}</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('getItFromHost')}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('tourCodeLabel')}</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: error ? theme.danger : theme.borderPrimary,
                                    color: theme.textPrimary,
                                    backgroundColor: theme.bgSecondary
                                }
                            ]}
                            placeholder="123456789"
                            placeholderTextColor={theme.textSecondary}
                            value={tourCode}
                            onChangeText={(text) => {
                                setTourCode(text);
                                setError(null);
                            }}
                        />
                        {error && <Text style={[styles.errorText, { color: theme.warning }]}>{error}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.joinButton,
                            { backgroundColor: theme.primary, opacity: loading || !tourCode ? 0.7 : 1 }
                        ]}
                        onPress={handleJoinTour}
                        disabled={loading || !tourCode}
                    >
                        <Text style={styles.joinButtonText}>
                            {loading ? t('verifying') : t('joinTourButton')}
                        </Text>
                        {!loading && <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>

                    {/* Info Cards */}
                    <View style={[styles.infoCard, { backgroundColor: theme.bgSecondaryColor, borderColor: theme.secondary }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: theme.bgSecondaryColor }]}>
                                <Ionicons name="sparkles" size={16} color={theme.secondary} />
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.secondary }]}>{t('howItWorks')}</Text>
                        </View>
                        <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep1')}</Text>
                        <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep2')}</Text>
                        <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep3')}</Text>
                        <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep4')}</Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.bgAccentColor, borderColor: theme.accent, marginTop: 16 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBadge, { backgroundColor: theme.bgAccentColor }]}>
                                <Ionicons name="people" size={16} color={theme.accent} />
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.accent }]}>{t('teamPlay')}</Text>
                        </View>
                        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{t('teamPlayDesc')}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    closeButton: {},
    content: { padding: 24, paddingBottom: 24 },
    iconContainer: { alignItems: 'center', marginBottom: 32 },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16 },
    inputContainer: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 1,
    },
    errorText: { marginTop: 8, fontSize: 14 },
    joinButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    joinButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative' },
    divider: { height: 1, flex: 1 },
    dividerText: { paddingHorizontal: 16, position: 'absolute' },
    qrContainer: {
        borderWidth: 2,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        height: 200,
    },
    qrText: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    qrSubtext: { fontSize: 14 },
    // Info Card Styles
    infoCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    cardStep: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
});
