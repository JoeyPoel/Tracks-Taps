import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { TextComponent } from '@/src/components/common/TextComponent';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import CreateTourWizard from '@/src/screens/CreateTourWizard';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LockClosedIcon } from 'react-native-heroicons/outline';

export default function CreateTourScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                    <LockClosedIcon size={48} color={theme.primary} />
                </View>
                <TextComponent variant="h2" style={[styles.title, { color: theme.textPrimary }]}>
                    Create Your First Tour
                </TextComponent>
                <TextComponent variant="body" style={[styles.description, { color: theme.textSecondary }]}>
                    Log in to start creating immersive audio tours for the world to explore.
                </TextComponent>
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        title="Log In"
                        onPress={() => router.push('/auth/login')}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                    <AnimatedButton
                        title="Create Account"
                        onPress={() => router.push('/auth/register')}
                        variant="outline"
                        style={{ width: '100%' }}
                    />
                </View>
            </View>
        );
    }

    return <CreateTourWizard />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        padding: 24,
        borderRadius: 100,
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        marginBottom: 32,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    }
});
