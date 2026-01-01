import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FriendsTabsProps {
    activeTab: 'friends' | 'requests';
    onTabChange: (tab: 'friends' | 'requests') => void;
    requestCount: number;
}

export function FriendsTabs({ activeTab, onTabChange, requestCount }: FriendsTabsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'friends' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => onTabChange('friends')}
                activeOpacity={0.8}
            >
                <TextComponent
                    style={styles.tabText}
                    color={activeTab === 'friends' ? '#FFF' : theme.textSecondary}
                    bold
                    variant="body"
                >
                    {t('friends')}
                </TextComponent>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'requests' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => onTabChange('requests')}
                activeOpacity={0.8}
            >
                <View style={styles.requestsContent}>
                    <TextComponent
                        style={styles.tabText}
                        color={activeTab === 'requests' ? '#FFF' : theme.textSecondary}
                        bold
                        variant="body"
                    >
                        {t('requests')}
                    </TextComponent>
                    {requestCount > 0 && (
                        <View style={[
                            styles.badge,
                            { backgroundColor: activeTab === 'requests' ? '#FFF' : theme.primary }
                        ]}>
                            <TextComponent
                                style={styles.badgeText}
                                color={activeTab === 'requests' ? theme.primary : '#FFF'}
                                bold
                                variant="caption"
                            >
                                {requestCount}
                            </TextComponent>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        height: 44,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    requestsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    }
});
