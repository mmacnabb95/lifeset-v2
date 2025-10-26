import { useEffect, useRef, useState } from "react";

/**
 * Generates the random string which could contain both letters and numbers.
 * The default length of output is 5.
 */
export const randomStr = (length: number = 5) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Initial load size for the list items
 */
export const initialLoadSize = 20;

/**
 * Default language constant - 1 => English
 */
export const rootLanguage = 1;

/**
 * Formatting a Number and a String in US Price Format
 */
export const formatMoney = (
  amount: number | string,
  decimals: number = 2,
): string =>
  Number((amount as number).toFixed(decimals)).toLocaleString("en-US");

export const isCloseToBottom = ({
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

export const useOnScrollContainerCloseToBottom = ({
  parentPageIsCloseToBottomOfScroll,
  onScrollContainerCloseToBottom,
}: {
  parentPageIsCloseToBottomOfScroll?: boolean;
  onScrollContainerCloseToBottom?: () => void;
} = {}) => {
  const canLoad = useRef(true);
  const [
    localPageBodyIsCloseToBottomOfScroll,
    setLocalPageBodyIsCloseToBottomOfScroll,
  ] = useState<boolean>(false);

  useEffect(() => {
    if (
      (parentPageIsCloseToBottomOfScroll ||
        localPageBodyIsCloseToBottomOfScroll) &&
      canLoad.current
    ) {
      canLoad.current = false;
      // home rolled debounce as callback approach not working ...TODO: use loadash debounce...
      // https://stackoverflow.com/questions/55616536/lodash-debounce-in-react-functional-component-not-working
      setTimeout(() => {
        canLoad.current = true;
      }, 3000);
      if (onScrollContainerCloseToBottom) {
        onScrollContainerCloseToBottom();
      }
    }
  }, [
    onScrollContainerCloseToBottom,
    localPageBodyIsCloseToBottomOfScroll,
    parentPageIsCloseToBottomOfScroll,
  ]);

  const scrollCallback = (a: any) => {
    //console.log("scrolling");
    if (
      isCloseToBottom(a.nativeEvent) &&
      localPageBodyIsCloseToBottomOfScroll === false
    ) {
      //console.log('close to bottom of scroll', pageBodyIsCloseToBottomOfScroll);
      setLocalPageBodyIsCloseToBottomOfScroll(true);
      setTimeout(() => setLocalPageBodyIsCloseToBottomOfScroll(false), 0);
    } else {
      setLocalPageBodyIsCloseToBottomOfScroll(false);
    }
  };

  return {
    scrollCallback,
    isCloseToBottom: localPageBodyIsCloseToBottomOfScroll,
  };
};

export const money = (amount: string | number) => {
  return `£${(Math.round(Number(amount) * 100) / 100).toFixed(2)}`;
};
