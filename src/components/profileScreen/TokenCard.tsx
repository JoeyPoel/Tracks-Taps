import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
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
        <GenericCard variant="flat" padding="medium">
            <View style={styles.contentContainer}>
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
                        <TextComponent style={styles.balance} color={theme.textPrimary} bold variant="h3">{tokens} {t('tokens')}</TextComponent>
                        <TextComponent style={styles.label} color={theme.textSecondary} variant="caption">{t('availableBalance')}</TextComponent>
                    </View>
                </View>

                <View style={styles.actions}>
                    {/* Invite Button */}
                    {/* <AnimatedPressable
                        style={[styles.iconButton, { backgroundColor: theme.bgTertiary }]}
                        onPress={onInvitePress}
                        interactionScale="subtle"
                    >
                        <PaperAirplaneIcon size={20} color={theme.textSecondary} />
                    </AnimatedPressable> */}

                    {/* Top Up Button */}
                    <AnimatedPressable
                        style={[styles.buyButton, { backgroundColor: theme.bgPrimary, borderWidth: 1, borderColor: theme.borderPrimary }]}
                        onPress={onBuyPress}
                        interactionScale="subtle"
                    >
                        <PlusIcon size={16} color={theme.textPrimary} style={{ marginRight: 4 }} />
                        <TextComponent style={styles.buttonText} color={theme.textPrimary} bold variant="caption">{t('topUp')}</TextComponent>
                    </AnimatedPressable>
                </View>
            </View>
        </GenericCard>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 100,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
    }
});
