import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import PostTourFooter from '../components/post-tour/PostTourFooter';
import PostTourHeader from '../components/post-tour/PostTourHeader';
import PostTourMyTeam from '../components/post-tour/PostTourMyTeam';
import PostTourProgress from '../components/post-tour/PostTourProgress';
import PostTourTeamList from '../components/post-tour/PostTourTeamList';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useWaitingLobby } from '../hooks/useWaitingLobby';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStore } from '../store/store';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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

    const { speak, stop, isSpeaking } = useTextToSpeech();
    const narrationMode = useStore(state => state.narrationMode);
    const showSpeakButtons = useStore(state => state.showSpeakButtons);
    const isFocused = useIsFocused();

    const buildNarration = () => {
        const tourTitle = activeTour?.tour?.title || t('tour');
        const remaining = totalTeamCount - finishedCount;
        let text = `${t('narrationPostTourLobby')}: ${tourTitle}. ${t('narrationWaitingFor')} ${remaining} ${t('narrationMoreTeamsToFinish')} ${finishedCount} ${t('of')} ${totalTeamCount} ${t('narrationOfTeamsCompleted')} `;
        if (userTeam) {
            text += `${t('yourTeam')}: ${userTeam.name || t('yourTeam')} — ${t('points')}: ${userTeam.score || 0}. `;
        }
        text += t('narrationTapViewResultsWhenDone');
        return text;
    };

    useEffect(() => {
        if (isFocused && narrationMode === 'full' && activeTour) {
            speak(buildNarration());
        }
        return () => { stop(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, narrationMode, finishedCount, activeTour?.id]);

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={true}>
            <View style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="box-none">
                <ScreenHeader
                    title=""
                    showBackButton={true}
                    blurBack={true}
                    onBackPress={() => router.replace('/')}
                    style={{ marginBottom: 0 }}
                />
            </View>
            {/* Manual speak button */}
            {showSpeakButtons && (
                <TouchableOpacity
                    onPress={() => isSpeaking ? stop() : speak(buildNarration())}
                    style={{ position: 'absolute', top: 50, right: 16, zIndex: 20, padding: 8, backgroundColor: theme.bgSecondary + 'CC', borderRadius: 20 }}
                    accessibilityLabel="Read lobby status aloud"
                >
                    <Ionicons name={isSpeaking ? 'volume-mute' : 'volume-medium'} size={22} color={theme.textPrimary} />
                </TouchableOpacity>
            )}

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

                    <PostTourMyTeam
                        userTeam={userTeam}
                        isPubGolf={activeTour?.tour?.modes?.includes('pubgolf')}
                        stops={activeTour?.tour?.stops}
                    />

                    <PostTourTeamList
                        teams={teams}
                        userTeamId={userTeam?.id}
                        isPubGolf={activeTour?.tour?.modes?.includes('pubgolf')}
                        stops={activeTour?.tour?.stops}
                    />

                    <PostTourFooter
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
