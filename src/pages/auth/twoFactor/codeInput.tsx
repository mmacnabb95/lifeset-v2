import React, { createRef, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Button, Typography } from "../../../components/common";
import { TypographyTypes } from "../../../components/common/typography";

// @ts-ignore
import useInputStyles from "../../../themes/input/styles/styles";

export const CodeInput = ({
  navigation,
  formik,
  error,
  inputStyle,
}: {
  navigation: any;
  formik: any;
  error?: string | false;
  inputStyle?: any;
}) => {
  const inputStyles = useInputStyles();
  const [loading, setLoading] = useState(false);

  const [bcode, setbcode] = useState<string[]>(["", "", "", "", "", ""]);
  const [elRefs, setElRefs] = React.useState([]);

  const handleCodeChange = (index: number, value: string) => {
    if (index < 5 && value !== "") {
      (elRefs[index + 1] as any).current.focus();
    }
    const newbcode = bcode;
    newbcode[index] = value;
    setbcode(newbcode);
    formik.setFieldValue("code", newbcode.join(""), false);
  };

  React.useEffect(() => {
    setElRefs((_elRefs) =>
      Array(bcode.length)
        .fill({})
        .map((_, i) => _elRefs[i] || createRef()),
    );
  }, [bcode.length]);

  useEffect(() => {
    if (formik.values.code === "      ") {
      setbcode(["", "", "", "", "", ""]);
    }
  }, [formik]);

  return (
    <>
      <View style={[inputStyles.code]}>
        {[0, 1, 2, 3, 4, 5].map((v, i) => {
          return (
            <TextInput
              key={`code${i}`}
              style={[
                { backgroundColor: "white" },
                inputStyles.codeInput,
                { marginRight: i === 5 ? 0 : 14 },
                inputStyle,
              ]}
              ref={elRefs[i]}
              keyboardType="numeric"
              testID={`code${i}`}
              onChangeText={(e) => handleCodeChange(i, e)}
              value={bcode[i]}
              maxLength={1}
              onSubmitEditing={() => {
                i === 5 ? formik.handleSubmit() : null;
              }}
            />
          );
        })}
      </View>
      {/* TODO: Implement code resend! - this works though just go back and press resend again... */}
      {/* <View style={{ marginTop: 10, marginBottom: 10 }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Typography type={TypographyTypes.Link} text={"No code?"} />
        </Pressable>
      </View> */}

      <Button
        testID={"Confirm"}
        onPress={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 5000);
          formik.handleSubmit();
        }}
        title={"Confirm"}
        loading={loading}
      />
      <View>
        <Text>{error ? (error as string) : ""}</Text>
      </View>
    </>
  );
};
