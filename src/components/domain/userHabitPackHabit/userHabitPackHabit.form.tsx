/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Userhabitpackhabit } from "domain";
import { createUserHabitPackHabit, updateUserHabitPackHabit, deleteUserHabitPackHabit, userHabitPackHabitErrorSelector, userHabitPackHabitSelector , clearUserHabitPackHabitError } from "src/redux/domain/features/userHabitPackHabit/collection-slice";
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
import CategoryOption from "../options/category/category.option";
import _ from "lodash";

interface DefaultTextValues {
  propertyName : string,
  label : string,
  placeholder : string
};

export const defaultTextValues:DefaultTextValues[] = [
  { propertyName : "Name", label : "" , placeholder : "Name"}, 
  { propertyName : "Description", label : "" , placeholder : "Description"}, 
  { propertyName : "Category", label : "" , placeholder : "Category"}, 
];

const UserHabitPackHabitForm = forwardRef(({
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
  formItem?: Partial<Userhabitpackhabit>,
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
    values: Partial<Userhabitpackhabit>,
    errors: FormikErrors<Userhabitpackhabit>
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
  const error = useSelector(userHabitPackHabitErrorSelector);
  const userHabitPackHabitItem = useSelector(userHabitPackHabitSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userhabitpackhabit> = {
      UserHabitPack: userHabitPackHabitItem?.UserHabitPack || formItem?.UserHabitPack || undefined,
      Name: userHabitPackHabitItem?.Name || formItem?.Name || '',
      Description: userHabitPackHabitItem?.Description || formItem?.Description || '',
      Category: userHabitPackHabitItem?.Category || formItem?.Category || undefined,
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
    return userHabitPackHabitItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userHabitPackHabitItem?.Id) return { Id: userHabitPackHabitItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userhabitpackhabit>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Name: Yup.string().required(textValues?.requiredText || 'Required'),
        Category: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (userHabitPackHabit) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userHabitPackHabit, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserHabitPackHabit(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserHabitPackHabit(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserHabitPackHabit(userHabitPackHabitItem?.Id as number));
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
      dispatch(clearUserHabitPackHabitError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.userHabitPackHabitForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackHabit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Habit` : saveButtonText ? saveButtonText : `Save User Habit Pack Habit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackHabit"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Habit`}
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
            maxLength={45}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Name').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Description') !== -1 ? false : true)}
            multiline={fieldConfig['Description']?.multiline ? fieldConfig['Description'].multiline  : true}
            numberOfLines={fieldConfig['Description']?.numberOfLines ? fieldConfig['Description'].numberOfLines : 10}
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
            testID="Description"
            placeholder={ returnCorrectTextValue("Description", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Description", text, true)
            }}
            onBlur={formik.handleBlur("Description")}
            value={formik.values.Description?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Description", "label") }
            errorMessage={formik.touched.Description && formik.errors.Description}
            errorPlace={'centerRight'}
            maxLength={4000}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Description').map((fa) => {
            return fa.el;
          })}
        
        <CategoryOption  style={style} formik={formik}  label={returnCorrectTextValue("Category", "label")}
        selectText={returnCorrectTextValue("Category", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Category') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'Category').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserHabitPackHabit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Habit Pack Habit` : saveButtonText ? saveButtonText : `Save User Habit Pack Habit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserHabitPackHabit"}
                title={deleteButtonText ? deleteButtonText : `Delete User Habit Pack Habit`}
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


export default UserHabitPackHabitForm;
