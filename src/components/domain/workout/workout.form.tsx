/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Workout } from "domain";
import { createWorkout, updateWorkout, deleteWorkout, workoutErrorSelector, workoutSelector , clearWorkoutError } from "src/redux/domain/features/workout/collection-slice";
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
import FitnessGoalOption from "../options/fitnessGoal/fitnessGoal.option";
import CurrentFitnessLevelOption from "../options/currentFitnessLevel/currentFitnessLevel.option";
import DaysPerWeekOption from "../options/daysPerWeek/daysPerWeek.option";
import WorkoutSessionLengthOption from "../options/workoutSessionLength/workoutSessionLength.option";
import WorkoutLocationOption from "../options/workoutLocation/workoutLocation.option";
import CardioIncludedOption from "../options/cardioIncluded/cardioIncluded.option";
import _ from "lodash";

interface DefaultTextValues {
  propertyName : string,
  label : string,
  placeholder : string
};

export const defaultTextValues:DefaultTextValues[] = [
  { propertyName : "Name", label : "Name" , placeholder : "Name"}, 
  { propertyName : "FitnessGoal", label : "Fitness goal" , placeholder : "Fitness goal"}, 
  { propertyName : "CurrentFitnessLevel", label : "Fitness level" , placeholder : "Current fitness level"}, 
  { propertyName : "DaysPerWeek", label : "Days per week" , placeholder : "Days per week"}, 
  { propertyName : "WorkoutSessionLength", label : "Session length in minutes" , placeholder : "Workout session length"}, 
  { propertyName : "WorkoutLocation", label : "Workout location" , placeholder : "Workout location"}, 
  { propertyName : "CardioIncluded", label : "Cardio included" , placeholder : "Cardio included"}, 
];

const WorkoutForm = forwardRef(({
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
  formItem?: Partial<Workout>,
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
    values: Partial<Workout>,
    errors: FormikErrors<Workout>
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
  const error = useSelector(workoutErrorSelector);
  const workoutItem = useSelector(workoutSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Workout> = {
      Name: workoutItem?.Name || formItem?.Name || '',
      FitnessGoal: workoutItem?.FitnessGoal || formItem?.FitnessGoal || undefined,
      CurrentFitnessLevel: workoutItem?.CurrentFitnessLevel || formItem?.CurrentFitnessLevel || undefined,
      DaysPerWeek: workoutItem?.DaysPerWeek || formItem?.DaysPerWeek || undefined,
      WorkoutSessionLength: workoutItem?.WorkoutSessionLength || formItem?.WorkoutSessionLength || undefined,
      WorkoutLocation: workoutItem?.WorkoutLocation || formItem?.WorkoutLocation || undefined,
      CardioIncluded: workoutItem?.CardioIncluded || formItem?.CardioIncluded || undefined,
      Published: workoutItem?.Published || formItem?.Published || false,
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
    return workoutItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (workoutItem?.Id) return { Id: workoutItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Workout>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Name: Yup.string().trim().required(textValues?.requiredText || 'Name is required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (workout) => {
      // Ensure Name is trimmed
      const trimmedWorkout = {
        ...workout,
        Name: workout.Name?.trim()
      };
      
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...trimmedWorkout, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateWorkout(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createWorkout(_.omit(trimmedWorkout, ["HasVideo", "HasImage"])));

        if(afterCreate) afterCreate({...response, isValid});
        if(afterCreateIdCallback && response.payload?.Id) {
          afterCreateIdCallback(response.payload.Id);
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
        const response: any = await dispatch(deleteWorkout(workoutItem?.Id as number));
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
      dispatch(clearWorkoutError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.workoutForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Workout-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout` : saveButtonText ? saveButtonText : `Save Workout`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkout"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout`}
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
        
        <FitnessGoalOption  style={style} formik={formik}  label={returnCorrectTextValue("FitnessGoal", "label")}
        selectText={returnCorrectTextValue("FitnessGoal", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('FitnessGoal') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'FitnessGoal').map((fa) => {
            return fa.el;
          })}
        
        <CurrentFitnessLevelOption  style={style} formik={formik}  label={"Fitness level"}
        selectText={returnCorrectTextValue("CurrentFitnessLevel", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('CurrentFitnessLevel') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'CurrentFitnessLevel').map((fa) => {
            return fa.el;
          })}
        
        <DaysPerWeekOption  style={style} formik={formik}  label={returnCorrectTextValue("DaysPerWeek", "label")}
        selectText={returnCorrectTextValue("DaysPerWeek", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('DaysPerWeek') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'DaysPerWeek').map((fa) => {
            return fa.el;
          })}
        
        <WorkoutSessionLengthOption  style={style} formik={formik}  label={"Session length in minutes"}
        selectText={returnCorrectTextValue("WorkoutSessionLength", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('WorkoutSessionLength') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'WorkoutSessionLength').map((fa) => {
            return fa.el;
          })}
        
        <WorkoutLocationOption  style={style} formik={formik}  label={returnCorrectTextValue("WorkoutLocation", "label")}
        selectText={returnCorrectTextValue("WorkoutLocation", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('WorkoutLocation') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'WorkoutLocation').map((fa) => {
            return fa.el;
          })}
        
        <CardioIncludedOption  style={style} formik={formik}  label={returnCorrectTextValue("CardioIncluded", "label")}
        selectText={returnCorrectTextValue("CardioIncluded", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('CardioIncluded') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'CardioIncluded').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Workout-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout` : saveButtonText ? saveButtonText : `Save Workout`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkout"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout`}
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


export default WorkoutForm;
