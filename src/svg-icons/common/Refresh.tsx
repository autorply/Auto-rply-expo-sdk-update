import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const RefreshIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 11.9999C20 16.4182 16.4183 19.9999 12 19.9999C8.30004 19.9999 5.18687 17.4888 4.26807 14.074M3.99999 7.99993C5.46556 5.60892 8.1034 3.99994 11.1177 3.99994C15.536 3.99994 19.1177 7.58167 19.1177 11.9999M4 4V8.70588H8.70588M20 20V15.2941H15.2941"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
