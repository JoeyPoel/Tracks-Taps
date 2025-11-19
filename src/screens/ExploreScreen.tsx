import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import TourCard from '../components/exploreScreen/TourCard';
import { tours } from '../data/dummyTours';

export default function ExploreScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
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
