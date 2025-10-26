/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";
import { Toggle } from "src/components/common";
// @ts-ignore
import { Userworkoutdayexercise } from "domain";
import { createUserWorkoutDayExercise, updateUserWorkoutDayExercise, deleteUserWorkoutDayExercise, userWorkoutDayExerciseErrorSelector, userWorkoutDayExerciseSelector , clearUserWorkoutDayExerciseError } from "src/redux/domain/features/userWorkoutDayExercise/collection-slice";
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
  { propertyName : "UserWorkout", label : "User workout" , placeholder : "User workout"}, 
  { propertyName : "WorkoutDayExercise", label : "Workout day exercise" , placeholder : "Workout day exercise"}, 
  { propertyName : "Notes", label : "Notes" , placeholder : "Notes"}, 
  { propertyName : "Completed", label : "Completed" , placeholder : "Completed"}, 
];

const UserWorkoutDayExerciseForm = forwardRef(({
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
  formItem?: Partial<Userworkoutdayexercise>,
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
    values: Partial<Userworkoutdayexercise>,
    errors: FormikErrors<Userworkoutdayexercise>
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
  const error = useSelector(userWorkoutDayExerciseErrorSelector);
  const userWorkoutDayExerciseItem = useSelector(userWorkoutDayExerciseSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userworkoutdayexercise> = {
      User: userWorkoutDayExerciseItem?.User || formItem?.User || undefined,
      UserWorkout: userWorkoutDayExerciseItem?.UserWorkout || formItem?.UserWorkout || undefined,
      WorkoutDayExercise: userWorkoutDayExerciseItem?.WorkoutDayExercise || formItem?.WorkoutDayExercise || undefined,
      Notes: userWorkoutDayExerciseItem?.Notes || formItem?.Notes || '',
      Completed: userWorkoutDayExerciseItem?.Completed || formItem?.Completed || false,
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
    return userWorkoutDayExerciseItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userWorkoutDayExerciseItem?.Id) return { Id: userWorkoutDayExerciseItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userworkoutdayexercise>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        User: Yup.string().required(textValues?.requiredText || 'Required'),
        UserWorkout: Yup.string().required(textValues?.requiredText || 'Required'),
        WorkoutDayExercise: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (userWorkoutDayExercise) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userWorkoutDayExercise, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserWorkoutDayExercise(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserWorkoutDayExercise(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserWorkoutDayExercise(userWorkoutDayExerciseItem?.Id as number));
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
      dispatch(clearUserWorkoutDayExerciseError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.userWorkoutDayExerciseForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkoutDayExercise-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout Day Exercise` : saveButtonText ? saveButtonText : `Save User Workout Day Exercise`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkoutDayExercise"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout Day Exercise`}
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
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('UserWorkout') !== -1 ? false : true)}
            multiline={fieldConfig['UserWorkout']?.multiline ? fieldConfig['UserWorkout'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['UserWorkout']?.numberOfLines ? fieldConfig['UserWorkout'].numberOfLines : 1}
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
            testID="UserWorkout"
            placeholder={ returnCorrectTextValue("UserWorkout", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("UserWorkout", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("UserWorkout")}
            value={formik.values.UserWorkout?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("UserWorkout", "label") }
            errorMessage={formik.touched.UserWorkout && formik.errors.UserWorkout}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'UserWorkout').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('WorkoutDayExercise') !== -1 ? false : true)}
            multiline={fieldConfig['WorkoutDayExercise']?.multiline ? fieldConfig['WorkoutDayExercise'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['WorkoutDayExercise']?.numberOfLines ? fieldConfig['WorkoutDayExercise'].numberOfLines : 1}
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
            testID="WorkoutDayExercise"
            placeholder={ returnCorrectTextValue("WorkoutDayExercise", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("WorkoutDayExercise", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("WorkoutDayExercise")}
            value={formik.values.WorkoutDayExercise?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("WorkoutDayExercise", "label") }
            errorMessage={formik.touched.WorkoutDayExercise && formik.errors.WorkoutDayExercise}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'WorkoutDayExercise').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Notes') !== -1 ? false : true)}
            multiline={fieldConfig['Notes']?.multiline ? fieldConfig['Notes'].multiline  : true}
            numberOfLines={fieldConfig['Notes']?.numberOfLines ? fieldConfig['Notes'].numberOfLines : 10}
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
            testID="Notes"
            placeholder={ returnCorrectTextValue("Notes", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Notes", text, true)
            }}
            onBlur={formik.handleBlur("Notes")}
            value={formik.values.Notes?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Notes", "label") }
            errorMessage={formik.touched.Notes && formik.errors.Notes}
            errorPlace={'centerRight'}
            maxLength={4000}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Notes').map((fa) => {
            return fa.el;
          })}
        


        <Toggle
          label={returnCorrectTextValue("Completed", "label")}
          testID={"user-workout-day-exercise-completed"}
          enabled={formik.values.Completed}
          onChange={(value) => formik.setFieldValue("Completed", value, true)}
          labelStyle={style?.toggleLabel}
          disabled={viewOnly === true ? true : (readOnly && readOnly.indexOf('Completed') !== -1 ? true : false)}
          errorMessage={formik.errors.Completed}
        />


        
          {fieldAppendees?.filter((f) => f.fieldName === 'Completed').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkoutDayExercise-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout Day Exercise` : saveButtonText ? saveButtonText : `Save User Workout Day Exercise`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkoutDayExercise"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout Day Exercise`}
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


export default UserWorkoutDayExerciseForm;
