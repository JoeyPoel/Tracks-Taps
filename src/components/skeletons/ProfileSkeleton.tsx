import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

export default function ProfileSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* UserProfileCard Skeleton */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Shimmer width={100} height={100} borderRadius={50} />
                    </View>

                    <View style={styles.infoCenter}>
                        <Shimmer width={180} height={28} borderRadius={8} style={{ marginBottom: 12 }} />
                        <Shimmer width={120} height={24} borderRadius={100} />
                    </View>

                    <View style={styles.xpContainer}>
                        <Shimmer width={100} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                        <Shimmer width="100%" height={6} borderRadius={3} />
                    </View>
                </View>

                {/* Action Button */}
                <View style={styles.actionButtonContainer}>
                    <Shimmer width="100%" height={50} borderRadius={25} />
                </View>

                {/* ProfileStats Skeleton */}
                <View style={[styles.statsCard, { backgroundColor: theme.bgSecondary }]}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                            <Shimmer width={40} height={24} borderRadius={6} />
                            <Shimmer width={60} height={14} borderRadius={4} />
                        </View>
                    ))}
                </View>

                {/* Recent Activity Section */}
                <View style={styles.section}>
                    <Shimmer width={150} height={24} borderRadius={8} style={{ marginBottom: 24 }} />

                    {/* Latest Created */}
                    <View style={{ marginBottom: 24 }}>
                        <Shimmer width={120} height={16} borderRadius={6} style={{ marginBottom: 12 }} />
                        <Shimmer width="100%" height={240} borderRadius={24} />
                    </View>

                    {/* Latest Played */}
                    <View style={{ marginBottom: 24 }}>
                        <Shimmer width={120} height={16} borderRadius={6} style={{ marginBottom: 12 }} />
                        <Shimmer width="100%" height={240} borderRadius={24} />
                    </View>
                </View>

                {/* Friends List Skeleton */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Shimmer width={120} height={24} borderRadius={8} />
                        <Shimmer width={60} height={20} borderRadius={6} />
                    </View>
                    <View style={{ gap: 12 }}>
                        {[1, 2, 3].map((i) => (
                            <Shimmer key={i} width="100%" height={80} borderRadius={20} />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        marginBottom: 24,
    },
    infoCenter: {
        alignItems: 'center',
        marginBottom: 24,
    },
    xpContainer: {
        width: '80%',
        alignItems: 'center',
    },
    actionButtonContainer: {
        marginBottom: 28,
    },
    statsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 20,
        borderRadius: 16,
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
});
