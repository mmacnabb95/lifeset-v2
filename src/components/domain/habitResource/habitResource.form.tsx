/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Habitresource } from "domain";
import { createHabitResource, updateHabitResource, deleteHabitResource, habitResourceErrorSelector, habitResourceSelector , clearHabitResourceError } from "src/redux/domain/features/habitResource/collection-slice";
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
  { propertyName : "Habit", label : "Habit" , placeholder : "Habit"}, 
  { propertyName : "Key", label : "Key" , placeholder : "Key"}, 
  { propertyName : "Url", label : "Url" , placeholder : "Url"}, 
];

const HabitResourceForm = forwardRef(({
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
  formItem?: Partial<Habitresource>,
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
    values: Partial<Habitresource>,
    errors: FormikErrors<Habitresource>
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
  const error = useSelector(habitResourceErrorSelector);
  const habitResourceItem = useSelector(habitResourceSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Habitresource> = {
      Habit: habitResourceItem?.Habit || formItem?.Habit || undefined,
      Key: habitResourceItem?.Key || formItem?.Key || '',
      Url: habitResourceItem?.Url || formItem?.Url || '',
      Meta: habitResourceItem?.Meta || formItem?.Meta || '',
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
    return habitResourceItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (habitResourceItem?.Id) return { Id: habitResourceItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Habitresource>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Habit: Yup.string().required(textValues?.requiredText || 'Required'),
        Key: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (habitResource) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...habitResource, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateHabitResource(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createHabitResource(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteHabitResource(habitResourceItem?.Id as number));
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
      dispatch(clearHabitResourceError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.habitResourceForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-HabitResource-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit Resource` : saveButtonText ? saveButtonText : `Save Habit Resource`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabitResource"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit Resource`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Habit') !== -1 ? false : true)}
            multiline={fieldConfig['Habit']?.multiline ? fieldConfig['Habit'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Habit']?.numberOfLines ? fieldConfig['Habit'].numberOfLines : 1}
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
            testID="Habit"
            placeholder={ returnCorrectTextValue("Habit", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Habit", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("Habit")}
            value={formik.values.Habit?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Habit", "label") }
            errorMessage={formik.touched.Habit && formik.errors.Habit}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Habit').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Key') !== -1 ? false : true)}
            multiline={fieldConfig['Key']?.multiline ? fieldConfig['Key'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Key']?.numberOfLines ? fieldConfig['Key'].numberOfLines : 1}
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
            testID="Key"
            placeholder={ returnCorrectTextValue("Key", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Key", text, true)
            }}
            onBlur={formik.handleBlur("Key")}
            value={formik.values.Key?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Key", "label") }
            errorMessage={formik.touched.Key && formik.errors.Key}
            errorPlace={'centerRight'}
            maxLength={45}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Key').map((fa) => {
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
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-HabitResource-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit Resource` : saveButtonText ? saveButtonText : `Save Habit Resource`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabitResource"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit Resource`}
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


export default HabitResourceForm;
