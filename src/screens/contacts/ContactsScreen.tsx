import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { StackActions, useNavigation } from '@react-navigation/native';

import i18n from '@/i18n';
import { TAB_BAR_HEIGHT } from '@/constants';
import { EmptyStateIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Avatar } from '@/components-next/common/avatar';
import { Contact } from '@/types/Contact';
import { ContactService } from '@/store/contact/contactService';
import { useAppDispatch } from '@/hooks';
import { addContact, addContacts } from '@/store/contact/contactSlice';
import { formatRelativeTime, formatTimeToShortForm } from '@/utils/dateTimeUtils';

type ContactsMeta = {
  count: number;
  current_page: number;
};

const ContactsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const inFlightPageRef = useRef<number | null>(null);

  const getUpdatedContacts = useCallback(
    (previousContacts: Contact[], nextContacts: Contact[], isRefresh: boolean) => {
      if (isRefresh) {
        return nextContacts;
      }
      const uniqueContactMap = new Map<number, Contact>();
      [...previousContacts, ...nextContacts].forEach(contact => {
        uniqueContactMap.set(contact.id, contact);
      });
      return Array.from(uniqueContactMap.values());
    },
    [],
  );

  const fetchContacts = useCallback(
    async (page: number, isRefresh = false) => {
      if (inFlightPageRef.current === page) {
        return;
      }
      inFlightPageRef.current = page;
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page > 1) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setHasError(false);

      try {
        const response = await ContactService.getContacts({ page });
        const nextContacts = response.payload || [];
        const meta = response.meta as ContactsMeta;

        setContacts(prevContacts => {
          const updatedContacts = getUpdatedContacts(prevContacts, nextContacts, isRefresh);
          const totalCount = Number(meta?.count);
          const hasValidTotalCount = Number.isFinite(totalCount) && totalCount > 0;
          setHasMore(hasValidTotalCount ? updatedContacts.length < totalCount : nextContacts.length > 0);
          return updatedContacts;
        });

        dispatch(addContacts({ contacts: nextContacts }));
        const parsedCurrentPage = Number.parseInt(String(meta?.current_page ?? page), 10);
        setCurrentPage(Number.isFinite(parsedCurrentPage) && parsedCurrentPage > 0 ? parsedCurrentPage : page);
      } catch {
        setHasError(true);
      } finally {
        if (inFlightPageRef.current === page) {
          inFlightPageRef.current = null;
        }
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [dispatch, getUpdatedContacts],
  );

  useEffect(() => {
    fetchContacts(1);
  }, [fetchContacts]);

  const handleRefresh = useCallback(() => {
    fetchContacts(1, true);
  }, [fetchContacts]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isRefreshing || isLoadingMore || !hasMore) {
      return;
    }
    const nextPage = currentPage + 1;
    if (inFlightPageRef.current === nextPage) {
      return;
    }
    fetchContacts(nextPage);
  }, [currentPage, fetchContacts, hasMore, isLoading, isLoadingMore, isRefreshing]);

  const handlePressContact = useCallback(
    (contact: Contact) => {
      dispatch(addContact(contact));
      const pushToContactDetails = StackActions.push('ContactDetails', {
        contactId: contact.id,
      });
      navigation.dispatch(pushToContactDetails);
    },
    [dispatch, navigation],
  );

  const getLastActivity = useCallback((lastActivityAt: number | null) => {
    if (!lastActivityAt) {
      return null;
    }
    const relativeTime = formatRelativeTime(lastActivityAt);
    return formatTimeToShortForm(relativeTime);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => {
      const lastActivity = getLastActivity(item.lastActivityAt);
      return (
        <Pressable
          onPress={() => handlePressContact(item)}
          style={({ pressed }) => [
            tailwind.style('flex-row items-start px-4 py-3 border-b border-b-blackA-A3'),
            pressed ? tailwind.style('bg-gray-50') : null,
          ]}>
          <Avatar
            src={item.thumbnail ? { uri: item.thumbnail } : undefined}
            name={item.name || ''}
            size="md"
          />
          <Animated.View style={tailwind.style('flex-1 ml-3')}>
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style('text-sm font-inter-medium-24 leading-[20px] text-gray-950')}>
              {item.name || '-'}
            </Animated.Text>
            {item.phoneNumber ? (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-sm font-inter-420-20 leading-[19px] text-gray-800 pt-0.5',
                )}>
                {item.phoneNumber}
              </Animated.Text>
            ) : null}
            {item.email ? (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-sm font-inter-420-20 leading-[19px] text-gray-700 pt-0.5',
                )}>
                {item.email}
              </Animated.Text>
            ) : null}
            {lastActivity ? (
              <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                  'text-xs font-inter-420-20 leading-[16px] text-gray-600 pt-1',
                )}>
                {lastActivity}
              </Animated.Text>
            ) : null}
          </Animated.View>
        </Pressable>
      );
    },
    [getLastActivity, handlePressContact],
  );

  const ListFooterComponent = useMemo(() => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <Animated.View style={tailwind.style('items-center justify-center py-5')}>
        <ActivityIndicator size="small" />
      </Animated.View>
    );
  }, [isLoadingMore]);

  const ContentHeader = (
    <Animated.View style={tailwind.style('px-4 pt-3 pb-2')}>
      <Animated.Text style={tailwind.style('text-xl font-inter-semibold-24 text-gray-950')}>
        {i18n.t('CONTACTS.TITLE')}
      </Animated.Text>
    </Animated.View>
  );

  if (isLoading && contacts.length === 0) {
    return (
      <Animated.View
        style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
        <ActivityIndicator />
      </Animated.View>
    );
  }

  if (hasError && contacts.length === 0) {
    return (
      <Animated.ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={tailwind.style(
          'flex-1 items-center justify-center px-6',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
        <EmptyStateIcon />
        <Animated.Text style={tailwind.style('pt-6 text-md text-center text-gray-800')}>
          {i18n.t('CONTACTS.ERROR')}
        </Animated.Text>
        <Pressable
          onPress={handleRefresh}
          style={tailwind.style('mt-4 px-4 py-2 rounded-md bg-gray-900')}>
          <Animated.Text style={tailwind.style('text-sm text-white font-inter-medium-24')}>
            {i18n.t('CONTACTS.REFRESH')}
          </Animated.Text>
        </Pressable>
      </Animated.ScrollView>
    );
  }

  if (contacts.length === 0) {
    return (
      <Animated.ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={tailwind.style(
          'flex-1 items-center justify-center px-6',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
        <EmptyStateIcon />
        <Animated.Text style={tailwind.style('pt-6 text-md text-center text-gray-800')}>
          {i18n.t('CONTACTS.EMPTY')}
        </Animated.Text>
      </Animated.ScrollView>
    );
  }

  return (
    <FlashList
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      data={contacts}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      estimatedItemSize={84}
      ListHeaderComponent={ContentHeader}
      ListFooterComponent={ListFooterComponent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ContactsRootScreen = () => {
  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle={'dark-content'}
      />
      <ContactsScreen />
    </SafeAreaView>
  );
};

export default ContactsRootScreen;
