import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Link } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ConfirmEmailScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={styles.content}>

                {/* Icon Section */}
                <Animated.View
                    entering={FadeInUp.delay(200).springify()}
                    style={styles.iconContainer}
                >
                    <MailCheck size={80} color={theme.success} strokeWidth={1.5} />
                    <View style={[styles.glow, { backgroundColor: theme.success }]} />
                </Animated.View>

                {/* Text Section */}
                <Animated.Text
                    entering={FadeInDown.delay(400).springify()}
                    style={[styles.title, { color: theme.textPrimary }]}
                >
                    {t('emailConfirmed') || "Email Confirmed!"}
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(600).springify()}
                    style={[styles.subtitle, { color: theme.textSecondary }]}
                >
                    {t('emailConfirmedSubtitle') || "Your email has been successfully verified. You can now access all features of the app."}
                </Animated.Text>

                {/* Button Section */}
                <Animated.View
                    entering={FadeInDown.delay(800).springify()}
                    style={styles.buttonContainer}
                >
                    <Link href="/(tabs)/explore" asChild>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary }]}
                        >
                            <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                                {t('continueToApp') || "Continue to App"}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        marginBottom: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.15,
        zIndex: -1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
