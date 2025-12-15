import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Team } from '../types/models';

export interface MockTeamStatus extends Team { }

export const useWaitingLobby = (activeTourId: number) => {
    const { theme } = useTheme();
    const router = useRouter();

    // Mock State for demonstration
    const [teams, setTeams] = useState<MockTeamStatus[]>([]);
    const [userTeam, setUserTeam] = useState<MockTeamStatus | null>(null);
    const [finishedCount, setFinishedCount] = useState(0);
    const [totalTeamCount, setTotalTeamCount] = useState(0);

    // Initializer to create mock data
    useEffect(() => {
        // Generate some dummy teams
        const mockTeams: MockTeamStatus[] = [
            { id: 101, name: 'Fire Breathers', emoji: '🔥', color: '#FF5733', score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: new Date() },
            { id: 102, name: 'Ice Warriors', emoji: '❄️', color: '#33C1FF', score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: null },
            { id: 103, name: 'Thunder Squad', emoji: '⚡', color: '#FFC300', score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: new Date() },
            { id: 104, name: 'Lightning Bolts', emoji: '💚', color: '#DAF7A6', score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: new Date() },
            { id: 105, name: 'Rocket Racers', emoji: '🚀', color: '#C70039', score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: new Date() },
        ];

        // Ensure user team is marked as finished (since they just arrived here)
        const myTeam: MockTeamStatus = {
            id: 999,
            name: 'Your Team',
            emoji: '👑',
            color: theme.primary,
            score: 0, streak: 0, currentStop: 0, activeTourId, userId: 0, finishedAt: new Date()
        };

        setTeams(mockTeams);
        setUserTeam(myTeam);

        // Stats
        const allTeams = [...mockTeams, myTeam];
        setTotalTeamCount(allTeams.length);
        const finished = allTeams.filter(t => t.finishedAt).length;
        setFinishedCount(finished);

    }, [activeTourId, theme.primary]);

    const handleViewResults = () => {
        router.replace({ pathname: '/tour-completed/[id]', params: { id: activeTourId, celebrate: 'true' } });
    };

    const progressPercentage = totalTeamCount > 0 ? (finishedCount / totalTeamCount) * 100 : 0;

    return {
        teams,
        userTeam,
        finishedCount,
        totalTeamCount,
        progressPercentage,
        handleViewResults
    };
};
