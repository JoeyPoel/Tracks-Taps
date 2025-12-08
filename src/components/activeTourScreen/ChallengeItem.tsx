import React from 'react';
import { Text, View } from 'react-native';
import DareChallenge from './challenges/DareChallenge';
import LocationChallenge from './challenges/LocationChallenge';
import PictureChallenge from './challenges/PictureChallenge';
import RiddleChallenge from './challenges/RiddleChallenge';
import TriviaChallenge from './challenges/TriviaChallenge';
import TrueFalseChallenge from './challenges/TrueFalseChallenge';

interface ChallengeItemProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    triviaSelected: { [key: number]: number };
    setTriviaSelected: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
    onClaimArrival: (challenge: any) => void;
    onSubmitTrivia: (challenge: any) => void;
    onFail: (challenge: any) => void; // Add handler
}

const ChallengeItem: React.FC<ChallengeItemProps> = ({
    challenge,
    isCompleted,
    isFailed,
    triviaSelected,
    setTriviaSelected,
    onClaimArrival,
    onSubmitTrivia,
    onFail, // Destructure
}) => {
    const type = challenge.type.toLowerCase();

    // Helper handlers
    const handleComplete = (chal: any) => {
        onClaimArrival(chal);
    };

    const handleFail = (chal: any) => {
        // Call the parent handler to persist failure
        onFail(chal);
    };

    switch (type) {
        case 'location':
            return (
                <LocationChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    onComplete={handleComplete}
                />
            );
        case 'trivia':
            return (
                <TriviaChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    triviaSelected={triviaSelected}
                    setTriviaSelected={setTriviaSelected}
                    onSubmit={onSubmitTrivia}
                />
            );
        case 'picture':
            return (
                <PictureChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    onComplete={handleComplete}
                />
            );
        case 'true_false':
            return (
                <TrueFalseChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    onComplete={handleComplete}
                    onFail={handleFail}
                />
            );
        case 'dare':
            return (
                <DareChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    onComplete={handleComplete}
                />
            );
        case 'riddle':
            return (
                <RiddleChallenge
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isFailed={isFailed}
                    onComplete={handleComplete}
                    onFail={handleFail}
                />
            );
        default:
            return (
                <View>
                    <Text>Unknown Challenge Type: {type}</Text>
                </View>
            );
    }
};

export default ChallengeItem;
