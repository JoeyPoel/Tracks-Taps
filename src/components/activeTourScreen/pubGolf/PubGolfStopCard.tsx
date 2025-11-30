import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getScoreDetails } from '../../../utils/pubGolfUtils';
import PubGolfInputGrid from './PubGolfInputGrid';
import PubGolfResultFooter from './PubGolfResultFooter';
import PubGolfStopHeader from './PubGolfStopHeader';

interface PubGolfStopCardProps {
    stopNumber: number;
    stopName: string;
    drinkName: string;
    par: number;
    sips?: number; // If undefined, it's not completed yet
    isActive: boolean;
    onSave: (sips: number) => void;
}

export default function PubGolfStopCard({
    stopNumber,
    stopName,
    drinkName,
    par,
    sips,
    isActive,
    onSave
}: PubGolfStopCardProps) {
    const { theme } = useTheme();
    const [selectedSips, setSelectedSips] = useState<number | null>(null);

    const isCompleted = sips !== undefined;
    const scoreDetails = getScoreDetails(par, sips);

    // Calculate display text for the difference
    const diff = isCompleted ? (sips! - par) : 0;
    const diffText = diff > 0 ? `(+${diff})` : diff === 0 ? '' : `(${diff})`;

    // Determine card background color
    const cardBg = isCompleted && scoreDetails
        ? theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][2]
        : theme.bgSecondary;

    const cardBorder = isCompleted && scoreDetails
        ? theme.pubGolf[scoreDetails.colorKey as keyof typeof theme.pubGolf][0]
        : theme.bgSecondary;

    return (
        <View style={[
            styles.container,
            { backgroundColor: cardBg, shadowColor: theme.shadowColor, borderColor: cardBorder, borderWidth: 1 },
            isActive && { borderColor: theme.primary, borderWidth: 2 }
        ]}>
            <PubGolfStopHeader
                stopNumber={stopNumber}
                stopName={stopName}
                drinkName={drinkName}
                par={par}
                sips={sips}
                scoreDetails={scoreDetails}
                isCompleted={isCompleted}
                isActive={isActive}
            />

            {/* Middle: Input Grid (Only when active and playing) */}
            {isActive && !isCompleted && (
                <PubGolfInputGrid
                    par={par}
                    selectedSips={selectedSips}
                    onSelectSips={(num) => {
                        setSelectedSips(num);
                        onSave(num);
                    }}
                />
            )}

            {/* Bottom: Result Text */}
            {isCompleted && scoreDetails && (
                <PubGolfResultFooter
                    scoreDetails={scoreDetails}
                    diffText={diffText}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        // Subtle shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
});