/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Habitcompletedrecord } from "domain";
import { createHabitCompletedRecord, updateHabitCompletedRecord, deleteHabitCompletedRecord, habitCompletedRecordErrorSelector, habitCompletedRecordSelector , clearHabitCompletedRecordError } from "src/redux/domain/features/habitCompletedRecord/collection-slice";
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
  { propertyName : "HabitCompletedDate", label : "Habit completed date" , placeholder : "Habit completed date"}, 
];

const HabitCompletedRecordForm = forwardRef(({
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
  formItem?: Partial<Habitcompletedrecord>,
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
    values: Partial<Habitcompletedrecord>,
    errors: FormikErrors<Habitcompletedrecord>
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
  const error = useSelector(habitCompletedRecordErrorSelector);
  const habitCompletedRecordItem = useSelector(habitCompletedRecordSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Habitcompletedrecord> = {
      Habit: habitCompletedRecordItem?.Habit || formItem?.Habit || undefined,
      HabitCompletedDate: habitCompletedRecordItem?.HabitCompletedDate || formItem?.HabitCompletedDate || undefined,
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
    return habitCompletedRecordItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (habitCompletedRecordItem?.Id) return { Id: habitCompletedRecordItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Habitcompletedrecord>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Habit: Yup.string().required(textValues?.requiredText || 'Required'),
        HabitCompletedDate: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (habitCompletedRecord) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...habitCompletedRecord, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateHabitCompletedRecord(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createHabitCompletedRecord(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteHabitCompletedRecord(habitCompletedRecordItem?.Id as number));
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
      dispatch(clearHabitCompletedRecordError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.habitCompletedRecordForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-HabitCompletedRecord-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit Completed Record` : saveButtonText ? saveButtonText : `Save Habit Completed Record`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabitCompletedRecord"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit Completed Record`}
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
        
          <DateInput
            readOnly={viewOnly === true ? true : (readOnly && readOnly.indexOf('HabitCompletedDate') !== -1 ? true : false)}
            label={returnCorrectTextValue("HabitCompletedDate", "label")}
            value={formik.values.HabitCompletedDate}
            onChange={(event, selectedDate) => {
              formik.setFieldValue("HabitCompletedDate", selectedDate, true);
            }}
            errorMessage={formik.touched.HabitCompletedDate && formik.errors.HabitCompletedDate}
          />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'HabitCompletedDate').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-HabitCompletedRecord-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Habit Completed Record` : saveButtonText ? saveButtonText : `Save Habit Completed Record`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteHabitCompletedRecord"}
                title={deleteButtonText ? deleteButtonText : `Delete Habit Completed Record`}
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


export default HabitCompletedRecordForm;
