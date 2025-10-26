import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Search } from "../../../../../../types/search/search";
import constants from "src/themes/addNew/constants";
import { Typography, TypographyTypes } from "src/components/common/typography";
import _ from "lodash";
import ChevronDown from "src/assets/be-icons/chevron-down";
import { useDispatch } from "react-redux";

type Direction = "ASC" | "DESC";

export const OrderBy = ({
  fieldName,
  text,
  setSearch,
  search,
  reSearch,
  clearItems,
}: {
  fieldName: string;
  text: string;
  setSearch: React.Dispatch<React.SetStateAction<Search>>;
  search: Search;
  reSearch: () => void;
  clearItems: () => void;
}) => {
  const [sortDirection, setSortDirection] = useState<Direction>("ASC");
  const [sortExpression] = useState(fieldName);
  const searchRef = useRef(search);
  const dispatch = useDispatch();

  useEffect(() => {
    const doSearch = () => {
      const newSearch = {
        ...search,
        ...{ sortDirection, sortExpression },
      };
      setSearch(newSearch);
    };

    if (
      !_.isEqual(sortExpression, search.sortExpression) ||
      !_.isEqual(sortDirection, search.sortDirection)
    ) {
      doSearch();
    }
  }, [reSearch, search, setSearch, sortDirection, sortExpression]);

  useEffect(() => {
    if (!_.isEqual(searchRef.current, search)) {
      // TODO: this is a work around for the complexity of adding multiple order by fields
      // this is possible as its suppored in the db
      // however we need to update the proc to query an orderby string rather than an exact match
      // basically this mean we don't have to pre-popuate the hook with the default order field(s)
      if (search.sortExpression && searchRef.current?.sortExpression) {
        dispatch(clearItems());
        reSearch();
      }

      searchRef.current = search;
    }
  }, [clearItems, dispatch, reSearch, search]);

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "ASC" ? "DESC" : "ASC";
    setSortDirection(newDirection);
  };

  return (
    <Pressable onPress={toggleSortDirection} testID="sort">
      <View style={{ flexDirection: "row", alignItems: "center", height: 50 }}>
        <Typography type={TypographyTypes.Body2} text={"Sort by: "} />
        <Typography type={TypographyTypes.Body1} text={text} />
        {sortDirection === "ASC" ? (
          <Image
            style={{ height: 24, width: 24 }}
            source={require("../../../../assets/Expand_left.png")}
          />
        ) : (
          <Image
            style={{ height: 24, width: 24 }}
            source={require("../../../../assets/Expand_right.png")}
          />
        )}
      </View>
    </Pressable>
  );
};
