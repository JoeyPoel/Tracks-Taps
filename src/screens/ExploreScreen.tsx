import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import TourCard from '../components/exploreScreen/TourCard';
import { tours } from '../data/dummyTours';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';

export default function ExploreScreen() {
    const activeTourProps = {
        title: 'Paris Highlights',
        progress: 0.6,
        progressText: '60% completed',
        onResume: () => console.log('Resuming tour'),
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ActiveTourCard {...activeTourProps} />

            {tours.map((tour) => (
                <TourCard
                    key={tour.id}
                    title={tour.title}
                    location={tour.location}
                    description={tour.description}
                    stops={tour.stops}
                    rating={tour.rating}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});
