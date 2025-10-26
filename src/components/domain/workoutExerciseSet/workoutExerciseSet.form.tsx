/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Workoutexerciseset } from "domain";
import { createWorkoutExerciseSet, updateWorkoutExerciseSet, deleteWorkoutExerciseSet, workoutExerciseSetErrorSelector, workoutExerciseSetSelector , clearWorkoutExerciseSetError } from "src/redux/domain/features/workoutExerciseSet/collection-slice";
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
  { propertyName : "SetNumber", label : "Set number" , placeholder : "Set number"}, 
  { propertyName : "RepCount", label : "Rep count" , placeholder : "Rep count"}, 
  { propertyName : "RepTimeSeconds", label : "Rep time seconds" , placeholder : "Rep time seconds"}, 
];

const WorkoutExerciseSetForm = forwardRef(({
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
  formItem?: Partial<Workoutexerciseset>,
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
    values: Partial<Workoutexerciseset>,
    errors: FormikErrors<Workoutexerciseset>
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
  const error = useSelector(workoutExerciseSetErrorSelector);
  const workoutExerciseSetItem = useSelector(workoutExerciseSetSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Workoutexerciseset> = {
      WorkoutDayExercise: workoutExerciseSetItem?.WorkoutDayExercise || formItem?.WorkoutDayExercise || undefined,
      SetNumber: workoutExerciseSetItem?.SetNumber || formItem?.SetNumber || undefined,
      RepCount: workoutExerciseSetItem?.RepCount || formItem?.RepCount || undefined,
      RepTimeSeconds: workoutExerciseSetItem?.RepTimeSeconds || formItem?.RepTimeSeconds || undefined,
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
    return workoutExerciseSetItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (workoutExerciseSetItem?.Id) return { Id: workoutExerciseSetItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Workoutexerciseset>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        SetNumber: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (workoutExerciseSet) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...workoutExerciseSet, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateWorkoutExerciseSet(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createWorkoutExerciseSet(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteWorkoutExerciseSet(workoutExerciseSetItem?.Id as number));
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
      dispatch(clearWorkoutExerciseSetError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.workoutExerciseSetForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-WorkoutExerciseSet-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout Exercise Set` : saveButtonText ? saveButtonText : `Save Workout Exercise Set`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkoutExerciseSet"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout Exercise Set`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('SetNumber') !== -1 ? false : true)}
            multiline={fieldConfig['SetNumber']?.multiline ? fieldConfig['SetNumber'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['SetNumber']?.numberOfLines ? fieldConfig['SetNumber'].numberOfLines : 1}
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
            testID="SetNumber"
            placeholder={ returnCorrectTextValue("SetNumber", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("SetNumber", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("SetNumber")}
            value={formik.values.SetNumber?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("SetNumber", "label") }
            errorMessage={formik.touched.SetNumber && formik.errors.SetNumber}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'SetNumber').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('RepCount') !== -1 ? false : true)}
            multiline={fieldConfig['RepCount']?.multiline ? fieldConfig['RepCount'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['RepCount']?.numberOfLines ? fieldConfig['RepCount'].numberOfLines : 1}
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
            testID="RepCount"
            placeholder={ returnCorrectTextValue("RepCount", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("RepCount", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("RepCount")}
            value={formik.values.RepCount?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("RepCount", "label") }
            errorMessage={formik.touched.RepCount && formik.errors.RepCount}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'RepCount').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('RepTimeSeconds') !== -1 ? false : true)}
            multiline={fieldConfig['RepTimeSeconds']?.multiline ? fieldConfig['RepTimeSeconds'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['RepTimeSeconds']?.numberOfLines ? fieldConfig['RepTimeSeconds'].numberOfLines : 1}
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
            testID="RepTimeSeconds"
            placeholder={ returnCorrectTextValue("RepTimeSeconds", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("RepTimeSeconds", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("RepTimeSeconds")}
            value={formik.values.RepTimeSeconds?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("RepTimeSeconds", "label") }
            errorMessage={formik.touched.RepTimeSeconds && formik.errors.RepTimeSeconds}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'RepTimeSeconds').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-WorkoutExerciseSet-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Workout Exercise Set` : saveButtonText ? saveButtonText : `Save Workout Exercise Set`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteWorkoutExerciseSet"}
                title={deleteButtonText ? deleteButtonText : `Delete Workout Exercise Set`}
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


export default WorkoutExerciseSetForm;
