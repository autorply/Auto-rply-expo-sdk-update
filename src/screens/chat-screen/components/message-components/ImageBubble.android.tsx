import React from 'react';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';
import { tailwind } from '@/theme';
import { useImageDimensions } from '@/hooks/useImageDimensions';
import type { ImageCellProps, ImageContainerProps } from '@/hooks/useImageDimensions';

export const ImageBubbleContainer = (props: ImageContainerProps) => {
  const { imageSrc, imageUrls, maxWidth = 300, maxHeight = 360 } = props;
  const imageStyle = useImageDimensions(imageSrc, maxWidth, maxHeight);
  const galleryUrls = imageUrls?.length
    ? [imageSrc, ...imageUrls.filter(url => url !== imageSrc)]
    : [imageSrc];

  return (
    <Galeria urls={galleryUrls}>
      <Galeria.Image>
        <Image
          source={{ uri: imageSrc }}
          contentFit="contain"
          style={[tailwind.style('bg-gray-100 overflow-hidden'), imageStyle]}
        />
      </Galeria.Image>
    </Galeria>
  );
};

export const ImageBubble = (props: ImageCellProps) => {
  const { imageSrc, imageUrls } = props;

  return (
    <React.Fragment>
      <ImageBubbleContainer {...{ imageSrc, imageUrls }} />
    </React.Fragment>
  );
};
