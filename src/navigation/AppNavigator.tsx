import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { useTheme } from '@/src/context/ThemeContext';
import ExploreScreen from '@/src/screens/ExploreScreen';
import MapScreen from '@/src/screens/MapScreen';
import ProfileScreen from '@/src/screens/ProfileScreen';
import TourDetailScreen from '@/src/screens/TourDetailScreen';
import DefaultStack from './DefaultStack';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.bgPrimary,
          borderTopColor: theme.borderSecondary
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'explore': iconName = 'search-outline'; break;
            case 'tourdetail': iconName = 'information-circle-outline'; break;
            case 'map': iconName = 'map-outline'; break;
            case 'profile': iconName = 'person-outline'; break;
            default: iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="explore"
        children={() => <DefaultStack name="Explore" screen={ExploreScreen} />}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="tourdetail"
        children={() => <DefaultStack name="Tour Detail" screen={TourDetailScreen} />}
        options={{ tabBarLabel: 'Tour' }}
      />
      <Tab.Screen
        name="map"
        children={() => <DefaultStack name="Map" screen={MapScreen} />}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="profile"
        children={() => <DefaultStack name="Profile" screen={ProfileScreen} />}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
