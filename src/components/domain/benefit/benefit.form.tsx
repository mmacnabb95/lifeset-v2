/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Benefit } from "domain";
import { createBenefit, updateBenefit, deleteBenefit, benefitErrorSelector, benefitSelector , clearBenefitError } from "src/redux/domain/features/benefit/collection-slice";
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
  { propertyName : "Name", label : "Name" , placeholder : "Name"}, 
  { propertyName : "Description", label : "Description" , placeholder : "Description"}, 
  { propertyName : "Link", label : "Link" , placeholder : "Link"}, 
];

const BenefitForm = forwardRef(({
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
  formItem?: Partial<Benefit>,
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
    values: Partial<Benefit>,
    errors: FormikErrors<Benefit>
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
  const error = useSelector(benefitErrorSelector);
  const benefitItem = useSelector(benefitSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Benefit> = {
      Company: benefitItem?.Company || formItem?.Company || undefined,
      Name: benefitItem?.Name || formItem?.Name || '',
      Description: benefitItem?.Description || formItem?.Description || '',
      Link: benefitItem?.Link || formItem?.Link || '',
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
    return benefitItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (benefitItem?.Id) return { Id: benefitItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Benefit>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        ...injectedValidationSchema,
    }),
    onSubmit: async (benefit) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...benefit, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateBenefit(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createBenefit(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteBenefit(benefitItem?.Id as number));
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
      dispatch(clearBenefitError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.benefitForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Benefit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Benefit` : saveButtonText ? saveButtonText : `Save Benefit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteBenefit"}
                title={deleteButtonText ? deleteButtonText : `Delete Benefit`}
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
        

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Link') !== -1 ? false : true)}
            multiline={fieldConfig['Link']?.multiline ? fieldConfig['Link'].multiline  : true}
            numberOfLines={fieldConfig['Link']?.numberOfLines ? fieldConfig['Link'].numberOfLines : 10}
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
            testID="Link"
            placeholder={ returnCorrectTextValue("Link", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Link", text, true)
            }}
            onBlur={formik.handleBlur("Link")}
            value={formik.values.Link?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Link", "label") }
            errorMessage={formik.touched.Link && formik.errors.Link}
            errorPlace={'centerRight'}
            maxLength={2000}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Link').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-Benefit-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Benefit` : saveButtonText ? saveButtonText : `Save Benefit`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteBenefit"}
                title={deleteButtonText ? deleteButtonText : `Delete Benefit`}
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


export default BenefitForm;
