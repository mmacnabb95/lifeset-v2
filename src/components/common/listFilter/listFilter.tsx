import React, { Dispatch, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Typography, TypographyTypes } from "../typography";
import { Search } from "../../../../../types/search/search";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import _ from "lodash";
import { Button, ButtonTypes } from "../button";
import { useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

interface SearchField {
  title: string;
  name: string;
  values: { Id: number; Name: string }[];
  hidden?: boolean;
  filterType: "filter" | "hardFilter" | "bool" | "unknown";
}

const filterOn = (
  search: Search,
  searchField: SearchField,
  filterTypeId?: number,
): boolean => {
  if (!filterTypeId) {
    return false;
  }

  let filter = _.find(search.filters, { fieldName: searchField.name })?.filter;
  if (filter && filter.indexOf(filterTypeId) !== -1) {
    return true;
  }

  let hardFilter = _.find(search.hardFilters, { fieldName: searchField.name });
  if (hardFilter && hardFilter.value === filterTypeId) {
    return true;
  }

  if (searchField.filterType === "bool") {
    let boolFilter = _.find(search.filters, {
      fieldName: searchField.name,
    })?.filter;

    if (boolFilter && boolFilter[0] === true) {
      return true;
    }

    return false;
  }

  return false;
};

const toggleFilter = (
  search: Search,
  setSearch: (value: React.SetStateAction<Search>) => void,
  searchField: SearchField,
  filterTypeId?: number,
  inline?: boolean,
  dispatch?: Dispatch<any>,
  clearingThunk?: () => void,
  reSearch?: () => void,
  doSearch?: () => void,
) => {
  if (!filterTypeId) {
    return;
  }

  //multi
  let filter = _.find(search.filters, {
    fieldName: searchField.name,
  })?.filter;
  if (filter && filter.indexOf(filterTypeId) !== -1) {
    _.remove(filter, (val) => val === filterTypeId);
  } else if (filter) {
    filter.push(filterTypeId);
  }

  //single
  let hardFilter = _.find(search.hardFilters, { fieldName: searchField.name });
  if (hardFilter && hardFilter.value === filterTypeId) {
    hardFilter.value = undefined;
  } else if (hardFilter) {
    hardFilter.value = filterTypeId;
  }

  //bool
  if (searchField.filterType === "bool") {
    let boolFilter = _.find(search.filters, {
      fieldName: searchField.name,
    })?.filter;

    if (boolFilter && boolFilter[0] === true) {
      _.remove(boolFilter, (val) => val === true);
    } else if (boolFilter) {
      boolFilter.push(true);
    }
  }

  setSearch(search);
  // console.log("Search", search);
  if (inline && clearingThunk && dispatch && reSearch && doSearch) {
    dispatch(clearingThunk());
    doSearch();
    reSearch();
  }
};

export const ListFilter = ({
  modalTitle,
  modalPreamble,
  modalButtonText,
  search,
  setSearch,
  doSearch,
  reSearch,
  clearingThunk,
  searchFields,
  disabled,
  inline = true,
  setFilterOpen,
  pressableStyle,
  selectedStyle,
  onLayout,
}: {
  modalTitle?: string;
  modalPreamble?: string;
  modalButtonText?: string;
  search: Search;
  setSearch: React.Dispatch<React.SetStateAction<Search>>;
  doSearch: () => void;
  reSearch: () => void;
  clearingThunk: () => void;
  searchFields: SearchField[];
  disabled?: boolean;
  inline?: boolean;
  setFilterOpen?: (value: React.SetStateAction<boolean>) => void;
  pressableStyle?: any;
  selectedStyle?: any;
  onLayout?: any;
}) => {
  const dispatch = useDispatch();
  const [filtered, setFiltered] = useState(1);
  const navigation = useNavigation();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        padding: inline ? 0 : 12,
        paddingBottom: 30,
        justifyContent: "center",
        alignItems: "center",
      }}
      onLayout={onLayout}
    >
      {!!modalTitle && (
        <Typography
          type={TypographyTypes.H4}
          text={modalTitle}
          style={{ width: "100%", textAlign: "left", color: "#000000", marginBottom: 8 }}
        />
      )}
      {!!modalPreamble && (
        <Typography
          type={TypographyTypes.Body1}
          text={modalPreamble}
          style={{ width: "100%", textAlign: "left", color: "#000000", marginBottom: 12 }}
        />
      )}
      <View style={{ width: "100%", paddingTop: 12 }}>
        {searchFields.map((field: SearchField) => {
          if (field.hidden) {
            return null;
          }
          return (
            <View
              key={field.name}
              style={[
                {
                  paddingLeft: 0,
                  paddingTop: 0,
                  marginBottom: 10,
                  alignItems: "flex-start",
                  width: "100%",
                },
              ]}
            >
              <Typography
                text={field.title}
                type={TypographyTypes.H4}
                style={[
                  {
                    fontWeight: "700",
                    fontSize: 15,
                    lineHeight: 18,
                    paddingLeft: 4,
                    marginBottom: 8,
                  },
                ]}
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  gap: 8,
                }}
              >
                {field.values &&
                  field.values.map((value, i) => {
                    return (
                      <Pressable
                        key={`${field.name}_${value.Id}`}
                        onPress={() => {
                          if (Platform.OS !== "web") {
                            fireMediumHapticFeedback();
                          }
                          toggleFilter(
                            search,
                            setSearch,
                            field,
                            value.Id,
                            inline,
                            dispatch,
                            clearingThunk,
                            reSearch,
                            doSearch,
                          );
                          let f = filtered + 1;
                          setFiltered(f);
                        }}
                        disabled={disabled}
                        style={[
                          {
                            paddingVertical: 4,
                          },
                        ]}
                      >
                        <View
                          style={[
                            {
                              paddingHorizontal: 4,
                              marginRight: 8,
                            },
                            pressableStyle,
                            filterOn(search, field, value.Id)
                              ? selectedStyle
                              : {},
                          ]}
                        >
                          <Typography
                            text={value.Name}
                            type={TypographyTypes.Body1}
                            style={[
                              {
                                fontWeight: filterOn(search, field, value.Id)
                                  ? "700"
                                  : "400",
                                opacity: filterOn(search, field, value.Id)
                                  ? 1
                                  : 0.5,
                                height: 17,
                                lineHeight: 17,
                              },
                              filterOn(search, field, value.Id)
                                ? { color: selectedStyle?.color }
                                : {},
                            ]}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
              </View>
            </View>
          );
        })}
      </View>
      {!inline && (
        <View style={{ width: "100%", marginBottom: 30 }}>
          <Button
            type={ButtonTypes.Primary}
            title={modalButtonText || "Search"}
            onPress={async () => {
              if (setFilterOpen) {
                setFilterOpen(false);
              }
              dispatch(clearingThunk());
              doSearch();
              reSearch();
            }}
          />
          <Button
            type={ButtonTypes.Secondary}
            title={"Cancel"}
            style={{ marginTop: 10 }}
            onPress={() => {
              if (setFilterOpen) {
                navigation.goBack();
              }
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};
