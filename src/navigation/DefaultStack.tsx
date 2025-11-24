import AppHeader from "@/src/components/Header";
import { useTheme } from '@/src/context/ThemeContext';
import AppPreferencesScreen from '@/src/screens/AppPreferencesScreen';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function DefaultStack({ screen: ScreenComponent, name }: any) {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        header: () => {
          const navigation = useNavigation();

          // Determine header props based on screen name
          let headerProps: any = {};

          if (name === 'Profile') {
            headerProps = {
              rightIcon: 'settings-outline',
              onRightIconPress: () => navigation.navigate('AppPreferences' as never),
            };
          }

          return (
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.bgPrimary }}>
              <AppHeader {...headerProps} />
            </SafeAreaView>
          );
        },
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
          options={{
            header: () => {
              const navigation = useNavigation();
              return (
                <SafeAreaView edges={['top']} style={{ backgroundColor: theme.bgPrimary }}>
                  <AppHeader
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                  />
                </SafeAreaView>
              );
            },
          }}
        />
      )}
    </Stack.Navigator>
  );
}
