import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints'; // Adjust path as needed
import Confetti from '../components/activeTourScreen/animations/Confetti'; // Adjust path as needed

export default function GameScreen() {
    const [showPoints, setShowPoints] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Logic for Floating Points
    const handleScore = () => {
        setShowPoints(false);
        setTimeout(() => setShowPoints(true), 0);
    };

    // Logic for Confetti
    const handleConfetti = () => {
        // 1. Reset to false immediately to force a re-render if it's already running
        setShowConfetti(false);

        // 2. Set to true on next tick
        setTimeout(() => {
            setShowConfetti(true);

            // 3. Automatically turn off state after 8 seconds 
            // (Max duration of confetti animation is ~8s: 2s delay + 6s fall)
            setTimeout(() => {
                setShowConfetti(false);
            }, 8000);
        }, 100);
    };

    return (
        <SafeAreaView style={styles.screen}>

            <View style={styles.centerContent}>
                {/* Button 1: Points */}
                <Button title="Score Points!" onPress={handleScore} />

                {/* Spacer */}
                <View style={{ height: 20 }} />

                {/* Button 2: Confetti */}
                <Button color="#9C27B0" title="Celebration!" onPress={handleConfetti} />
            </View>

            {/* Conditionally render the floating points */}
            {showPoints && (
                <FloatingPoints
                    pointAmount={100}
                    onAnimationComplete={() => setShowPoints(false)}
                />
            )}

            {/* Conditionally render Confetti */}
            {showConfetti && <Confetti />}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#333',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});