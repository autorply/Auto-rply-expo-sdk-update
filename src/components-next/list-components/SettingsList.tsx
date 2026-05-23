import React from 'react';
import { I18nManager, Platform, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { CaretRight } from '@/svg-icons';
import { tailwind } from '@/theme';
import { GenericListType } from '@/types';
import { Icon } from '@/components-next/common/icon';

type GenericListProps = {
  sectionTitle?: string;
  list: GenericListType[];
};

type ListItemProps = {
  listItem: GenericListType;
  index: number;
  isLastItem: boolean;
};

const ListItem = (props: ListItemProps) => {
  const { listItem, index, isLastItem } = props;
  const isRTL = I18nManager.isRTL;

  return (
    <Pressable
      onPress={() => listItem.onPressListItem && listItem.onPressListItem()}
      key={index}
      style={({ pressed }) => [
        tailwind.style(
          pressed ? 'bg-gray-100' : '',
          index === 0 ? 'rounded-t-[13px]' : '',
          isLastItem ? 'rounded-b-[13px]' : '',
        ),
      ]}
    >
      <Animated.View
        style={tailwind.style(
          'flex items-center pl-3',
          isRTL ? 'flex-row-reverse pr-3 pl-0' : 'flex-row',
        )}
      >
        {listItem.icon ? (
          <Animated.View>
            <Icon icon={listItem.icon} size={24} />
          </Animated.View>
        ) : null}
        <Animated.View
          style={tailwind.style(
            'flex-1 items-center justify-between py-[11px]',
            isRTL ? 'flex-row-reverse' : 'flex-row',
            listItem.icon ? (isRTL ? 'mr-3' : 'ml-3') : '',
            !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
          )}
        >
          <Animated.View style={tailwind.style('flex-1')}>
            <Animated.Text
              style={tailwind.style(
                'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
                isRTL ? 'text-right' : 'text-left',
              )}
            >
              {listItem.title}
            </Animated.Text>
          </Animated.View>
          <Animated.View
            style={tailwind.style(
              'flex items-center pr-3 pl-2 max-w-[55%]',
              isRTL ? 'flex-row-reverse pr-0 pl-3' : 'flex-row',
            )}
          >
            <Animated.Text
              numberOfLines={1}
              style={tailwind.style(
                'text-base font-inter-normal-20 leading-[22px] tracking-[0.16px] flex-shrink',
                listItem.subtitleType === 'light' ? 'text-gray-900' : 'text-gray-950',
                isRTL ? 'text-left' : 'text-right',
              )}
            >
              {listItem.subtitle}
            </Animated.Text>
            {listItem.hasChevron ? (
              <Animated.View style={isRTL ? ({ transform: [{ scaleX: -1 }] } as const) : undefined}>
                <Icon icon={<CaretRight />} size={20} />
              </Animated.View>
            ) : null}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const SettingsList = (props: GenericListProps) => {
  const { list, sectionTitle } = props;

  return (
    <Animated.View>
      {sectionTitle ? (
        <Animated.View style={tailwind.style('pl-4 pb-3')}>
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-medium-24 leading-[16px] tracking-[0.32px] text-gray-700',
            )}
          >
            {sectionTitle}
          </Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View style={[tailwind.style('rounded-[13px] mx-4 bg-white'), styles.listShadow]}>
        {list.map(
          (listItem, index) =>
            !listItem.disabled && (
              <ListItem
                key={index}
                {...{ listItem, index }}
                isLastItem={index === list.length - 1}
              />
            ),
        )}
      </Animated.View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
