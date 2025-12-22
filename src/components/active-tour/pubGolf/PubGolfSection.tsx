import React from 'react';
import { View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import PubGolfScoreCard from './PubGolfScoreCard';
import PubGolfStopCard from './PubGolfStopCard';

interface PubGolfSectionProps {
    activeTour: any;
    pubGolfScores: Record<number, number>;
    currentStopId?: number;
    handleSaveSips: (stopId: number, sips: number) => void;
}

const PubGolfSection: React.FC<PubGolfSectionProps> = ({
    activeTour,
    pubGolfScores,
    currentStopId,
    handleSaveSips
}) => {
    const { t } = useLanguage();
    const pubGolfStops = activeTour.tour?.stops?.filter((s: any) => s.pubgolfPar) || [];
    const totalPar = pubGolfStops.reduce((sum: number, s: any) => sum + (s.pubgolfPar || 0), 0);

    // Calculate totals based on completed stops
    let totalSips = 0;
    let currentScore = 0;

    Object.entries(pubGolfScores).forEach(([stopId, sips]) => {
        const stop = pubGolfStops.find((s: any) => s.id === parseInt(stopId));
        if (stop && stop.pubgolfPar) {
            totalSips += sips;
            currentScore += (sips - stop.pubgolfPar);
        }
    });

    return (
        <View>
            <PubGolfScoreCard
                totalSips={totalSips}
                totalPar={totalPar}
                currentScore={currentScore}
            />
            {pubGolfStops.map((stop: any) => (
                <PubGolfStopCard
                    key={stop.id}
                    stopNumber={stop.number}
                    stopName={stop.name}
                    drinkName={stop.pubgolfDrink || t('drink')}
                    par={stop.pubgolfPar || 3}
                    sips={pubGolfScores[stop.id]}
                    isActive={stop.id === currentStopId}
                    onSave={(sips) => handleSaveSips(stop.id, sips)}
                />
            ))}
        </View>
    );
};

export default PubGolfSection;
