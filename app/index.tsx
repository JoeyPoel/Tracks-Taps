import React from 'react';
import AppNavigator from '../src/navigation/AppNavigator';
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function Index() {
    return(
        <SafeAreaProvider>
            <AppNavigator />;
        </SafeAreaProvider>
    );
}