import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextComponent } from '../../../common/TextComponent'; // Added import

interface Props {
    item: any;
    onRemove: () => void;
    onEdit: () => void;
}

export function StopCardHeader({ item, onRemove, onEdit }: Props) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <TextComponent style={styles.stopName} color={theme.textPrimary} bold variant="h3">
                    {item.name}
                </TextComponent>
                <View style={styles.metaRow}>
                    {item.pubgolfDrink && (
                        <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
                            <Ionicons name="beer" size={12} color={theme.warning} />
                            <TextComponent style={styles.badgeText} color={theme.warning} bold variant="caption">
                                {item.pubgolfDrink} ({t('par')} {item.pubgolfPar})
                            </TextComponent>
                        </View>
                    )}
                    <TextComponent style={styles.stopMeta} color={theme.textTertiary} variant="caption">
                        {item.challenges?.length || 0} {t('challenges')}
                    </TextComponent>
                </View>
            </View>
            <View style={styles.actionsRow}>
                <TouchableOpacity onPress={onEdit} style={[styles.iconBtn, { backgroundColor: theme.bgTertiary }]}>
                    <Ionicons name="pencil" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onRemove} style={[styles.iconBtn, { backgroundColor: theme.bgTertiary }]}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
            </View>
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
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    stopName: {
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
        // fontSize handled by TextComponent
    },
    stopMeta: {
        // fontSize handled by TextComponent
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
    },
});
