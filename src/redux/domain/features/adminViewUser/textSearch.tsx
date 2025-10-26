/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { clearAdminViewUserItems } from "./collection-slice";
import { searchAbortController } from "src/utils/legacy-stubs";
import { initialLoadSize } from "src/utils";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "src/components/common";

const useInputStyles =
  require("../../../../themes/input/styles/styles").default;

const TextSearch = ({
  navigation,
  disabled,
  loadAdminViewUsers,
  placeholder,
  loadSize,
  style,
}: {
  navigation: any;
  disabled?: boolean;
  loadAdminViewUsers: (a: any) => void;
  placeholder?: string;
  loadSize?: number;
  style?: any;
}) => {
  const dispatch = useDispatch();
  const [textSearch, setTextSearch] = useState<string>("");
  const [used, setUsed] = useState(false);

  const inputStyles = useInputStyles();

  const debounced = useDebouncedCallback(
    // function
    (_textSearch: string) => {
      if (_textSearch || used) {
        dispatch(clearAdminViewUserItems());
        searchAbortController?.abort();
        loadAdminViewUsers({
          offset: 0,
          limit: loadSize || initialLoadSize || 3,
          filter: _textSearch,
        });
        setUsed(true);
      }
    },
    // delay in ms
    1000,
  );

  const doTextSearch = (text: string) => {
    setTextSearch(text);
  };

  useEffect(() => {
    debounced(textSearch);
  }, [debounced, textSearch]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     navigation.addListener('blur', () => {
  //       if (textSearch && used) {
  //         dispatch(clearAdminViewUserItems());
  //       }
  //     });
  //   }, [dispatch, navigation, textSearch, used])
  // );

  return (
    <Search
      placeholder={placeholder || "Search..."}
      onChangeText={doTextSearch}
      value={textSearch || ""}
      style={style}
    />
  );
};

export default TextSearch;
