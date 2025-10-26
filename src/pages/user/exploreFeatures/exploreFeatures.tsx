import React, { useEffect, useRef, useState } from "react";
import { Body, Button, Typography, WebFadeIn } from "src/components/common";
import {
  View,
  useWindowDimensions,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { fireMediumHapticFeedback } from "src/utils/haptics";

import { ScrollView } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from "react-redux";
import {
  createExploreFeature,
  exploreFeaturesSelector,
  getExploreFeatures,
} from "src/redux/domain/features/exploreFeature/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { Loading } from "src/components/common/loading/loading";
import { PngIcon } from "src/components/common/pngIcon/pngIcon";
import { SafeArea } from "src/components/common/safeArea/safeArea";
import { loadSubscriptionPackages } from "src/features/subscriptions/pages/subscription/utils";
import { subscriptionPackages } from "src/features/subscriptions/pages/subscription/redux/slice";
import { useIsSubscribed } from "src/features/subscriptions/hooks/useIsSubscribed";
import { platform } from "os";
import { getClientEnvironments } from "src/redux/domain/features/clientEnvironment/collection-slice";
import Animated, { 
  FadeIn,
  SlideInRight,
  withSpring
} from 'react-native-reanimated';
import { TouchableOpacity } from "react-native";
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

/* Images */
/* --- Images */

type RootStackParamList = {
  Welcome: undefined;
  Subscription: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreFeaturesPage = ({}: {}) => {
  const layoutStyles = useLayoutStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [active, setActive] = useState(0);
  // const sliderRef = useRef<ICarouselInstance>(null);
  const sliderRef = useRef<ScrollView>(null);
  const absoluteProgressCountRef = useRef(0);
  const dotsStyle = {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginLeft: 3,
    marginRight: 3,
  };
  const defaultImageStyles = { height: 156, width: 156 };
  const defaultTitleStyles = {
    fontSize: 24,
    lineHeight: 29,
    color: "#518EF8",
    marginTop: 20,
    marginBottom: 25,
    textAlign: "center",
  };
  const defaultTextStyles = {
    fontSize: 18,
    lineHeight: 22,
    color: "#505050",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    width: "90%",
  };
  const isSubscribed = useIsSubscribed();
  // console.log("isSubscribed", isSubscribed);
  const endScreenNavigate = isSubscribed === true ? "Welcome" : "Subscription";
  const dispatch = useDispatch();
  const { userId } = useUserInfo();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { overrideRedirect }: any = route.params || { overrideRedirect: false };
  const [hasRedirected, setHasRedirected] = useState(overrideRedirect);
  const hasExploredFeatures = useSelector(exploreFeaturesSelector(userId));
  const onButtonNavigate = () => {
    fireMediumHapticFeedback();
    // const isActive = sliderRef.current?.getCurrentIndex();
    if (active === featureData.length - 1) {
      dispatch(createExploreFeature({ User: userId, HasDismissed: 1 }));
      navigation.navigate(endScreenNavigate);
      // setTimeout(() => sliderRef.current?.scrollTo({ index: 0 }), 1000);
    } else {
      setActive(active);
      sliderRef.current?.scrollTo({
        x: active * windowWidth + windowWidth,
        animated: true,
      });
    }
  };
  const featureData = [
    {
      key: "intro",
      img: "onboarding0",
      imgStyle: {
        width: 400,
        height: (windowWidth - 40) * 0.349,
      },
      title: "Hey there...",
      text: "Let's build the best version of you\n\n(the easy way) 🔥 🚀",
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20
          }}>
            <Typography text="💪" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="→" style={{ color: '#518EF8', fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="✨" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
          </View>
        </Animated.View>
      )
    },
    {
      key: "problem",
      img: "struggle",
      title: "Why is self-improvement so hard?",
      text: "Too many apps, not enough results\n\nStaying consistent feels impossible\n\nLife gets in the way",
      imgStyle: {
        width: 400,
        height: (windowWidth - 40) * 0.349,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20
          }}>
            <Typography text="😫" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="📱" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="😤" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
          </View>
        </Animated.View>
      )
    },
    {
      key: "solution",
      img: "lifeset-icon",
      title: "Meet LifeSet\n\nThe all-in-one wellbeing app",
      text: "Everything you need, in one place\n\nSimple habits, real results\n\nBuild a healthy lifestyle—the easy way",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20
          }}>
            <Typography text="✨" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="🎯" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
            <Typography text="🌟" style={{ fontSize: 32, lineHeight: 40, height: 40 }} />
          </View>
        </Animated.View>
      )
    },
    {
      key: "habits",
      img: "onboarding1",
      title: "Small habits = BIG changes",
      text: "Track your habits\n\nBuild your habit streak \n\nStay accountable",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="1 → 7 → 30 → ∞" style={{ fontSize: 32, color: '#518EF8', lineHeight: 40, height: 40 }} />
        </Animated.View>
      )
    },
    {
      key: "streak",
      img: "onboarding2",
      title: "Streak Leaderboard",
      text: "Join habit challenges\n\nCompete with others\n\nGrow together",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="🏆" style={{ fontSize: 48, lineHeight: 60, height: 50 }} />
        </Animated.View>
      )
    },
    {
     key: "dietary",
      img: "dietary",
      title: "Recipe Finder",
      text: "Fuel your body, the easy way\n\nGet simple, healthy meal ideas—no stress, no guesswork",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="🥗" style={{ fontSize: 48, lineHeight: 60, height: 60 }} />
        </Animated.View>
      )
    },
    {
      key: "diary",
      img: "diary",
      title: "Your Mindset Journal",
      text: "Your mind is your superpower\n\nReflect & grow.",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="📝" style={{ fontSize: 48, lineHeight: 60, height: 50 }} />
        </Animated.View>
      )
    },
    {
      key: "meditation",
      img: "onboarding4",
      title: "Meditation",
      text: "Breathe\n\nFocus\n\nUnlock mental clarity",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="🧘" style={{ fontSize: 48, lineHeight: 60, height: 50 }} />
        </Animated.View>
      )
    },
    {
      key: "weights",
      img: "weights",
      title: "Workouts",
      text: "Train smarter, not harder.\n\nWorkouts that fit your lifestyle",
      imgStyle: {
        height: 133,
        width: 133,
      },
      interactive: (
        <Animated.View
          entering={SlideInRight.duration(800)}
          style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 30,
            marginBottom: 10,
            height: 100,
            justifyContent: 'center'
          }}
        >
          <Typography text="💪" style={{ fontSize: 48, lineHeight: 60, height: 60 }} />
        </Animated.View>
      )
    },
  ];

  useEffect(() => {
    dispatch(getClientEnvironments({}));
  }, [dispatch]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (!hasExploredFeatures) {
      dispatch(getExploreFeatures({ user: userId }));
      return;
    }
    // console.log("here:", isSubscribed === true, hasExploredFeatures)
    if (
      isSubscribed === true &&
      hasExploredFeatures.length > 0 &&
      hasExploredFeatures[0]?.HasDismissed === 1 &&
      !overrideRedirect &&
      !hasRedirected
    ) {
      setHasRedirected(true);
      navigation.replace(endScreenNavigate);
    }
  }, [
    dispatch,
    endScreenNavigate,
    hasExploredFeatures,
    hasRedirected,
    isSubscribed,
    navigation,
    overrideRedirect,
    userId,
  ]);

  // pre fetch subs for first time users so that they load smoothly at the end of the carousel
  const packages = useSelector(subscriptionPackages);
  useEffect(() => {
    if (
      userId &&
      (!packages || packages.length === 0) &&
      Platform.OS !== "web"
    ) {
      loadSubscriptionPackages(userId); //native only
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isSubscribed === undefined) {
    return null; //we don't know subs state yet
  }
  if (
    isSubscribed === true &&
    !overrideRedirect &&
    hasExploredFeatures &&
    hasExploredFeatures.length > 0 &&
    hasExploredFeatures[0]?.HasDismissed === 1
  ) {
    return null; //wait for redirect without rendering
  }

  // if (
  //   !hasExploredFeatures
  //   //trying to avoid poor load where explore carousel seen briefly
  //   // hasExploredFeatures.length === 0 ||
  //   // hasExploredFeatures[0].HasDismissed
  // ) {
  //   return <Loading />;
  // }

  return (
    <SafeArea>
      <WebFadeIn background={false}>
        <View
          style={{
            width: "100%",
          }}
          testID="explore-features"
        >
          <>
            <ScrollView
              ref={sliderRef}
              style={{ width: windowWidth }}
              horizontal={true}
              decelerationRate={0.9}
              snapToInterval={windowWidth}
              snapToAlignment={"center"}
              showsHorizontalScrollIndicator={false}
              disableIntervalMomentum={true}
              pagingEnabled
              scrollEventThrottle={100}
              bounces={false}
              onScrollBeginDrag={() => {
                fireMediumHapticFeedback();
              }}
              onScroll={(_event: NativeSyntheticEvent<NativeScrollEvent>) => {
                const offset = _event.nativeEvent.contentOffset.x;
                const index = Math.round(offset / windowWidth);
                setActive(index);
              }}
            >
              {featureData?.map((item: any, i: number) => {
                return (
                  <Animated.View
                    entering={FadeIn.duration(600).springify()}
                    key={item.key}
                    style={{
                      maxWidth: windowWidth,
                      width: windowWidth,
                      paddingBottom: 205,
                      height: windowHeight - 205,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      {item.img && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: "15%",
                          }}
                        >
                          <PngIcon
                            iconName={item.img}
                            height={item.imgStyle?.height}
                            width={item.imgStyle?.width}
                          />
                        </View>
                      )}

                      {item.title && (
                        <Typography
                          text={item.title}
                          style={[
                            item?.titleStyle
                              ? item?.titleStyle
                              : defaultTitleStyles,
                          ]}
                        />
                      )}

                      {item.text && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            text={item.text}
                            style={[
                              item?.textStyle
                                ? item?.textStyle
                                : defaultTextStyles,
                            ]}
                          />
                        </View>
                      )}
                    </View>

                    <View style={{ 
                      flex: 1,
                      justifyContent: 'center',
                      paddingBottom: 40
                    }}>
                      {item.interactive && item.interactive}
                    </View>
                  </Animated.View>
                );
              })}
            </ScrollView>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                height: 6,
                backgroundColor: '#D9D9D9',
                borderRadius: 3,
                position: 'absolute',
                bottom: Platform.OS === 'android' ? 30 : 15,
                alignSelf: 'center',
                overflow: 'hidden'
              }}
            >
              <Animated.View
                style={{
                  width: `${((active + 1) / featureData.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#518EF8',
                  borderRadius: 3,
                }}
              />
            </View>
          </>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            position: "absolute",
            bottom:
              Platform.OS === "web" ? 20 : Platform.OS === "android" ? 20 : 0,
          }}
        >
          <Button
            onPress={() => onButtonNavigate()}
            title={active === featureData.length - 1 ? "Let's Go!" : "Next"}
            testID={`explore-features-slide-${active}`}
            style={{
              width: '80%',
              backgroundColor: active === featureData.length - 1 ? '#4CAF50' : '#518EF8'
            }}
          />
        </View>

        <TouchableOpacity
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 50 : 20,
            right: 20,
            zIndex: 1,
          }}
          onPress={() => {
            fireMediumHapticFeedback();
            dispatch(createExploreFeature({ User: userId, HasDismissed: 1 }));
            navigation.navigate(endScreenNavigate);
          }}
        >
          <Typography
            text="Skip"
            style={{
              color: '#518EF8',
              fontSize: 16,
            }}
          />
        </TouchableOpacity>
      </WebFadeIn>
    </SafeArea>
  );
};

export default ExploreFeaturesPage;
