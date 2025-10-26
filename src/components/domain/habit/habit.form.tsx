/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Habit } from "domain";
import { createHabit, updateHabit, deleteHabit, habitErrorSelector, habitSelector , clearHabitError } from "src/redux/domain/features/habit/collection-slice";
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
  { propertyName : "Title", label : "" , placeholder : "Title"}, 
  { propertyName : "Description", label : "" , placeholder : "Description"}, 
  { propertyName : "Category", label : "" , placeholder : "Category"}, 
];

const HabitForm = forwardRef(({
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
  formItem?: Partial<Habit>,
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
    values: Partial<Habit>,
    errors: FormikErrors<Habit>
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
  const error = useSelector(habitErrorSelector);
  const habitItem = useSelector(habitSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Habit> = {
      User: habitItem?.User || formItem?.User || undefined,
      Title: habitItem?.Title || formItem?.Title || '',
      Description: habitItem?.Description || formItem?.Description || '',
      Category: habitItem?.Category || formItem?.Category || undefined,
      FromTemplate: habitItem?.FromTemplate || formItem?.FromTemplate || false,
      CreatedDate: habitItem?.CreatedDate || formItem?.CreatedDate || undefined,
      DeletedDate: habitItem?.DeletedDate || formItem?.DeletedDate || undefined,
      UserHabitPack: habitItem?.UserHabitPack || formItem?.UserHabitPack || undefined,
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
    return habitItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (habitItem?.Id) return { Id: habitItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Habit>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Title: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (habit) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...habit, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateHabit(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createHabit(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteHabit(habitItem?.Id as number));
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
      dispatch(clearHabitError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.habitForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, formStyles.buttonsTop, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Habit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit` : saveButtonText ? saveButtonText : `Save Habit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabit"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Title') !== -1 ? false : true)}
            multiline={fieldConfig['Title']?.multiline ? fieldConfig['Title'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Title']?.numberOfLines ? fieldConfig['Title'].numberOfLines : 1}
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
            testID="Title"
            placeholder={ returnCorrectTextValue("Title", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Title", text, true)
            }}
            onBlur={formik.handleBlur("Title")}
            value={formik.values.Title?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Title", "label") }
            errorMessage={formik.touched.Title && formik.errors.Title}
            errorPlace={'centerRight'}
            maxLength={50}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Title').map((fa) => {
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
          <View style={[formStyles.buttons, formStyles.buttonsBottom, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Habit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit` : saveButtonText ? saveButtonText : `Save Habit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabit"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit`}
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


export default HabitForm;
