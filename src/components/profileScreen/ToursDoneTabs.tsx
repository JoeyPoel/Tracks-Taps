import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ToursDoneTabsProps {
    activeTab: 'done' | 'reviews';
    onTabChange: (tab: 'done' | 'reviews') => void;
    doneCount: number;
    reviewsCount: number;
}

export function ToursDoneTabs({ activeTab, onTabChange, doneCount, reviewsCount }: ToursDoneTabsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'done' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => onTabChange('done')}
                activeOpacity={0.8}
            >
                <View style={styles.requestsContent}>
                    <TextComponent
                        style={styles.tabText}
                        color={activeTab === 'done' ? '#FFF' : theme.textSecondary}
                        bold
                        variant="body"
                    >
                        {t('toursDone') || 'Tours Done'}
                    </TextComponent>
                    {doneCount > 0 && (
                        <View style={[
                            styles.badge,
                            { backgroundColor: activeTab === 'done' ? '#FFF' : theme.primary }
                        ]}>
                            <TextComponent
                                style={styles.badgeText}
                                color={activeTab === 'done' ? theme.primary : '#FFF'}
                                bold
                                variant="caption"
                            >
                                {doneCount}
                            </TextComponent>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'reviews' && [styles.activeTab, { backgroundColor: theme.primary }]
                ]}
                onPress={() => onTabChange('reviews')}
                activeOpacity={0.8}
            >
                <View style={styles.requestsContent}>
                    <TextComponent
                        style={styles.tabText}
                        color={activeTab === 'reviews' ? '#FFF' : theme.textSecondary}
                        bold
                        variant="body"
                    >
                        {t('reviews') || 'Reviews'}
                    </TextComponent>
                    {reviewsCount > 0 && (
                        <View style={[
                            styles.badge,
                            { backgroundColor: activeTab === 'reviews' ? '#FFF' : theme.primary }
                        ]}>
                            <TextComponent
                                style={styles.badgeText}
                                color={activeTab === 'reviews' ? theme.primary : '#FFF'}
                                bold
                                variant="caption"
                            >
                                {reviewsCount}
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
        marginBottom: 16,
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
