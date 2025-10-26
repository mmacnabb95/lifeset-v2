import React, { useCallback, useEffect } from "react";
import { Pressable, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Body, Icon, Typography, WebFadeIn } from "../../../components/common";
import { Categories } from "./constants";
import { TypographyTypes } from "../../../components/common/typography";
import constants from "../../../themes/constants";
import { Journal } from "../../../../../types/domain/flat-types";
import {
  getJournal,
  journalSelector,
} from "../../../redux/domain/features/journal/collection-slice";
import moment from "moment";
import { setHeaderTitle } from "../../../redux/features/misc/slice";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

interface Props {
  navigation: any;
  route: any;
}

const JournalViewScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const layoutStyles = useLayoutStyles();

  const category = route.params?.category as Categories;
  const journalId = route.params?.journalId;

  const journal: Journal = useSelector(journalSelector(journalId));

  const fetchJournal = useCallback(async () => {
    if (journalId !== "new") {
      await dispatch(getJournal(journalId));
    }
  }, [dispatch, journalId]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchJournal();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchJournal]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setHeaderTitle("Note"));

      return () => {
        dispatch(setHeaderTitle(""));
      };
    }, [dispatch])
  );

  if (!journal) {
    return null;
  }

  return (
    <WebFadeIn background={false}>
      <View style={layoutStyles.page}>
        <Body>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: 12,
              }}
            >
              <Typography
                text={journal.Title as string}
                type={TypographyTypes.H1}
                style={{
                  color: constants.primaryColor,
                  width: "80%",
                }}
              />
              <Pressable
                onPress={() => {
                  navigation.navigate("JournalEdit", {
                    category,
                    journalId,
                  });
                }}
              >
                <Icon
                  iconType={"edit-pencil"}
                  iconSize={20}
                  iconColor={constants.black900}
                />
              </Pressable>
            </View>
            <Typography
              text={moment(journal.CreatedAt as string).format(
                "ddd Do MMM YYYY",
              )}
              type={TypographyTypes.Body1}
              style={{
                color: constants.black900,
                fontStyle: "italic",
                marginBottom: 18,
              }}
            />
            <Typography
              text={journal.Content as string}
              type={TypographyTypes.Body1}
              style={{ color: constants.black900 }}
            />
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default JournalViewScreen;
