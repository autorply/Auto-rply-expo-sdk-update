import React from 'react';
import { Alert, Linking, Platform, Pressable, Text } from 'react-native';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/hooks';
import { updateAttachments } from '@/store/conversation/sendMessageSlice';
import { useRefsContext } from '@/context';
import { AttachFileIcon, CameraIcon, MacrosIcon, PhotosIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '@/components-next/common';
import { MAXIMUM_FILE_UPLOAD_SIZE } from '@/constants';
import i18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';
import { findFileSize } from '@/utils/fileUtils';
import type { AppDispatch } from '@/store';

export const handleOpenPhotosLibrary = async (dispatch: AppDispatch) => {
  const pickedAssets = await launchImageLibrary({
    quality: 1,
    selectionLimit: 4,
    mediaType: 'mixed',
    presentationStyle: 'formSheet',
  });
  if (pickedAssets.didCancel) {
  } else if (pickedAssets.errorCode) {
    Alert.alert(
      i18n.t('COMMON.PERMISSION_DENIED'),
      pickedAssets.errorMessage || i18n.t('CONVERSATION.PERMISSION.PHOTO_LIBRARY_DENIED'),
      [
        {
          text: i18n.t('COMMON.CANCEL'),
          style: 'cancel',
        },
        {
          text: i18n.t('COMMON.OPEN_SETTINGS'),
          onPress: () => {
            // Open app settings
            Linking.openSettings();
          },
        },
      ],
      { cancelable: false },
    );
  } else {
    if (pickedAssets.assets && pickedAssets.assets?.length > 0) {
      validateFileAndSetAttachments(dispatch, pickedAssets.assets[0]);
    }
  }
};

const handleLaunchCamera = async (dispatch: AppDispatch) => {
  request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA).then(
    async result => {
      if (RESULTS.BLOCKED === result) {
        Alert.alert(
          i18n.t('COMMON.PERMISSION_DENIED'),
          i18n.t('CONVERSATION.PERMISSION.CAMERA_DENIED'),
          [
            {
              text: i18n.t('COMMON.CANCEL'),
              style: 'cancel',
            },
            {
              text: i18n.t('COMMON.OPEN_SETTINGS'),
              onPress: () => {
                // Open app settings
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
      }
      if (RESULTS.GRANTED === result) {
        const imageResult = await launchCamera({
          presentationStyle: 'formSheet',
          mediaType: 'mixed',
        });
        if (imageResult.didCancel) {
        } else if (imageResult.errorCode) {
        } else {
          if (imageResult.assets && imageResult.assets?.length > 0) {
            validateFileAndSetAttachments(dispatch, imageResult.assets[0]);
          }
        }
      }
    },
  );
};

/**
 * Doing this so that the our Store Object Attachments is of single type - Asset from Image Picker Library
 * The function `mapObject` takes an object of type `DocumentPickerResponse` and returns an array of
 * `Asset` objects with properties `fileName`, `fileSize`, `type`, and `uri`.
 * @param {DocumentPickerResponse} originalObject - The originalObject parameter is of type
 * DocumentPickerResponse.
 * @returns The function `mapObject` is returning an array of `Asset` objects.
 */
const mapObject = (originalObject: DocumentPickerResponse): Asset[] => {
  return [
    {
      fileName: originalObject.name || '',
      fileSize: originalObject.size || 0,
      type: originalObject.type || '',
      uri: originalObject.uri || '',
    },
  ];
};

const handleAttachFile = async (dispatch: AppDispatch) => {
  try {
    const result = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.allFiles,
        DocumentPicker.types.images,
        DocumentPicker.types.plainText,
        DocumentPicker.types.audio,
        DocumentPicker.types.pdf,
        DocumentPicker.types.zip,
        DocumentPicker.types.csv,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
        DocumentPicker.types.ppt,
        DocumentPicker.types.pptx,
        DocumentPicker.types.xls,
        DocumentPicker.types.xlsx,
      ], // You can specify the file types you want to allow
      presentationStyle: 'formSheet',
    });
    // TODO: Support multiple files
    const file = mapObject(result[0])[0];
    validateFileAndSetAttachments(dispatch, file);
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker
    } else {
      throw err;
    }
  }
};

const ADD_MENU_OPTIONS = [
  {
    key: 'photos',
    icon: <PhotosIcon />,
    title: i18n.t('CONVERSATION.COMMAND_OPTIONS.PHOTOS'),
    handlePress: handleOpenPhotosLibrary,
  },
  {
    key: 'camera',
    icon: <CameraIcon />,
    title: i18n.t('CONVERSATION.COMMAND_OPTIONS.CAMERA'),
    handlePress: handleLaunchCamera,
  },
  {
    key: 'attach_file',
    icon: <AttachFileIcon />,
    title: i18n.t('CONVERSATION.COMMAND_OPTIONS.ATTACH_FILE'),
    handlePress: handleAttachFile,
  },
  {
    key: 'macros',
    icon: <MacrosIcon />,
    title: i18n.t('CONVERSATION.COMMAND_OPTIONS.MACROS'),
    handlePress: () => {},
  },
];

export const validateFileAndSetAttachments = async (dispatch: AppDispatch, attachment: Asset) => {
  const fileSize = attachment.fileSize ?? 0;
  if (findFileSize(fileSize) <= MAXIMUM_FILE_UPLOAD_SIZE) {
    dispatch(updateAttachments([attachment]));
  } else {
    showToast({ message: i18n.t('CONVERSATION.FILE_SIZE_LIMIT') });
  }
};

type MenuOptionProps = {
  index: number;
  menuOption: (typeof ADD_MENU_OPTIONS)[0];
};

const MenuOption = (props: MenuOptionProps) => {
  const { index, menuOption } = props;
  const dispatch = useAppDispatch();
  const { macrosListSheetRef } = useRefsContext();

  const { animatedStyle, handlers } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    menuOption?.handlePress(dispatch);
    if (menuOption.key === 'macros') {
      macrosListSheetRef.current?.present();
    }
  };

  return (
    <Animated.View style={[tailwind.style('mb-3'), animatedStyle]}>
      <Pressable onPress={handlePress} {...handlers}>
        <Animated.View key={index} style={[tailwind.style('flex-row items-center justify-start')]}>
          <Animated.View style={tailwind.style('p-2')}>
            <Icon icon={menuOption.icon} size={24} />
          </Animated.View>
          <Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[18px] tracking-[0.24px] text-gray-950 pl-5',
            )}>
            {menuOption.title}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const CommandOptionsMenu = () => {
  const { bottom } = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const containerHeight = isAndroid
    ? 210 + (bottom === 0 ? 16 : bottom)
    : 175 + (bottom === 0 ? 16 : bottom);
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(38).stiffness(240)}
      exiting={SlideOutDown.springify().damping(38).stiffness(240)}
      style={tailwind.style('mx-1 pt-2 items-start', `h-[${containerHeight}px]`)}>
      {ADD_MENU_OPTIONS.map((menuOption, index) => {
        return <MenuOption key={menuOption.title} {...{ menuOption, index }} />;
      })}
    </Animated.View>
  );
};
