import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import StartTourButton from '../components/tourdetailScreen/StartTourButton';
import TourAbout from '../components/tourdetailScreen/TourAbout';
import TourGameModes from '../components/tourdetailScreen/TourGameModes';
import TourHeader from '../components/tourdetailScreen/TourHeader';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import TourStats from '../components/tourdetailScreen/TourStats';
import { useTheme } from '../context/ThemeContext';
import { reviews } from '../data/dummyReviews';
import { tours } from '../data/dummyTours';

export default function TourDetailScreen() {
  const { theme } = useTheme();

  const tour = tours[1]; // Example: Paris Art Tour
  const tourReviews = reviews.filter(r => r.tourId === tour.id);
  const reviewCount = tourReviews.length;
  const averageRating =
    reviewCount > 0
      ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // Mock data for components
  const mockReviewsData = [
    {
      id: '1',
      userId: '1',
      userName: 'Emma de Vries',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2024-11-20',
      comment: 'Amazing tour! Had so much fun with friends. The challenges were creative and the route was perfect!',
      images: ['https://picsum.photos/200/200?random=1', 'https://picsum.photos/200/200?random=2'],
    },
    {
      id: '2',
      userId: '2',
      userName: 'Lucas Bakker',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
      date: '2024-11-18',
      comment: 'Best pub golf experience ever! Great mix of challenges and amazing locations.',
    },
  ];

  const handleStartTour = () => {
    console.log('Tour started!');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TourHeader
          title="Maastricht Culinary Trail"
          author="Lucas Bakker"
          imageUrl="https://picsum.photos/600/400?random=3"
        />

        <TourStats
          distance="3.2 km"
          duration="165m"
          stops={7}
          points={780}
        />

        <TourAbout
          description="Taste your way through Maastricht's best food spots while completing fun culinary challenges and learning about local cuisine."
        />

        <TourGameModes
          modes={['Taste Quest', 'Bingo Mode']}
          challengesCount={14}
          stopsCount={7}
        />

        <StartTourButton onPress={handleStartTour} />

        <TourReviews
          reviews={mockReviewsData}
          averageRating={4.8}
          totalReviews={102}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
