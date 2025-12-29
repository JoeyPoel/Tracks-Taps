import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

export default function ProfileSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {/* Header Image Area */}
            <View style={[styles.headerImage, { backgroundColor: theme.bgSecondary }]}>
                <Shimmer width="100%" height="100%" />
            </View>

            <View style={styles.content}>
                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: theme.bgSecondary }]}>
                    <View style={styles.avatarRow}>
                        <Shimmer width={80} height={80} borderRadius={24} style={{ marginRight: 16 }} />
                        <View style={{ gap: 8 }}>
                            <Shimmer width={160} height={24} borderRadius={8} />
                            <Shimmer width={100} height={16} borderRadius={4} />
                        </View>
                    </View>

                    <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Shimmer width={80} height={40} borderRadius={12} />
                        <Shimmer width={80} height={40} borderRadius={12} />
                        <Shimmer width={80} height={40} borderRadius={12} />
                    </View>
                </View>

                {/* Activity Section */}
                <View style={{ marginTop: 32, gap: 16 }}>
                    <Shimmer width={180} height={24} borderRadius={8} />
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <Shimmer width={48} height={48} borderRadius={24} />
                            <View style={{ gap: 6 }}>
                                <Shimmer width={200} height={16} borderRadius={4} />
                                <Shimmer width={100} height={12} borderRadius={4} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerImage: {
        height: 300,
        width: '100%',
        marginBottom: -80,
    },
    content: {
        paddingHorizontal: 20,
    },
    profileCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
