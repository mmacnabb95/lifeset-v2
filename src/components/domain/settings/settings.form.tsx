/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";
import { Toggle } from "src/components/common";
// @ts-ignore
import { Settings } from "domain";
import { createSettings, updateSettings, deleteSettings, settingsErrorSelector, settingsSelector , clearSettingsError } from "src/redux/domain/features/settings/collection-slice";
import { View, Text, useWindowDimensions } from "react-native";

import {ButtonTypes} from "src/components/common/button";
import {
  Input,
  Button,
} from "src/components/common";
import commonConstants from "src/themes/constants";
const useCmsStyles = require("../../../themes/cms/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;
const useButtonStyles = require("../../../themes/button/styles/styles").default;
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../themes/typography/styles/styles").default;
import { TypographyTypes } from "src/components/common/typography";
import { useFocusEffect } from "@react-navigation/native";
import { DateInput } from "src/components/common/dateInput";


// options
import _ from "lodash";

interface DefaultTextValues {
  propertyName : string,
  label : string,
  placeholder : string
};

export const defaultTextValues:DefaultTextValues[] = [
  { propertyName : "Name", label : "Name" , placeholder : "Name"}, 
  { propertyName : "Email", label : "Email" , placeholder : "Email"}, 
  { propertyName : "Notifications", label : "Notifications" , placeholder : "Notifications"}, 
  { propertyName : "TimeZone", label : "Time zone" , placeholder : "Time zone"}, 
];

const SettingsForm = forwardRef(({
  customTextValues,
  afterCreate,
  afterCreateIdCallback,
  afterUpdate,
  beforeDelete,
  afterDelete,
  formItem,
  saveButtonText,
  updateButtonText,
  deleteButtonText,
  hideButtons,
  hideDeleteButton,
  fieldAppendees,
  readOnly,
  isValid,
  textValues,
  style,
  handleValuesChange,
  viewOnly,
  injectedValidationSchema,
  buttonsTop = false,
  fieldConfig = {},
  
}: {
  customTextValues?: Object[],
  afterCreate?: ({ response , isValid } : { response? : any , isValid? : any }) => void,
  afterCreateIdCallback?: (id:number) => void,
  afterUpdate?: ({ response , isValid } : { response? : any , isValid? : any }) => void,
  beforeDelete?: () => Promise<boolean>,
  afterDelete?: ({ response } : { response? : any  }) => void,
  formItem?: Partial<Settings>,
  saveButtonText?: string,
  updateButtonText?: string,
  deleteButtonText?: string,
  hideButtons?: boolean,
  hideDeleteButton?: boolean,
  fieldAppendees?: {el: ReactNode, fieldName: string}[],
  readOnly?: string[],
  isValid?: any,
  textValues?: {[index:string]: string}, //requiredText | selectText
  style?: any,
  viewOnly?: boolean,
  injectedValidationSchema?: any,
  fieldConfig?: any,
  buttonsTop?: boolean,
  handleValuesChange?: ({
    values,
    errors
  }: {
    values: Partial<Settings>,
    errors: FormikErrors<Settings>
  }) => void,
  
}, ref ) => {
  const {mobileBreak} = commonConstants
  const { width: windowWidth } = useWindowDimensions();
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const inputStyles = useInputStyles();
  const buttonStyles = useButtonStyles();
  const layoutStyles = useLayoutStyles();
  const commonTypographyStyles = useCommonTypographyStyles();


  const dispatch = useDispatch();
  const error = useSelector(settingsErrorSelector);
  const settingsItem = useSelector(settingsSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Settings> = {
      Name: settingsItem?.Name || formItem?.Name || '',
      Url: settingsItem?.Url || formItem?.Url || '',
      Meta: settingsItem?.Meta || formItem?.Meta || '',
      Email: settingsItem?.Email || formItem?.Email || '',
      PhoneNumber: settingsItem?.PhoneNumber || formItem?.PhoneNumber || '',
      Language: settingsItem?.Language || formItem?.Language || undefined,
      Deleted: settingsItem?.Deleted || formItem?.Deleted || false,
      Notifications: settingsItem?.Notifications || formItem?.Notifications || false,
      ExpoPushToken: settingsItem?.ExpoPushToken || formItem?.ExpoPushToken || '',
      StreakLeaderboardParticipation: settingsItem?.StreakLeaderboardParticipation || formItem?.StreakLeaderboardParticipation || false,
      TimeZone: settingsItem?.TimeZone || formItem?.TimeZone || '',
  };

  const changeTextToCustomValue = useCallback((newValues: any) => {

    const _labels = [...currentTextValues];

    _labels.forEach((e: any) => {
      const _search = newValues.filter((f: any) => f.propertyName === e.propertyName);
      if (_search.length > 0) {
        if (_search[0].label) {
          e.label = _search[0].label;
        }
        if (_search[0].placeholder) {
          e.placeholder = _search[0].placeholder;
        }
      }
    });

    setCurrentTextValues(_labels);
  }, []);

  useEffect(()=>{
    if(customTextValues && customTextValues.length > 0) changeTextToCustomValue(customTextValues);
  },[customTextValues, changeTextToCustomValue]);

  const itemExists = () => {
    return settingsItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (settingsItem?.Id) return { Id: settingsItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Settings>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Name: Yup.string().required(textValues?.requiredText || 'Required'),
        Email: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (settings) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...settings, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", "CreatedDate"]);
        response = await dispatch(updateSettings(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createSettings(_.omit(formik.values, ["HasVideo", "HasImage"])));

        if(afterCreate) afterCreate({...response, isValid});
        if(afterCreateIdCallback) {
          const id = response.payload?.Id;
          afterCreateIdCallback(id);
        }
      }
    },
  });

  useEffect(() => {
    if (handleValuesChange)
      handleValuesChange({ values: formik.values, errors: formik.errors })
  }, [formik.values, formik.errors])

  const handleDelete = async () => {
      if (!beforeDelete || await beforeDelete() === true) {
        const response: any = await dispatch(deleteSettings(settingsItem?.Id as number));
        if(afterDelete) afterDelete({...response});
      }
  };

  const returnCorrectTextValue = (propertyName: string, location: string) => {
    const _value = currentTextValues.filter((e: DefaultTextValues) => e.propertyName === propertyName).map((e: DefaultTextValues) => e[location as keyof DefaultTextValues]);
    return _value[0];
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
     // formik.handleSubmit();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(clearSettingsError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.settingsForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Settings-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Settings` : saveButtonText ? saveButtonText : `Save Settings`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteSettings"}
                title={deleteButtonText ? deleteButtonText : `Delete Settings`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Name') !== -1 ? false : true)}
            multiline={fieldConfig['Name']?.multiline ? fieldConfig['Name'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Name']?.numberOfLines ? fieldConfig['Name'].numberOfLines : 1}
            // scrollEnabled={false}
            inputLabelStyle={[
              style?.inputLabelStyle
            ]}
            style={[
              style?.input
            ]}
            inputStyle={[
              style?.inputStyle
            ]}
            inputContainerStyle={[
              style?.inputContainerStyle
            ]}
            multilineStyle={[
              style?.multilineStyle
            ]}
            testID="Name"
            placeholder={ returnCorrectTextValue("Name", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Name", text, true)
            }}
            onBlur={formik.handleBlur("Name")}
            value={formik.values.Name?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Name", "label") }
            errorMessage={formik.touched.Name && formik.errors.Name}
            errorPlace={'centerRight'}
            maxLength={200}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Name').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Email') !== -1 ? false : true)}
            multiline={fieldConfig['Email']?.multiline ? fieldConfig['Email'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Email']?.numberOfLines ? fieldConfig['Email'].numberOfLines : 1}
            // scrollEnabled={false}
            inputLabelStyle={[
              style?.inputLabelStyle
            ]}
            style={[
              style?.input
            ]}
            inputStyle={[
              style?.inputStyle
            ]}
            inputContainerStyle={[
              style?.inputContainerStyle
            ]}
            multilineStyle={[
              style?.multilineStyle
            ]}
            testID="Email"
            placeholder={ returnCorrectTextValue("Email", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Email", text, true)
            }}
            onBlur={formik.handleBlur("Email")}
            value={formik.values.Email?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Email", "label") }
            errorMessage={formik.touched.Email && formik.errors.Email}
            errorPlace={'centerRight'}
            maxLength={200}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Email').map((fa) => {
            return fa.el;
          })}
        


        <Toggle
          label={returnCorrectTextValue("Notifications", "label")}
          testID={"settings-notifications"}
          enabled={formik.values.Notifications}
          onChange={(value) => formik.setFieldValue("Notifications", value, true)}
          labelStyle={style?.toggleLabel}
          disabled={viewOnly === true ? true : (readOnly && readOnly.indexOf('Notifications') !== -1 ? true : false)}
          errorMessage={formik.errors.Notifications}
        />


        
          {fieldAppendees?.filter((f) => f.fieldName === 'Notifications').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('TimeZone') !== -1 ? false : true)}
            multiline={fieldConfig['TimeZone']?.multiline ? fieldConfig['TimeZone'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['TimeZone']?.numberOfLines ? fieldConfig['TimeZone'].numberOfLines : 1}
            // scrollEnabled={false}
            inputLabelStyle={[
              style?.inputLabelStyle
            ]}
            style={[
              style?.input
            ]}
            inputStyle={[
              style?.inputStyle
            ]}
            inputContainerStyle={[
              style?.inputContainerStyle
            ]}
            multilineStyle={[
              style?.multilineStyle
            ]}
            testID="TimeZone"
            placeholder={ returnCorrectTextValue("TimeZone", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("TimeZone", text, true)
            }}
            onBlur={formik.handleBlur("TimeZone")}
            value={formik.values.TimeZone?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("TimeZone", "label") }
            errorMessage={formik.touched.TimeZone && formik.errors.TimeZone}
            errorPlace={'centerRight'}
            maxLength={45}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'TimeZone').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Settings-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Settings` : saveButtonText ? saveButtonText : `Save Settings`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteSettings"}
                title={deleteButtonText ? deleteButtonText : `Delete Settings`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
        )}
        <View>
          <Text>{error ? (error as string) : ""}</Text>
        </View>
      </View>
  );
})


export default SettingsForm;
