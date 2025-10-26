/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Userhabitpackuse } from "domain";
import { createUserHabitPackUse, updateUserHabitPackUse, deleteUserHabitPackUse, userHabitPackUseErrorSelector, userHabitPackUseSelector , clearUserHabitPackUseError } from "src/redux/domain/features/userHabitPackUse/collection-slice";
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
  { propertyName : "UserHabitPack", label : "User habit pack" , placeholder : "User habit pack"}, 
  { propertyName : "ConcreteHabit", label : "Concrete habit" , placeholder : "Concrete habit"}, 
];

const UserHabitPackUseForm = forwardRef(({
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
  formItem?: Partial<Userhabitpackuse>,
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
    values: Partial<Userhabitpackuse>,
    errors: FormikErrors<Userhabitpackuse>
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
  const error = useSelector(userHabitPackUseErrorSelector);
  const userHabitPackUseItem = useSelector(userHabitPackUseSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userhabitpackuse> = {
      User: userHabitPackUseItem?.User || formItem?.User || undefined,
      UserHabitPack: userHabitPackUseItem?.UserHabitPack || formItem?.UserHabitPack || undefined,
      ConcreteHabit: userHabitPackUseItem?.ConcreteHabit || formItem?.ConcreteHabit || undefined,
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
    return userHabitPackUseItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userHabitPackUseItem?.Id) return { Id: userHabitPackUseItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userhabitpackuse>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        User: Yup.string().required(textValues?.requiredText || 'Required'),
        UserHabitPack: Yup.string().required(textValues?.requiredText || 'Required'),
        ConcreteHabit: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (userHabitPackUse) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userHabitPackUse, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserHabitPackUse(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserHabitPackUse(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserHabitPackUse(userHabitPackUseItem?.Id as number));
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
      dispatch(clearUserHabitPackUseError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.userHabitPackUseForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackUse-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Use` : saveButtonText ? saveButtonText : `Save User Habit Pack Use`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackUse"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Use`}
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
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('UserHabitPack') !== -1 ? false : true)}
            multiline={fieldConfig['UserHabitPack']?.multiline ? fieldConfig['UserHabitPack'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['UserHabitPack']?.numberOfLines ? fieldConfig['UserHabitPack'].numberOfLines : 1}
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
            testID="UserHabitPack"
            placeholder={ returnCorrectTextValue("UserHabitPack", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("UserHabitPack", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("UserHabitPack")}
            value={formik.values.UserHabitPack?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("UserHabitPack", "label") }
            errorMessage={formik.touched.UserHabitPack && formik.errors.UserHabitPack}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'UserHabitPack').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('ConcreteHabit') !== -1 ? false : true)}
            multiline={fieldConfig['ConcreteHabit']?.multiline ? fieldConfig['ConcreteHabit'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['ConcreteHabit']?.numberOfLines ? fieldConfig['ConcreteHabit'].numberOfLines : 1}
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
            testID="ConcreteHabit"
            placeholder={ returnCorrectTextValue("ConcreteHabit", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("ConcreteHabit", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("ConcreteHabit")}
            value={formik.values.ConcreteHabit?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("ConcreteHabit", "label") }
            errorMessage={formik.touched.ConcreteHabit && formik.errors.ConcreteHabit}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'ConcreteHabit').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackUse-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Use` : saveButtonText ? saveButtonText : `Save User Habit Pack Use`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackUse"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Use`}
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


export default UserHabitPackUseForm;
