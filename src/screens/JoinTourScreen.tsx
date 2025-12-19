import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppHeader from '../components/Header';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { JoinInfoCards } from '../components/joinScreen/JoinInfoCards';
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
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <AppHeader />

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

                    <AnimatedButton
                        title={loading ? t('verifying') : t('joinTourButton')}
                        onPress={handleJoinTour}
                        loading={loading}
                        disabled={loading || !tourCode}
                        icon={!loading ? "arrow-forward" : undefined}
                        variant="primary"
                        style={styles.joinButtonRefactored}
                    />

                    <JoinInfoCards />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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
    joinButtonRefactored: {
        marginBottom: 32,
    },
});
