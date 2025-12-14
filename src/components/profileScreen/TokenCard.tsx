import { useLanguage } from '@/src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CircleStackIcon, ShoppingCartIcon, SparklesIcon, UserPlusIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';

interface TokenCardProps {
    tokens: number;
    onBuyPress: () => void;
    onInvitePress: () => void;
}

export default function TokenCard({ tokens, onBuyPress, onInvitePress }: TokenCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.accent, theme.primary]} // Orange to Pink gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <CircleStackIcon size={32} color={theme.fixedWhite} />
                    </View>
                    <View style={styles.balanceContainer}>
                        <Text style={styles.label}>{t('yourTokens')}</Text>
                        <Text style={styles.balance}>{tokens}</Text>
                    </View>
                    <SparklesIcon size={32} color={theme.fixedWhite} style={styles.sparkleIcon} />
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.button} onPress={onBuyPress}>
                        <ShoppingCartIcon size={20} color={theme.fixedWhite} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>{t('buyTokens')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={onInvitePress}>
                        <UserPlusIcon size={20} color={theme.fixedWhite} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>{t('inviteFriends')}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)', // Keep semi-transparent white for contrast on gradient
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconOverlay: {
        position: 'absolute',
        top: 14,
        left: 14,
    },
    balanceContainer: {
        flex: 1,
    },
    label: {
        color: 'rgba(255,255,255,0.9)', // Keep semi-transparent white
        fontSize: 14,
        marginBottom: 4,
    },
    balance: {
        color: '#FFFFFF', // Keep white
        fontSize: 24,
        fontWeight: 'bold',
    },
    sparkleIcon: {
        opacity: 0.5,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)', // Keep semi-transparent white
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
