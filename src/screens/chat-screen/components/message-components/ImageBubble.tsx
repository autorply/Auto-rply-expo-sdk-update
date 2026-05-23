import { Platform } from 'react-native';

import {
  ImageBubble as ImageBubbleIOS,
  ImageBubbleContainer as ImageBubbleContainerIOS,
} from './ImageBubble.ios';
import {
  ImageBubble as ImageBubbleAndroid,
  ImageBubbleContainer as ImageBubbleContainerAndroid,
} from './ImageBubble.android';

export const ImageBubble = Platform.OS === 'ios' ? ImageBubbleIOS : ImageBubbleAndroid;
export const ImageBubbleContainer =
  Platform.OS === 'ios' ? ImageBubbleContainerIOS : ImageBubbleContainerAndroid;
