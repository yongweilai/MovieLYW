import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MovieHomeScreen from '../screen/MovieHomeScreen';
import MovieDetailScreen from '../screen/MovieDetailScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={MovieHomeScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
    </Stack.Navigator>
  );
}