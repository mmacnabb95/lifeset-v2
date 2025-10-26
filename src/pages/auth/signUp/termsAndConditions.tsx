import { View } from "react-native";
import { Checkbox, Typography } from "../../../components/common";
import { TypographyTypes } from "../../../components/common/typography";
import commonConstants from "../../../themes/constants";
import { CheckBoxItem } from "../../../components/common/checkbox";
import { Button, ButtonTypes } from "../../../components/common/button";
import React from "react";

interface TermsAndConditionsProps {
  readonly selected: CheckBoxItem[];
  readonly setSelected: (selected: CheckBoxItem[]) => void;
  readonly submit: () => void;
  readonly terms: (CheckBoxItem & { readonly required: boolean })[];
}

export const TermsAndConditions = ({
  selected,
  setSelected,
  terms,
  submit,
}: TermsAndConditionsProps) => {
  const isDisabled = terms.some(
    (x) => selected.find((y) => y.Id === x.Id) === undefined && x.required,
  );

  return (
    <View
      style={{
        width: "100%",
      }}
    >
      <Typography
        text={"Please agree to the following:"}
        type={TypographyTypes.H1}
        style={{
          color: commonConstants.primaryColor,
        }}
      />
      <Checkbox
        items={terms}
        selectedItems={selected}
        onSelect={(item) => {
          const isSelected = selected.find((x) => x.Id === item.Id);
          if (isSelected) {
            setSelected(selected.filter((x) => x.Id !== item.Id));
            return;
          }
          setSelected([...selected, item]);
        }}
        theme={ButtonTypes.LinkButton}
      />
      <Button
        type={ButtonTypes.Primary}
        disabled={isDisabled}
        title={"Sign up"}
        onPress={submit}
        testID={"CreateAccount"}
      />
    </View>
  );
};
