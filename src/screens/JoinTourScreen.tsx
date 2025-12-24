import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { JoinInfoCards } from '../components/joinScreen/JoinInfoCards';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useJoinTour } from '../hooks/useJoinTour';

export default function JoinTourScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const {
        tourCode,
        setTourCode,
        loading,
        error,
        setError,
        handleJoinTour
    } = useJoinTour();

    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper animateEntry={false} includeTop={false} includeBottom={false}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    {t('joinTourButton')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInUp.delay(200).duration(500)}>
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
                                keyboardType="number-pad"
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
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20
    },
    iconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, textAlign: 'center' },
    inputContainer: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 4,
    },
    errorText: { marginTop: 8, fontSize: 14 },
    joinButtonRefactored: {
        marginBottom: 32,
    },
});
