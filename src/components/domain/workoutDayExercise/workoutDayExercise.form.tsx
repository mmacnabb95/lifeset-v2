/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Workoutdayexercise } from "domain";
import { createWorkoutDayExercise, updateWorkoutDayExercise, deleteWorkoutDayExercise, workoutDayExerciseErrorSelector, workoutDayExerciseSelector , clearWorkoutDayExerciseError } from "src/redux/domain/features/workoutDayExercise/collection-slice";
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
import ExerciseOption from "../options/exercise/exercise.option";
import SetTypeOption from "../options/setType/setType.option";
import _ from "lodash";

interface DefaultTextValues {
  propertyName : string,
  label : string,
  placeholder : string
};

export const defaultTextValues:DefaultTextValues[] = [
  { propertyName : "Exercise", label : "Exercise" , placeholder : "Exercise"}, 
  { propertyName : "SetType", label : "Set type" , placeholder : "Set type"}, 
  { propertyName : "RestSeconds", label : "Rest seconds" , placeholder : "Rest seconds"}, 
];

const WorkoutDayExerciseForm = forwardRef(({
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
  formItem?: Partial<Workoutdayexercise>,
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
    values: Partial<Workoutdayexercise>,
    errors: FormikErrors<Workoutdayexercise>
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
  const error = useSelector(workoutDayExerciseErrorSelector);
  const workoutDayExerciseItem = useSelector(workoutDayExerciseSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Workoutdayexercise> = {
      WorkoutDay: workoutDayExerciseItem?.WorkoutDay || formItem?.WorkoutDay || undefined,
      Exercise: workoutDayExerciseItem?.Exercise || formItem?.Exercise || undefined,
      SetType: workoutDayExerciseItem?.SetType || formItem?.SetType || undefined,
      RestSeconds: workoutDayExerciseItem?.RestSeconds || formItem?.RestSeconds || undefined,
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
    return workoutDayExerciseItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (workoutDayExerciseItem?.Id) return { Id: workoutDayExerciseItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Workoutdayexercise>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Exercise: Yup.string().required(textValues?.requiredText || 'Required'),
        SetType: Yup.string().required(textValues?.requiredText || 'Required'),
        RestSeconds: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (workoutDayExercise) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...workoutDayExercise, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateWorkoutDayExercise(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createWorkoutDayExercise(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteWorkoutDayExercise(workoutDayExerciseItem?.Id as number));
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
      dispatch(clearWorkoutDayExerciseError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.workoutDayExerciseForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-WorkoutDayExercise-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout Day Exercise` : saveButtonText ? saveButtonText : `Save Workout Day Exercise`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkoutDayExercise"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout Day Exercise`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      
        <ExerciseOption  style={style} formik={formik}  label={returnCorrectTextValue("Exercise", "label")}
        selectText={returnCorrectTextValue("Exercise", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Exercise') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'Exercise').map((fa) => {
            return fa.el;
          })}
        
        <SetTypeOption  style={style} formik={formik}  label={returnCorrectTextValue("SetType", "label")}
        selectText={returnCorrectTextValue("SetType", "placeholder")}
        editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('SetType') !== -1 ? false : true)}
        type={"single"}
        />
        
          {fieldAppendees?.filter((f) => f.fieldName === 'SetType').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('RestSeconds') !== -1 ? false : true)}
            multiline={fieldConfig['RestSeconds']?.multiline ? fieldConfig['RestSeconds'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['RestSeconds']?.numberOfLines ? fieldConfig['RestSeconds'].numberOfLines : 1}
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
            testID="RestSeconds"
            placeholder={ returnCorrectTextValue("RestSeconds", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("RestSeconds", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("RestSeconds")}
            value={formik.values.RestSeconds?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("RestSeconds", "label") }
            errorMessage={formik.touched.RestSeconds && formik.errors.RestSeconds}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'RestSeconds').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-WorkoutDayExercise-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout Day Exercise` : saveButtonText ? saveButtonText : `Save Workout Day Exercise`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkoutDayExercise"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout Day Exercise`}
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


export default WorkoutDayExerciseForm;
