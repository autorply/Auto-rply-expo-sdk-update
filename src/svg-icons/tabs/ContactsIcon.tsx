import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const ContactsIconOutline = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Path
        d="M24 14.75C26.8995 14.75 29.25 12.3995 29.25 9.5C29.25 6.6005 26.8995 4.25 24 4.25C21.1005 4.25 18.75 6.6005 18.75 9.5C18.75 12.3995 21.1005 14.75 24 14.75Z"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 23.5C16.3488 20.5425 19.9558 18.5 24 18.5C28.0442 18.5 31.6512 20.5425 33.5 23.5"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ContactsIconFilled = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 4.25C21.1005 4.25 18.75 6.6005 18.75 9.5C18.75 12.3995 21.1005 14.75 24 14.75C26.8995 14.75 29.25 12.3995 29.25 9.5C29.25 6.6005 26.8995 4.25 24 4.25ZM24 18.5C19.9558 18.5 16.3488 20.5425 14.5 23.5H33.5C31.6512 20.5425 28.0442 18.5 24 18.5Z"
        fill="#171717"
      />
    </Svg>
  );
};
