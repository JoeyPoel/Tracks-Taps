import { useLanguage } from '@/src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { CircleStackIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface TokenCardProps {
    tokens: number;
    onBuyPress: () => void;
    onInvitePress: () => void;
}

export default function TokenCard({ tokens, onBuyPress, onInvitePress }: TokenCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.leftContent}>
                {/* The "Jewel": Gradient Icon Background */}
                <LinearGradient
                    colors={[theme.accent, theme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                >
                    <CircleStackIcon size={20} color="#FFF" />
                </LinearGradient>

                <View>
                    <Text style={[styles.balance, { color: theme.textPrimary }]}>{tokens} {t('tokens')}</Text>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{t('availableBalance')}</Text>
                </View>
            </View>

            <AnimatedPressable
                style={[styles.buyButton, { backgroundColor: theme.bgPrimary, borderWidth: 1, borderColor: theme.borderPrimary }]}
                onPress={onBuyPress}
                interactionScale="subtle"
            >
                <PlusIcon size={16} color={theme.textPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.buttonText, { color: theme.textPrimary }]}>{t('topUp')}</Text>
            </AnimatedPressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    balance: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
    }
});
