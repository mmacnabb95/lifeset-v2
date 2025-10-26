import _ from "lodash";
import React, { useEffect, useRef, useState, ReactNode } from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { initialLoadSize, rootLanguage } from "src/utils";
import { useTranslation } from "src/translations/useTranslation";

import {
  Body,
  FadeIn,
  ResourceEditNavOption,
  ResourceViewNavOption,
  ResourceHorizontalItem,
  ResourceCheckboxNav,
  Typography,
  WorkoutDayEditNav,
  WorkoutDayExerciseEditNav,
  WorkoutExerciseSetEditNav,
  WorkoutEditNav,
} from "src/components/common";
import { TypographyTypes } from "../typography";
import commonConstants from "src/themes/constants";
import { listItemDataMapping } from "src/utils/lisItem.config";
import { WorkoutAssign } from "../workoutAssign";
import UserWorkoutEdit from "../userWorkoutEdit";
import { StreakleaderboardItem } from "../streakLeaderboardItem";
import { ResourceEditNavOptionLarge } from "../resourceEditNavOptionLarge";

const useLayoutStyles =
  require("../../../themes/layout/styles/styles").default();
const useFormStyles = require("../../../themes/form/styles/styles").default();

type EditNavItem =
  | "ResourceHorizontalItem"
  | "ResourceCheckboxNav"
  | "WorkoutDayEditNav"
  | "WorkoutDayExerciseEditNav"
  | "WorkoutExerciseSetEditNav"
  | "WorkoutEditNav"
  | "UserView"
  | "WorkoutAssign"
  | "UserWorkoutEdit"
  | "StreakLeaderboardItem";
type ViewNavItem = "ResourceEditNavOptionLarge";
type Style = Record<string, string | number>;

export const ListBody = ({
  navigation,
  route,
  listItems,
  loading,
  style,
  basicParams,
  loadMore,
  doLoad,
  TextSearch,
  orderBy,
  iconPlaceHolder,
  destination,
  mode = "edit",
  paramKey,
  showIcon = true,
  getIconPath,
  languageSorting = true,
  editNavItem,
  viewNavItem,
  handleDrawerOpen,
  showSubText = true,
  contentStyle,
}: {
  navigation: any;
  route: any;
  listItems?: any[];
  loading: boolean;
  style: any;
  basicParams?: any;
  loadMore: () => void;
  doLoad?: (p: any) => void;
  TextSearch?: ({
    // eslint-disable-next-line no-shadow
    navigation,
    disabled,
    loadAdminViewUsers,
    placeholder,
    // eslint-disable-next-line no-shadow
    loadSize,
    // eslint-disable-next-line no-shadow
    style,
  }: {
    navigation: any;
    disabled?: boolean | undefined;
    loadAdminViewUsers: (a: any) => void;
    placeholder?: string | undefined;
    loadSize?: number | undefined;
    style?: any;
    // eslint-disable-next-line no-undef
  }) => JSX.Element;
  orderBy?: string[];
  iconPlaceHolder?: string;
  destination: string;
  mode?: "edit" | "view";
  paramKey: string;
  showIcon?: boolean;
  getIconPath?: (listItem: any) => string;
  languageSorting?: boolean;
  editNavItem?: EditNavItem;
  viewNavItem?: ViewNavItem;
  handleDrawerOpen?: () => void;
  showSubText?: boolean;
  contentStyle?: Style | Style[];
}) => {
  const layoutStyles = useLayoutStyles;
  const formStyles = useFormStyles;

  const [loadingDelay, setLoadingDelay] = useState(false);
  const [canStopLoading, setCanStopLoading] = useState(false);
  const { width } = useWindowDimensions();
  const { text } = useTranslation();
  const scrollableRef = useRef<KeyboardAwareScrollView>(null);
  const lastSearchRef = useRef<any | undefined>();

  useEffect(() => {
    if (loading && (!listItems || listItems?.length === 0)) {
      setLoadingDelay(true);
      setTimeout(() => {
        //todo: check loading here and if still loading do recursive set delay
        // setLoadingDelay(false);
        setCanStopLoading(true);
      }, 800);
    }

    if (!loading && canStopLoading) {
      setLoadingDelay(false);
      setCanStopLoading(false);
    }
  }, [loading, listItems, canStopLoading]);

  //TODO: factor out to utils
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: {
    layoutMeasurement: { height: number };
    contentOffset: { y: number };
    contentSize: { height: number };
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const getText = (item: any) => {
    //new - uses config

    const key = editNavItem || destination;

    if (!listItemDataMapping[key]?.text) {
      console.warn("add", editNavItem, "to listItem.config");
      return "";
    }

    if (key) {
      const _originalText = `${item[listItemDataMapping[key].text]}`;
      let _text = _originalText?.substring(0, 200);
      if (_originalText?.length > 200) {
        _text += "...";
      }
      return _text;
    }

    return "";

    //old - deprecate when safe
    // const _originalText = `${
    //   user.Title || user.Name || user.Text || user.Question
    // }${user?.email ? "\r\n" + user.email : ""}`;
    // let _text = _originalText?.substring(0, 200);
    // if (_originalText?.length > 200) {
    //   _text += "...";
    // }
    // return _text;
  };

  // eslint-disable-next-line no-undef
  const getSubText = (item: any): string | undefined => {
    if (editNavItem && !listItemDataMapping[editNavItem]?.subText) {
      return "";
    }

    const key = editNavItem || destination;

    if (!listItemDataMapping[key]?.subText) {
      return "";
    }

    //@ts-ignore
    if (!item[listItemDataMapping[key]?.subText]) {
      return "";
    }

    if (key) {
      //@ts-ignore
      const _originalText = `${item[listItemDataMapping[key]?.subText]}`;
      let subTextTitle = listItemDataMapping[key].subTextTitle || "";
      let _text = subTextTitle + _originalText?.substring(0, 200);
      if (_text.length > 200) {
        _text += "...";
      }

      return _text?.replace(/\n/g, " ");

      // return (
      //   <>
      //     <Typography
      //       type={TypographyTypes.Body1}
      //       numberOfLines={1}
      //       ellipsizeMode="tail"
      //       text={_text?.replace(/\n/g, " ")}
      //     />
      //   </>
      // );
    }
  };

  const getLabel = (item: any): string | undefined => {
    if (editNavItem && !listItemDataMapping[editNavItem]?.label) {
      return "";
    }

    const key = editNavItem || destination;

    if (!listItemDataMapping[key]?.label) {
      return "";
    }

    if (key) {
      //@ts-ignore
      const _originalText = `${item[listItemDataMapping[key].label]}`;
      let _text = _originalText?.substring(0, 200);
      if (_originalText?.length > 200) {
        _text += "...";
      }

      return _text?.replace(/\n/g, " ");

      // return (
      //   <>
      //     <Typography
      //       type={TypographyTypes.Body1}
      //       numberOfLines={1}
      //       ellipsizeMode="tail"
      //       text={_text?.replace(/\n/g, " ")}
      //     />
      //   </>
      // );
    }
  };

  const Spinner: React.FunctionComponent = () => {
    return (
      <>
        {loadingDelay && (
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
            }}
          >
            <ActivityIndicator
              size="large"
              color={commonConstants.primaryColor}
              style={{ minHeight: 80 }}
            />
          </View>
        )}
      </>
    );
  };

  const renderListItem = (listItem: any) => {
    const props = {
      key: listItem.Id,
      text: getText(listItem),
      subText: getSubText(listItem),
      label: getLabel(listItem),
      navigation,
      destination,
      source: listItem,
      handleDrawerOpen,
      iconPath: getIconPath ? getIconPath(listItem) : undefined,
      iconPlaceHolder,
      params: {
        ...route.params,
        ...{ [paramKey]: listItem.Id },
      },
      showIcon,
      listItem,
    };

    if (mode === "edit") {
      switch (editNavItem) {
        case "ResourceCheckboxNav":
          return <ResourceCheckboxNav {...props} />;
        case "WorkoutDayEditNav":
          return <WorkoutDayEditNav {...props} />;
        case "WorkoutDayExerciseEditNav":
          return <WorkoutDayExerciseEditNav {...props} />;
        case "WorkoutExerciseSetEditNav":
          return <WorkoutExerciseSetEditNav {...props} />;
        case "WorkoutEditNav":
          return <WorkoutEditNav {...props} />;
        case "ResourceHorizontalItem":
          return <ResourceHorizontalItem {...props} />;
        case "WorkoutAssign":
          return <WorkoutAssign {...props} />;
        case "UserWorkoutEdit":
          return <UserWorkoutEdit {...props} />;
        case "StreakLeaderboardItem":
          return <StreakleaderboardItem {...props} />;
        default:
          return <ResourceEditNavOption {...props} />;
      }
    } else {
      if (viewNavItem === "ResourceEditNavOptionLarge") {
        return <ResourceEditNavOptionLarge {...props} />;
      }
    }

    if (
      paramKey === "publishedUserHabitPackId" ||
      paramKey === "allUserHabitPackId"
    ) {
      const _props = {
        ...props,
        ...{ params: { userHabitPackId: listItem.Id } },
      };
      return <ResourceEditNavOption {..._props} />;
    }

    return <ResourceEditNavOption {...props} />;
  };

  const filterItems = (_listItems: any[]) => {
    if (orderBy) {
      // TODO: this shouldn't be necessary as sorting now handled by search proc
      return orderBy.some((item) => _.keys(_listItems[0]).includes(item))
        ? _.orderBy(
            listItems,
            orderBy,
            orderBy.includes("desc") ? "desc" : "asc",
          )
            ?.filter((o) => {
              if (o.Language && languageSorting) {
                return o.Language === rootLanguage;
              }
              return true;
            })
            ?.map(renderListItem)
        : _.orderBy(_listItems, ["Id"], ["desc"])
            ?.filter((o) => {
              if (o.Language && languageSorting) {
                return o.Language === rootLanguage;
              }
              return true;
            })
            ?.map(renderListItem);
    } else {
      return _listItems
        ?.filter((o) => {
          if (o.Language && languageSorting) {
            return o.Language === rootLanguage;
          }
          return true;
        })
        ?.map(renderListItem);
    }
  };

  return (
    <>
      <View
        testID="navOptionsListOnly"
        style={[
          formStyles.form,
          layoutStyles.navOptionsListOnly,
          {
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        {TextSearch && doLoad && (
          <TextSearch
            navigation={navigation}
            loadAdminViewUsers={doLoad}
            loadSize={initialLoadSize}
            style={{
              container: {
                maxWidth: width > commonConstants.mobileBreak ? "49%" : "100%",
              },
            }}
          />
        )}
      </View>
      <Body
        style={style}
        contentStyle={contentStyle}
        keyboardAwareScrollViewProps={{
          ref: scrollableRef,
          onScroll: (a: any) => {
            if (isCloseToBottom(a.nativeEvent)) {
              if (
                !_.isEqual(
                  {
                    offset: listItems?.length!,
                    limit: basicParams?.limit,
                    filter: basicParams?.filter,
                  },
                  basicParams,
                )
              ) {
                loadMore();
              }
              lastSearchRef.current = basicParams;
            }
          },
        }}
      >
        <>
          <Spinner />
          {!loadingDelay && listItems && (
            <FadeIn
              style={{
                margin: 0,
              }}
            >
              {filterItems(listItems)}
            </FadeIn>
          )}
        </>
      </Body>
    </>
  );
};
