import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarkScreen from '../screen/BookmarkScreen';
import MovieDetailScreen from '../screen/MovieDetailScreen';
import { BookmarkStackParamList } from './types';

const Stack = createNativeStackNavigator<BookmarkStackParamList>();

export default function BookmarkStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BookmarkMain" component={BookmarkScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
    </Stack.Navigator>
  );
}