import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import TourCompletedScreen from '../../../src/screens/TourCompletedScreen';

export default function Page() {
    const { id, celebrate } = useLocalSearchParams();
    return <TourCompletedScreen activeTourId={Number(id)} celebrate={celebrate === 'true'} />;
}
