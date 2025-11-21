import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from "@/src/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import AppPreferencesScreen from '@/src/screens/AppPreferencesScreen';

const Stack = createNativeStackNavigator();

export default function DefaultStack({ screen: ScreenComponent, name }: any) {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => (
          <SafeAreaView edges={['top']}>
            <Header />
          </SafeAreaView>
        ),
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={name}
        component={ScreenComponent}
      />

      {name === 'Profile' && (
        <Stack.Screen
          name="AppPreferences"
          component={AppPreferencesScreen}
          options={{ title: 'App Preferences' }}
        />
      )}
    </Stack.Navigator>
  );
}
