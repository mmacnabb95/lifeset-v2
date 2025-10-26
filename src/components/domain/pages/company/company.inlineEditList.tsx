/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import {
  Header,
  ListBody,
  Typography,
  WebFadeIn,
  Drawer,
  OrderBy,
} from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import commonConstants from "src/themes/constants";
const useCmsStyles = require("../../../../themes/cms/styles/styles").default;
const useLayoutStyles =
  require("../../../../themes/layout/styles/styles").default;
const useFormStyles = require("../../../../themes/form/styles/styles").default;
import { View } from "react-native";
import { useWindowDimensions, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { clearCompanyItems } from "src/redux/domain/features/company/collection-slice";
import { Company } from "../../../../../../types/domain/flat-types";
import { useCompanyCollection } from "src/redux/domain/features/company/useCompanyCollection";
import { initialLoadSize, rootLanguage } from "src/utils";
import { useCompanysSearchCollection } from "src/redux/domain/features/company/useCompanySearchCollection";
import { companysLoading } from "src/redux/domain/features/company/collection-slice";
import { useTranslation } from "src/translations/useTranslation";
import { useOnScrollContainerCloseToBottom } from "src/utils";
import CompanyEdit from "src/components/domain/pages/company/company.edit";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  companyMediaKeysSelector,
  getCompanyMediaKeys,
} from "src/redux/domain/features/companyMediaKey/collection-slice";

import { useFocusEffect } from "@react-navigation/native";

import TextSearch from "src/redux/domain/features/company/textSearch";

import { useCompanyInlineEditListDrawerHandler } from "src/components/common/config/hooks/useCompanyInlineEditListDrawerHandler";

//draw items

const CompanyEditListScreen = ({
  navigation,
  route,
  showTitle = true,
  // showPreamble = true,
  hideGoBack,
  style,
  newEnabled = true,
  fadeIn = true,
  parentPageIsCloseToBottomOfScroll,
}: {
  navigation: any;
  route?: any;
  showTitle?: boolean;
  // showPreamble?: boolean;
  hideGoBack?: boolean;
  style?: any;
  newEnabled?: boolean;
  fadeIn?: boolean;
  parentPageIsCloseToBottomOfScroll?: boolean;
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState(0); // drawer items//0 - default, 1 .. or more
  const { onOpen, onClose } = useCompanyInlineEditListDrawerHandler(
    setDrawerOpen,
    setDrawerItem,
  );

  const layoutStyles = useLayoutStyles();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const { width } = useWindowDimensions();

  const dispatch = useDispatch();

  const {
    loadMore,
    loadCompanys,
    basicParams,
    searchResult: companys,
    setSearch,
    search,
    reSearch,
  } = useCompanysSearchCollection(initialLoadSize, rootLanguage);

  const { scrollCallback } = useOnScrollContainerCloseToBottom({
    parentPageIsCloseToBottomOfScroll,
    onScrollContainerCloseToBottom: loadMore,
  });

  const loading = useSelector(companysLoading);
  const { text } = useTranslation();

  const companyMediaKeys = useSelector(companyMediaKeysSelector);

  useFocusEffect(
    React.useCallback(() => {
      if (!companyMediaKeys) {
        dispatch(getCompanyMediaKeys());
      }
    }, [dispatch, companyMediaKeys]),
  );

  const getSubText = (item: any): string | JSX.Element | undefined => {
    if (item?.Description || item?.Text) {
      const text =
        item?.Introduction || item?.Description || item?.Text || item?.Article;
      return (
        <>
          <Typography
            type={TypographyTypes.Body1}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={text.replace(/\n/g, " ")}
          />
        </>
      );
    } else if (item?.category?.Name)
      return (
        <>
          <Typography type={TypographyTypes.Body1} text={"Category:"} />
          <Typography type={TypographyTypes.Body1} text={item.category.Name} />
        </>
      );
  };

  const getIconPath = (company: Company) => {
    const iconPath = company?.resources?.find((r) => r.Key === "Icon")?.Url;
    if (iconPath) {
      return iconPath;
    }

    //we can't do this in the editList if it isn't support in the viewList
    // ... and to do that we need a concept of the source resource - i.e. view don't have resources...
    // if (!companyMediaKeys?.find(k => k.MediaRestriction === 'Image')){
    //   return;
    // }

    // const heroPath = company?.resources?.find(r => r.Key === 'Hero')?.Url;
    // return heroPath;
  };

  const handleDrawerOpen = async (_drawerItem?: number) => {
    const result = await onOpen({ drawerItem: _drawerItem, setDrawerItem });

    if (result === false) {
      return false;
    }
    //wait until drawer contents re-rendered - avoiding jank
    setTimeout(() => {
      setDrawerOpen(true);
    }, 0);

    return true;
  };

  const handleClose = async () => {
    await onClose({ drawerItem });
    setDrawerOpen(false);
  };

  return (
    <Drawer
      open={drawerOpen}
      handleClose={handleClose}
      leftItem={
        <WebFadeIn off={!fadeIn} style={style}>
          <View
            style={[
              layoutStyles.page,
              layoutStyles.paddingMob20,
              cmsStyles?.companyEditList,
              style,
            ]}
          >
            <ScrollView
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={[layoutStyles.scrollViewContainer]}
              contentContainerStyle={[
                layoutStyles.scrollViewBody,
                { paddingBottom: 20 },
              ]}
              showsVerticalScrollIndicator={false}
              onScroll={scrollCallback}
              keyboardShouldPersistTaps="handled"
            >
              <Header
                title={
                  showTitle
                    ? text("companyEditList.title")[0] || "Companys"
                    : ""
                }
                // preamble={showPreamble ? text("companyEditList.preamble")[0] || "All companys" : ""}
                navigation={navigation}
                addNewDestination="CompanyEdit"
                addNewParams={{ companyId: "new" }}
                hideGoBack={width < commonConstants.mobileBreak || hideGoBack}
                newEnabled={!drawerOpen && newEnabled}
                handleDrawerOpen={handleDrawerOpen}
                style={style}
                aboveResultsLeftComponents={<View />}
                underHeaderComponents={
                  <TextSearch
                    navigation={navigation}
                    loadCompanys={loadCompanys}
                  />
                }
              />

              <ListBody
                navigation={navigation}
                route={route}
                listItems={companys}
                loading={loading}
                style={style}
                basicParams={basicParams}
                loadMore={loadMore}
                doLoad={loadCompanys}
                destination={"CompanyEdit"}
                showIcon
                // orderBy={['Order',  'Name']}
                paramKey="companyId"
                handleDrawerOpen={handleDrawerOpen}
                handleDrawerClose={handleClose}
                getIconPath={getIconPath}
              />
            </ScrollView>
          </View>
        </WebFadeIn>
      }
      rightItem={
        <>
          {drawerItem === 0 && (
            <CompanyEdit
              navigation={navigation}
              route={route}
              showHeader={false}
            />
          )}
        </>
      }
    />
  );
};

export default CompanyEditListScreen;
