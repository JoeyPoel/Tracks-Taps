import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import PostTourFooter from '../components/post-tour/PostTourFooter';
import PostTourHeader from '../components/post-tour/PostTourHeader';
import PostTourProgress from '../components/post-tour/PostTourProgress';
import PostTourTeamList from '../components/post-tour/PostTourTeamList';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useWaitingLobby } from '../hooks/useWaitingLobby';

export default function PostTourLobbyScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    const {
        teams,
        userTeam,
        finishedCount,
        totalTeamCount,
        progressPercentage,
        activeTour,
        handleViewResults
    } = useWaitingLobby(activeTourId);

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={true}>
            <View style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
                <ScreenHeader
                    title=""
                    showBackButton={true}
                    onBackPress={() => router.replace('/')}
                    style={{ marginBottom: 0 }}
                />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <PostTourHeader imageUrl={activeTour?.tour?.imageUrl} />

                <View style={styles.contentContainer}>
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
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
});
