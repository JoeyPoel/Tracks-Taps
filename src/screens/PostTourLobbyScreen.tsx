import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AppHeader from '../components/Header';
import PostTourFooter from '../components/post-tour/PostTourFooter';
import PostTourHeader from '../components/post-tour/PostTourHeader';
import PostTourProgress from '../components/post-tour/PostTourProgress';
import PostTourTeamList from '../components/post-tour/PostTourTeamList';
import { useTheme } from '../context/ThemeContext';
import { useWaitingLobby } from '../hooks/useWaitingLobby';

export default function PostTourLobbyScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();

    const {
        teams,
        userTeam,
        finishedCount,
        totalTeamCount,
        progressPercentage,
        handleViewResults
    } = useWaitingLobby(activeTourId);

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <AppHeader title={"Lobby"} showBackButton={true} onBackPress={() => router.replace('/')} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <PostTourHeader />

                <View style={styles.mainContent}>
                    <PostTourProgress
                        finishedCount={finishedCount}
                        totalTeamCount={totalTeamCount}
                        progressPercentage={progressPercentage}
                    />

                    <PostTourTeamList
                        teams={teams}
                        userTeamId={userTeam?.id}
                    />

                    <PostTourFooter
                        userTeam={userTeam}
                        handleViewResults={handleViewResults}
                    />
                </View>
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: 40,
    },
    mainContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
});
