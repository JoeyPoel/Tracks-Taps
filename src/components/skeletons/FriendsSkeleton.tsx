import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

export default function FriendsSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {/* Header Tabs Shimmer */}
            <View style={[styles.tabs, { backgroundColor: theme.bgSecondary }]}>
                <Shimmer width="48%" height={36} borderRadius={8} />
                <Shimmer width="48%" height={36} borderRadius={8} />
            </View>

            {/* Search Input Shimmer */}
            <View style={[styles.search, { backgroundColor: theme.bgSecondary }]}>
                <Shimmer width="100%" height="100%" borderRadius={16} />
            </View>

            {/* List Items */}
            <View style={styles.list}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={styles.listItem}>
                        <Shimmer width={44} height={44} borderRadius={14} style={{ marginRight: 16 }} />
                        <View style={{ gap: 8, flex: 1 }}>
                            <Shimmer width={140} height={16} borderRadius={4} />
                            <Shimmer width={100} height={12} borderRadius={4} />
                        </View>
                        <Shimmer width={16} height={16} borderRadius={8} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80, // Approximate header height
    },
    tabs: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        height: 44,
        marginBottom: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    search: {
        height: 48,
        borderRadius: 16,
        marginBottom: 20,
    },
    list: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
});
