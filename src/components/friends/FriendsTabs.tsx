import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FriendsTabsProps {
    activeTab: 'friends' | 'requests';
    onTabChange: (tab: 'friends' | 'requests') => void;
    requestCount: number;
}

export function FriendsTabs({ activeTab, onTabChange, requestCount }: FriendsTabsProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.tabsWrapper}>
            <View style={[styles.tabContainer, { backgroundColor: theme.bgSecondary }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && { backgroundColor: theme.bgSecondary }]}
                    onPress={() => onTabChange('friends')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'friends' ? theme.primary : theme.textSecondary }]}>
                        Friends
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && { backgroundColor: theme.bgSecondary }]}
                    onPress={() => onTabChange('requests')}
                >

                    <Text style={[styles.tabText, { color: activeTab === 'requests' ? theme.primary : theme.textSecondary }]}>
                        Requests
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabsWrapper: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 16,
        height: 50,
    },
    tab: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
        position: 'absolute',
        top: -2,
    }
});
