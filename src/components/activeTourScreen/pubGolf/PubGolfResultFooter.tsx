import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScoreDetails } from '../../../utils/pubGolfUtils';

interface PubGolfResultFooterProps {
    scoreDetails: ScoreDetails;
    diffText: string;
}

export default function PubGolfResultFooter({
    scoreDetails,
    diffText,
}: PubGolfResultFooterProps) {
    return (
        <View style={styles.resultFooter}>
            <Text style={[styles.resultEmoji, { marginRight: 8 }]}>{scoreDetails.emoji}</Text>
            <Text style={[styles.resultText, { color: scoreDetails.color[0] }]}>
                {scoreDetails.name} <Text style={{ color: '#FFF', fontWeight: 'normal' }}>{scoreDetails.sub}</Text> {diffText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    resultEmoji: {
        fontSize: 18,
    },
    resultText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
