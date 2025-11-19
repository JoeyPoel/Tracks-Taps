import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { lightTheme } from '../theme/theme';

export default function Header() {
    const route = useRoute();
    const title = route.name;

    const isExplore = title === 'Explore';

    return (
        <View style={[styles.container, { backgroundColor: lightTheme.bgPrimary }]}>
            {isExplore ? (
                <Text style={styles.exploreText}>
                    <Text style={{ color: lightTheme.primary }}>Tracks</Text>
                    <Text style={{ color: lightTheme.secondary }}>&Traps</Text>
                </Text>
            ) : (
                <Text style={[styles.title, { color: lightTheme.primary }]}>
                    {title}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: lightTheme.textOnSecondary,
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '600',
    },
    exploreText: {
        fontSize: 22,
        textAlign: 'center',
        fontWeight: '700',
    },
});
