import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import camelCase from 'camelcase';

import { TAB_BAR_HEIGHT } from '@/constants';
import {
  CallIcon,
  EmailIcon,
  LocationIcon,
  CompanyIcon,
  MessengerFilledIcon,
  XFilledIcon,
  TelegramFilledIcon,
  InstagramFilledIcon,
  GithubIcon,
  LinkedinIcon,
} from '@/svg-icons';
import { tailwind } from '@/theme';
import { AttributeListType, CustomAttribute, GenericListType } from '@/types';

import {
  ContactDetailsScreenHeader,
  ContactBasicActions,
  ContactMetaInformation,
  ContactLabelActions,
} from './components';
import { AttributeList } from '@/components-next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { contactLabelActions } from '@/store/contact/contactLabelActions';
import { getContactCustomAttributes } from '@/store/custom-attribute/customAttributeSlice';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectContactLabelsByContactId } from '@/store/contact/contactLabelSlice';
import i18n from '@/i18n';

type ContactDetailsScreenProps = NativeStackScreenProps<
  TabBarExcludedScreenParamList,
  'ContactDetails'
>;

const allSocialMediaProfiles: GenericListType[] = [
  {
    icon: <MessengerFilledIcon />,
    subtitle: 'CONTACT_DETAILS.FACEBOOK',
    title: 'CONTACT_DETAILS.FACEBOOK',
    subtitleType: 'dark',
    key: 'facebook',
    link: 'https://fb.com/',
  },
  {
    icon: <XFilledIcon />,
    subtitle: 'CONTACT_DETAILS.TWITTER',
    title: 'CONTACT_DETAILS.TWITTER',
    subtitleType: 'dark',
    key: 'twitter',
    link: 'https://x.com/',
  },
  {
    icon: <GithubIcon />,
    subtitle: 'CONTACT_DETAILS.GITHUB',
    title: 'CONTACT_DETAILS.GITHUB',
    subtitleType: 'dark',
    key: 'github',
    link: 'https://github.com/',
  },
  {
    icon: <LinkedinIcon />,
    subtitle: 'CONTACT_DETAILS.LINKEDIN',
    title: 'CONTACT_DETAILS.LINKEDIN',
    subtitleType: 'dark',
    key: 'linkedin',
    link: 'https://linkedin.com/',
  },
  {
    icon: <InstagramFilledIcon />,
    subtitle: 'CONTACT_DETAILS.INSTAGRAM',
    title: 'CONTACT_DETAILS.INSTAGRAM',
    subtitleType: 'dark',
    key: 'instagram',
    link: 'https://instagram/',
  },
  {
    icon: <TelegramFilledIcon />,
    subtitle: 'CONTACT_DETAILS.TELEGRAM',
    title: 'CONTACT_DETAILS.TELEGRAM',
    subtitleType: 'dark',
    key: 'telegram',
    link: 'https://t.me/',
  },
];

const processContactAttributes = (
  attributes: CustomAttribute[],
  customAttributes: Record<string, string>,
  filterCondition: (key: string, custom: Record<string, string>) => boolean,
) => {
  if (!attributes.length || !customAttributes) {
    return [];
  }

  return attributes.reduce<(CustomAttribute & { value: string })[]>((result, attribute) => {
    const { attributeKey } = attribute;
    const meetsCondition = filterCondition(camelCase(attributeKey), customAttributes);

    if (meetsCondition) {
      result.push({
        ...attribute,
        value: customAttributes[camelCase(attributeKey)] ?? '',
      });
    }

    return result;
  }, []);
};

const ContactDetailsScreen = (props: ContactDetailsScreenProps) => {
  const { conversationId, contactId: routeContactId } = props.route.params;
  const dispatch = useAppDispatch();

  const conversation = useAppSelector(state =>
    conversationId ? selectConversationById(state, conversationId) : null,
  );

  const contactIdFromConversation = conversation?.meta?.sender?.id;
  const contactId = routeContactId || contactIdFromConversation;

  const emailFromConversation = conversation?.meta?.sender?.email;
  const nameFromConversation = conversation?.meta?.sender?.name;
  const thumbnailFromConversation = conversation?.meta?.sender?.thumbnail;

  const contact = useAppSelector(state => (contactId ? selectContactById(state, contactId) : null));

  const {
    name: contactName,
    thumbnail: contactThumbnail,
    phoneNumber,
    email: contactEmail,
  } = contact || {};

  const email = emailFromConversation || contactEmail;
  const name = nameFromConversation || contactName;
  const thumbnail = thumbnailFromConversation || contactThumbnail;

  const {
    city,
    country,
    description,
    location = '',
    companyName = '',
    socialProfiles,
    twitterScreenName,
    telegramUsername,
  } = contact?.additionalAttributes || {};

  const contactCustomAttributes = useAppSelector(getContactCustomAttributes);

  const usedContactCustomAttributes = processContactAttributes(
    contactCustomAttributes,
    contact?.customAttributes || {},
    (key, custom) => key in custom,
  );

  const socialMediaProfiles = {
    twitter: twitterScreenName,
    telegram: telegramUsername,
    ...(socialProfiles || {}),
  };

  const hasContactCustomAttributes = usedContactCustomAttributes.length > 0;

  const contactLabels = useAppSelector(state =>
    contactId ? selectContactLabelsByContactId(contactId)(state) : [],
  );

  useEffect(() => {
    if (contactId) {
      dispatch(contactLabelActions.getContactLabels({ contactId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socialMediaDetails = allSocialMediaProfiles
    .filter(profile => socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles])
    .map(profile => ({
      ...profile,
      subtitle: `${profile.link}${socialMediaProfiles?.[profile.key as keyof typeof socialMediaProfiles]}`,
      title: i18n.t(profile.title as string),
      type: 'link',
    }));

  const fullLocation = location || [city, country].filter(Boolean).join(', ') || null;

  const userDetails: GenericListType[] = [
    {
      icon: <LocationIcon />,
      subtitle: fullLocation || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACT_DETAILS.LOCATION'),
      subtitleType: 'dark',
    },
    {
      icon: <CallIcon />,
      subtitle: phoneNumber || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACT_DETAILS.PHONE'),
      subtitleType: 'dark',
    },
    {
      icon: <EmailIcon />,
      subtitle: email || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACT_DETAILS.EMAIL'),
      subtitleType: 'dark',
    },
    {
      icon: <CompanyIcon />,
      subtitle: companyName || i18n.t('CONTACT_DETAILS.VALUE_UNAVAILABLE'),
      title: i18n.t('CONTACT_DETAILS.COMPANY'),
      subtitleType: 'dark',
    },
  ];

  const allDetails = [...userDetails, ...socialMediaDetails];

  return (
    <BottomSheetModalProvider>
      <View
        style={tailwind.style(
          `flex-1 bg-white pt-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`,
        )}>
        <ContactDetailsScreenHeader
          name={name || contactName || ''}
          thumbnail={thumbnail || contactThumbnail || ''}
          bio={description || ''}
        />
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}]`)}>
          {email || phoneNumber ? (
            <Animated.View style={tailwind.style('mt-[23px] px-4')}>
              <ContactBasicActions phoneNumber={phoneNumber || ''} email={email || ''} />
            </Animated.View>
          ) : null}
          <Animated.View style={tailwind.style('pt-10')}>
            <AttributeList list={allDetails as AttributeListType[]} />
          </Animated.View>
          {hasContactCustomAttributes && (
            <Animated.View style={tailwind.style('pt-10')}>
              <ContactMetaInformation attributes={usedContactCustomAttributes} />
            </Animated.View>
          )}
          {contactId ? (
            <Animated.View style={tailwind.style('pt-10')}>
              <ContactLabelActions labels={contactLabels} contactId={contactId} />
            </Animated.View>
          ) : null}
        </Animated.ScrollView>
      </View>
    </BottomSheetModalProvider>
  );
};

export default ContactDetailsScreen;
