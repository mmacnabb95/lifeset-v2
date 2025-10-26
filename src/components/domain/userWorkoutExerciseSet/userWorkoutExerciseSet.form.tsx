/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Userworkoutexerciseset } from "domain";
import { createUserWorkoutExerciseSet, updateUserWorkoutExerciseSet, deleteUserWorkoutExerciseSet, userWorkoutExerciseSetErrorSelector, userWorkoutExerciseSetSelector , clearUserWorkoutExerciseSetError } from "src/redux/domain/features/userWorkoutExerciseSet/collection-slice";
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
  { propertyName : "WeightKg", label : "Weight kg" , placeholder : "Weight kg"}, 
  { propertyName : "TimeSeconds", label : "Time seconds" , placeholder : "Time seconds"}, 
];

const UserWorkoutExerciseSetForm = forwardRef(({
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
  formItem?: Partial<Userworkoutexerciseset>,
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
    values: Partial<Userworkoutexerciseset>,
    errors: FormikErrors<Userworkoutexerciseset>
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
  const error = useSelector(userWorkoutExerciseSetErrorSelector);
  const userWorkoutExerciseSetItem = useSelector(userWorkoutExerciseSetSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Userworkoutexerciseset> = {
      UserWorkout: userWorkoutExerciseSetItem?.UserWorkout || formItem?.UserWorkout || undefined,
      User: userWorkoutExerciseSetItem?.User || formItem?.User || undefined,
      WorkoutExerciseSet: userWorkoutExerciseSetItem?.WorkoutExerciseSet || formItem?.WorkoutExerciseSet || undefined,
      WorkoutDay: userWorkoutExerciseSetItem?.WorkoutDay || formItem?.WorkoutDay || undefined,
      DayNumber: userWorkoutExerciseSetItem?.DayNumber || formItem?.DayNumber || undefined,
      WeightKg: userWorkoutExerciseSetItem?.WeightKg || formItem?.WeightKg || undefined,
      TimeSeconds: userWorkoutExerciseSetItem?.TimeSeconds || formItem?.TimeSeconds || undefined,
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
    return userWorkoutExerciseSetItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (userWorkoutExerciseSetItem?.Id) return { Id: userWorkoutExerciseSetItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Userworkoutexerciseset>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        ...injectedValidationSchema,
    }),
    onSubmit: async (userWorkoutExerciseSet) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...userWorkoutExerciseSet, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateUserWorkoutExerciseSet(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createUserWorkoutExerciseSet(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteUserWorkoutExerciseSet(userWorkoutExerciseSetItem?.Id as number));
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
      dispatch(clearUserWorkoutExerciseSetError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.userWorkoutExerciseSetForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkoutExerciseSet-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout Exercise Set` : saveButtonText ? saveButtonText : `Save User Workout Exercise Set`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkoutExerciseSet"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout Exercise Set`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('WeightKg') !== -1 ? false : true)}
            multiline={fieldConfig['WeightKg']?.multiline ? fieldConfig['WeightKg'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['WeightKg']?.numberOfLines ? fieldConfig['WeightKg'].numberOfLines : 1}
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
            testID="WeightKg"
            placeholder={ returnCorrectTextValue("WeightKg", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("WeightKg", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("WeightKg")}
            value={formik.values.WeightKg?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("WeightKg", "label") }
            errorMessage={formik.touched.WeightKg && formik.errors.WeightKg}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'WeightKg').map((fa) => {
            return fa.el;
          })}
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('TimeSeconds') !== -1 ? false : true)}
            multiline={fieldConfig['TimeSeconds']?.multiline ? fieldConfig['TimeSeconds'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['TimeSeconds']?.numberOfLines ? fieldConfig['TimeSeconds'].numberOfLines : 1}
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
            testID="TimeSeconds"
            placeholder={ returnCorrectTextValue("TimeSeconds", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("TimeSeconds", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("TimeSeconds")}
            value={formik.values.TimeSeconds?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("TimeSeconds", "label") }
            errorMessage={formik.touched.TimeSeconds && formik.errors.TimeSeconds}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'TimeSeconds').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-UserWorkoutExerciseSet-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update User Workout Exercise Set` : saveButtonText ? saveButtonText : `Save User Workout Exercise Set`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteUserWorkoutExerciseSet"}
                title={deleteButtonText ? deleteButtonText : `Delete User Workout Exercise Set`}
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


export default UserWorkoutExerciseSetForm;
