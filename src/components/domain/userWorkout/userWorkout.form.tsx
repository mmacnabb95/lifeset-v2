/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Userworkout } from "domain";
import { createUserWorkout, updateUserWorkout, deleteUserWorkout, userWorkoutErrorSelector, userWorkoutSelector , clearUserWorkoutError } from "src/redux/domain/features/userWorkout/collection-slice";
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
  { propertyName : "Workout", label : "Workout" , placeholder : "Workout"}, 
  { propertyName : "StartDate", label : "Start date" , placeholder : "Start date"}, 
  { propertyName : "CurrentDayNumber", label : "Current day number" , placeholder : "Current day number"}, 
  { propertyName : "CurrentWorkoutDay", label : "Current workout day" , placeholder : "Current workout day"}, 
];

const UserWorkoutForm = forwardRef(({
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
  formItem?: Partial<Userworkout>,
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
    values: Partial<Userworkout>,
    errors: FormikErrors<Userworkout>
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
  const error = useSelector(userWorkoutErrorSelector);
  const userWorkoutItem = useSelector(userWorkoutSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userworkout> = {
      User: userWorkoutItem?.User || formItem?.User || undefined,
      Workout: userWorkoutItem?.Workout || formItem?.Workout || undefined,
      StartDate: userWorkoutItem?.StartDate || formItem?.StartDate || undefined,
      CurrentDayNumber: userWorkoutItem?.CurrentDayNumber || formItem?.CurrentDayNumber || undefined,
      CurrentWorkoutDay: userWorkoutItem?.CurrentWorkoutDay || formItem?.CurrentWorkoutDay || undefined,
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
    return userWorkoutItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userWorkoutItem?.Id) return { Id: userWorkoutItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userworkout>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        User: Yup.string().required(textValues?.requiredText || 'Required'),
        Workout: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (userWorkout) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userWorkout, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserWorkout(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserWorkout(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserWorkout(userWorkoutItem?.Id as number));
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
      dispatch(clearUserWorkoutError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.userWorkoutForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkout-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout` : saveButtonText ? saveButtonText : `Save User Workout`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkout"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout`}
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
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Workout') !== -1 ? false : true)}
            multiline={fieldConfig['Workout']?.multiline ? fieldConfig['Workout'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Workout']?.numberOfLines ? fieldConfig['Workout'].numberOfLines : 1}
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
            testID="Workout"
            placeholder={ returnCorrectTextValue("Workout", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Workout", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("Workout")}
            value={formik.values.Workout?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Workout", "label") }
            errorMessage={formik.touched.Workout && formik.errors.Workout}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Workout').map((fa) => {
            return fa.el;
          })}
        
          <DateInput
            readOnly={viewOnly === true ? true : (readOnly && readOnly.indexOf('StartDate') !== -1 ? true : false)}
            label={returnCorrectTextValue("StartDate", "label")}
            value={formik.values.StartDate}
            onChange={(event, selectedDate) => {
              formik.setFieldValue("StartDate", selectedDate, true);
            }}
            errorMessage={formik.touched.StartDate && formik.errors.StartDate}
          />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'StartDate').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('CurrentDayNumber') !== -1 ? false : true)}
            multiline={fieldConfig['CurrentDayNumber']?.multiline ? fieldConfig['CurrentDayNumber'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['CurrentDayNumber']?.numberOfLines ? fieldConfig['CurrentDayNumber'].numberOfLines : 1}
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
            testID="CurrentDayNumber"
            placeholder={ returnCorrectTextValue("CurrentDayNumber", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("CurrentDayNumber", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("CurrentDayNumber")}
            value={formik.values.CurrentDayNumber?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("CurrentDayNumber", "label") }
            errorMessage={formik.touched.CurrentDayNumber && formik.errors.CurrentDayNumber}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'CurrentDayNumber').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('CurrentWorkoutDay') !== -1 ? false : true)}
            multiline={fieldConfig['CurrentWorkoutDay']?.multiline ? fieldConfig['CurrentWorkoutDay'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['CurrentWorkoutDay']?.numberOfLines ? fieldConfig['CurrentWorkoutDay'].numberOfLines : 1}
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
            testID="CurrentWorkoutDay"
            placeholder={ returnCorrectTextValue("CurrentWorkoutDay", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("CurrentWorkoutDay", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("CurrentWorkoutDay")}
            value={formik.values.CurrentWorkoutDay?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("CurrentWorkoutDay", "label") }
            errorMessage={formik.touched.CurrentWorkoutDay && formik.errors.CurrentWorkoutDay}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'CurrentWorkoutDay').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkout-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout` : saveButtonText ? saveButtonText : `Save User Workout`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkout"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout`}
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


export default UserWorkoutForm;
