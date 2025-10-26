import React, { useState } from "react";
import { Platform, View } from "react-native";
import PhoneInput from "react-native-phone-input"; //hard to style for web
import { useDispatch } from "react-redux";
import { fetchClient } from "src/utils/legacy-stubs";
import { setPendingNumber } from "src/redux/features/misc/slice";
import {
  Body,
  Button,
  Header,
  Typography,
  WebFadeIn,
} from "src/components/common";
import { TypographyTypes } from "../../../components/common/typography";
import { useTranslation } from "src/translations/useTranslation";
import ModalPickerImage from "../countryPicker";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;
const useTypographyStyles =
  require("../../../themes/typography/styles/styles").default;
const useStyles = require("../../../pages/settings/styles/styles").default;

const PhoneNumberScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const pageStyles = useLayoutStyles();
  const typographyStyles = useTypographyStyles();
  const inputStyles = useInputStyles();
  const styles = useStyles();

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [number, setNumber] = useState("");
  const [pickerData, setPickerData] = useState(null);
  const phoneInputRef = React.useRef(null);

  const [modalVisible, setModalVisible] = useState(false);

  const sendCode = async () => {
    if (number && number.length) {
      const client = await fetchClient();
      client
        .put("user/send-verification-code", {
          phone: number,
        })
        .then(() => {
          navigation.navigate("ConfirmNumber", {
            returnpage: route.params?.returnpage,
          });
        });
    }
  };

  return (
    <WebFadeIn>
      <View style={[pageStyles.page]}>
        <Body style={[styles.changeEmailForm]}>
          <View
            style={[
              inputStyles.form,
              { maxWidth: 400, marginTop: 20, flex: 1 },
            ]}
          >
            <View>
              {/* <Header
                title={t("changePhone.title")}
                titleStyle={styles.titleStyle}
                navigation={navigation}
              /> */}
              <View>
                <Typography
                  type={TypographyTypes.Body1}
                  text={t("changePhone.preamble")}
                />

                {Platform.OS === "web" ? (
                  <>
                    <View
                      style={[
                        inputStyles.container,
                        inputStyles.phoneInputContainer,
                      ]}
                    >
                      <PhoneInput
                        style={[inputStyles.input]}
                        pickerItemStyle={inputStyles.picker}
                        textProps={{
                          maxLength: 20,
                          style: typographyStyles[TypographyTypes.Input],
                        }}
                        initialCountry={"gb"}
                        onChangePhoneNumber={(displayValue: string) => {
                          setNumber(displayValue);
                          dispatch(setPendingNumber(displayValue));
                        }}
                        ref={(ref) => {
                          if (ref?.getPickerData && !pickerData) {
                            phoneInputRef.current = ref;
                            const data = ref.getPickerData();
                            setPickerData(data);
                          }
                        }}
                        onPressFlag={() => {
                          setModalVisible(true);
                        }}
                      />
                    </View>

                    <ModalPickerImage
                      modalVisible={modalVisible}
                      setModalVisible={setModalVisible}
                      data={pickerData}
                      onChange={(country) => {
                        setModalVisible(false);
                        phoneInputRef.current?.selectCountry(country.iso2);
                      }}
                      close={() => {
                        setModalVisible(false);
                      }}
                      cancelText="Cancel"
                    />
                  </>
                ) : (
                  <View
                    style={[
                      inputStyles.container,
                      inputStyles.phoneInputContainer,
                    ]}
                  >
                    <PhoneInput
                      style={[inputStyles.input]}
                      pickerItemStyle={inputStyles.picker}
                      textProps={{
                        maxLength: 20,
                        style: typographyStyles[TypographyTypes.Input],
                      }}
                      initialCountry={"gb"}
                      onChangePhoneNumber={(displayValue: string) => {
                        setNumber(displayValue);
                        dispatch(setPendingNumber(displayValue));
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
            <Button title={t("changePhone.saveBtn")} onPress={sendCode} />
          </View>
        </Body>
      </View>
    </WebFadeIn>
  );
};

export default PhoneNumberScreen;
