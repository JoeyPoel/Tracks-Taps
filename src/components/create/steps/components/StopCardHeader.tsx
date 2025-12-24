import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    item: any;
    onRemove: () => void;
}

export function StopCardHeader({ item, onRemove }: Props) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.stopName, { color: theme.textPrimary }]}>{item.name}</Text>
                <View style={styles.metaRow}>
                    {item.pubgolfDrink && (
                        <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
                            <Ionicons name="beer" size={12} color={theme.warning} />
                            <Text style={[styles.badgeText, { color: theme.warning }]}>
                                {item.pubgolfDrink} ({t('par')} {item.pubgolfPar})
                            </Text>
                        </View>
                    )}
                    <Text style={[styles.stopMeta, { color: theme.textTertiary }]}>
                        {item.challenges?.length || 0} {t('challenges')}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={onRemove} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
    },
    stopName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    stopMeta: {
        fontSize: 12,
        fontWeight: '600',
    },
    iconBtn: {
        padding: 4,
    },
});
