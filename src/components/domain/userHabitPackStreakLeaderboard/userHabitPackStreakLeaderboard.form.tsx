/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Userhabitpackstreakleaderboard } from "domain";
import { createUserHabitPackStreakLeaderboard, updateUserHabitPackStreakLeaderboard, deleteUserHabitPackStreakLeaderboard, userHabitPackStreakLeaderboardErrorSelector, userHabitPackStreakLeaderboardSelector , clearUserHabitPackStreakLeaderboardError } from "src/redux/domain/features/userHabitPackStreakLeaderboard/collection-slice";
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
  { propertyName : "User", label : "User" , placeholder : "User"}, 
  { propertyName : "UserFullName", label : "User full name" , placeholder : "User full name"}, 
  { propertyName : "MaxStreakThisMonth", label : "Max streak this month" , placeholder : "Max streak this month"}, 
  { propertyName : "Url", label : "Url" , placeholder : "Url"}, 
  { propertyName : "Meta", label : "Meta" , placeholder : "Meta"}, 
  { propertyName : "DateIncremented", label : "Date incremented" , placeholder : "Date incremented"}, 
];

const UserHabitPackStreakLeaderboardForm = forwardRef(({
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
  formItem?: Partial<Userhabitpackstreakleaderboard>,
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
    values: Partial<Userhabitpackstreakleaderboard>,
    errors: FormikErrors<Userhabitpackstreakleaderboard>
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
  const error = useSelector(userHabitPackStreakLeaderboardErrorSelector);
  const userHabitPackStreakLeaderboardItem = useSelector(userHabitPackStreakLeaderboardSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userhabitpackstreakleaderboard> = {
      UserHabitPack: userHabitPackStreakLeaderboardItem?.UserHabitPack || formItem?.UserHabitPack || undefined,
      User: userHabitPackStreakLeaderboardItem?.User || formItem?.User || undefined,
      UserFullName: userHabitPackStreakLeaderboardItem?.UserFullName || formItem?.UserFullName || '',
      MaxStreakThisMonth: userHabitPackStreakLeaderboardItem?.MaxStreakThisMonth || formItem?.MaxStreakThisMonth || undefined,
      Url: userHabitPackStreakLeaderboardItem?.Url || formItem?.Url || '',
      Meta: userHabitPackStreakLeaderboardItem?.Meta || formItem?.Meta || '',
      DateIncremented: userHabitPackStreakLeaderboardItem?.DateIncremented || formItem?.DateIncremented || undefined,
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
    return userHabitPackStreakLeaderboardItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userHabitPackStreakLeaderboardItem?.Id) return { Id: userHabitPackStreakLeaderboardItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userhabitpackstreakleaderboard>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        User: Yup.string().required(textValues?.requiredText || 'Required'),
        UserFullName: Yup.string().required(textValues?.requiredText || 'Required'),
        MaxStreakThisMonth: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (userHabitPackStreakLeaderboard) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userHabitPackStreakLeaderboard, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserHabitPackStreakLeaderboard(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserHabitPackStreakLeaderboard(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserHabitPackStreakLeaderboard(userHabitPackStreakLeaderboardItem?.Id as number));
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
      dispatch(clearUserHabitPackStreakLeaderboardError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.userHabitPackStreakLeaderboardForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackStreakLeaderboard-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Streak Leaderboard` : saveButtonText ? saveButtonText : `Save User Habit Pack Streak Leaderboard`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackStreakLeaderboard"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Streak Leaderboard`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('User') !== -1 ? false : true)}
            multiline={fieldConfig['User']?.multiline ? fieldConfig['User'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['User']?.numberOfLines ? fieldConfig['User'].numberOfLines : 1}
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
            testID="User"
            placeholder={ returnCorrectTextValue("User", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("User", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("User")}
            value={formik.values.User?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("User", "label") }
            errorMessage={formik.touched.User && formik.errors.User}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'User').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('UserFullName') !== -1 ? false : true)}
            multiline={fieldConfig['UserFullName']?.multiline ? fieldConfig['UserFullName'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['UserFullName']?.numberOfLines ? fieldConfig['UserFullName'].numberOfLines : 1}
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
            testID="UserFullName"
            placeholder={ returnCorrectTextValue("UserFullName", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("UserFullName", text, true)
            }}
            onBlur={formik.handleBlur("UserFullName")}
            value={formik.values.UserFullName?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("UserFullName", "label") }
            errorMessage={formik.touched.UserFullName && formik.errors.UserFullName}
            errorPlace={'centerRight'}
            maxLength={45}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'UserFullName').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('MaxStreakThisMonth') !== -1 ? false : true)}
            multiline={fieldConfig['MaxStreakThisMonth']?.multiline ? fieldConfig['MaxStreakThisMonth'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['MaxStreakThisMonth']?.numberOfLines ? fieldConfig['MaxStreakThisMonth'].numberOfLines : 1}
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
            testID="MaxStreakThisMonth"
            placeholder={ returnCorrectTextValue("MaxStreakThisMonth", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("MaxStreakThisMonth", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("MaxStreakThisMonth")}
            value={formik.values.MaxStreakThisMonth?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("MaxStreakThisMonth", "label") }
            errorMessage={formik.touched.MaxStreakThisMonth && formik.errors.MaxStreakThisMonth}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'MaxStreakThisMonth').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Url') !== -1 ? false : true)}
            multiline={fieldConfig['Url']?.multiline ? fieldConfig['Url'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Url']?.numberOfLines ? fieldConfig['Url'].numberOfLines : 1}
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
            testID="Url"
            placeholder={ returnCorrectTextValue("Url", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Url", text, true)
            }}
            onBlur={formik.handleBlur("Url")}
            value={formik.values.Url?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Url", "label") }
            errorMessage={formik.touched.Url && formik.errors.Url}
            errorPlace={'centerRight'}
            maxLength={255}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Url').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Meta') !== -1 ? false : true)}
            multiline={fieldConfig['Meta']?.multiline ? fieldConfig['Meta'].multiline  : true}
            numberOfLines={fieldConfig['Meta']?.numberOfLines ? fieldConfig['Meta'].numberOfLines : 10}
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
            testID="Meta"
            placeholder={ returnCorrectTextValue("Meta", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Meta", text, true)
            }}
            onBlur={formik.handleBlur("Meta")}
            value={formik.values.Meta?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Meta", "label") }
            errorMessage={formik.touched.Meta && formik.errors.Meta}
            errorPlace={'centerRight'}
            maxLength={4000}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Meta').map((fa) => {
            return fa.el;
          })}
        
          <DateInput
            readOnly={viewOnly === true ? true : (readOnly && readOnly.indexOf('DateIncremented') !== -1 ? true : false)}
            label={returnCorrectTextValue("DateIncremented", "label")}
            value={formik.values.DateIncremented}
            onChange={(event, selectedDate) => {
              formik.setFieldValue("DateIncremented", selectedDate, true);
            }}
            errorMessage={formik.touched.DateIncremented && formik.errors.DateIncremented}
          />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'DateIncremented').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackStreakLeaderboard-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Streak Leaderboard` : saveButtonText ? saveButtonText : `Save User Habit Pack Streak Leaderboard`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackStreakLeaderboard"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Streak Leaderboard`}
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


export default UserHabitPackStreakLeaderboardForm;
