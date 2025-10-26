import React from "react";
import { Typography, TypographyTypes } from "../typography";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import constants from "src/themes/constants";
import { CompanyLogo } from "src/navigation/header/companyLogo";
import { Pressable, View } from "react-native";
import { useBenefitsSearchCollection } from "src/redux/domain/features/benefit/useBenefitSearchCollection";
import { useDispatch, useSelector } from "react-redux";
import {
  benefitsLoading,
  clearBenefitItems,
} from "src/redux/domain/features/benefit/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { Button, ButtonTypes } from "../button";
import { ResourceViewNavOption } from "../resourceViewNavOption";
import { Benefit, Company } from "../../../../../types/domain/flat-types";
import { Loading } from "../loading/loading";
import { WebFadeIn } from "../webFadeIn";
import { useFocusEffect } from "@react-navigation/native";
import {
  companySelector,
  companysSelector,
  getCompany,
} from "src/redux/domain/features/company/collection-slice";
import { initialLoadSize } from "src/utils";
import { LinearGradient } from "expo-linear-gradient";

export const Benefits = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const dispatch = useDispatch();
  const { companyId } = useUserInfo();
  const _company: Company = useSelector(companySelector(companyId));
  const loading = useSelector(benefitsLoading);
  const { searchResult: benefits, loadBenefits } = useBenefitsSearchCollection(
    companyId,
    3,
    undefined,
  );

  useFocusEffect(
    React.useCallback(() => {
      if (companyId && companyId !== "new") {
        dispatch(getCompany(companyId));
      }
    }, [dispatch, companyId]),
  );

  if (!companyId || !benefits || benefits.length === 0) {
    return null;
  }

  return (
    <DashboardTile
      style={{
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => {
          // navigation.navigate("StreakLeaderboard");
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 1 : 1,
            position: "relative",
            flexBasis: "auto",
            flexShrink: 1,
            flexGrow: 0,
          },
        ]}
      >
        <LinearGradient
          colors={["#9BBAE9", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.3, y: 0.1 }}
          style={[
            {
              paddingVertical: 10,
              paddingHorizontal: 20,
            },
          ]}
        >
          {loading && !benefits && (
            <View
              style={{
                height: "100%",
                top: 0,
                width: 100,
                position: "absolute",
                alignSelf: "center",
              }}
            >
              <Loading />
            </View>
          )}
          <WebFadeIn
            background={false}
            waitFor={benefits && _company && !loading}
            shouldWait={true}
            style={{
              flexBasis: "auto",
              flexShrink: 1,
              flexGrow: 0,
              height: undefined,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                marginTop: 10,
                marginBottom: 15,
                paddingLeft: 4,
                maxWidth: "100%",
              }}
            >
              <View
                style={{
                  height: 61,
                  width: 61,
                  borderRadius: 32,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <CompanyLogo
                  style={{
                    marginLeft: 0,
                    height: 40,
                    width: 40,
                  }}
                />
              </View>
              <Typography
                type={TypographyTypes.Body1}
                ellipsizeMode="tail"
                numberOfLines={2}
                text={_company?.BenefitsTitle}
                style={{
                  color: constants.black,
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 7,
                  flex: 1,
                }}
              />
            </View>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                flexBasis: "auto",
                flexShrink: 1,
                flexGrow: 0,
              }}
            >
              {benefits
                ?.filter((b, i) => i < 3)
                .map((benefit: Benefit) => {
                  return (
                    <ResourceViewNavOption
                      key={`benefit_${benefit.Id}`}
                      navigation={navigation}
                      destination={benefit.Link || ""}
                      text={benefit.Name || ""}
                      subText={benefit.Description}
                      style={{
                        width: "100%",
                        flexBasis: "auto",
                        flexShrink: 1,
                        flexGrow: 0,
                      }}
                      listItem={benefit}
                      descriptionLines={2}
                    />
                  );
                })}
              {benefits && benefits.length > 0 && (
                <View
                  style={{ width: "100%", alignItems: "flex-end", bottom: 0 }}
                >
                  <Button
                    type={ButtonTypes.Secondary}
                    title="View all"
                    onPress={() => {
                      loadBenefits({
                        offset: 0,
                        limit: initialLoadSize,
                        filter: "",
                      });
                      navigation.navigate("Main", {
                        ...{ screen: "BenefitsView" },
                        params: { companyId },
                      });
                    }}
                    style={{
                      width: 86,
                      height: 36,
                      minHeight: 36,
                      borderRadius: 40,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0);",
                      backgroundColor: "rgba(255, 255, 255, 0.40);",
                      marginBottom: 0,
                    }}
                    titleStyle={{
                      color: "#505050",
                      fontSize: 13,
                      lineHeight: 18,
                      fontWeight: 400,
                      fontFamily: "Poppins_400Regular",
                    }}
                  />
                </View>
              )}
            </View>
          </WebFadeIn>
        </LinearGradient>
      </Pressable>
    </DashboardTile>
  );
};
