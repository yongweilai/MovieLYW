import React from 'react';
import { FlashList } from '@shopify/flash-list';
import type { FlashListProps } from '@shopify/flash-list';

/**
 * Encapsulated FlashList – drop-in replacement for FlatList.
 * Uses Shopify FlashList for better performance (view recycling, no blank cells).
 * @see https://github.com/Shopify/flash-list
 */
function AppFlashList<T>(props: FlashListProps<T>) {
  return <FlashList {...props} />;
}

export default AppFlashList;
