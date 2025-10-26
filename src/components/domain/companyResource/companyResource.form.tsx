/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";

// @ts-ignore
import { Companyresource } from "domain";
import { createCompanyResource, updateCompanyResource, deleteCompanyResource, companyResourceErrorSelector, companyResourceSelector , clearCompanyResourceError } from "src/redux/domain/features/companyResource/collection-slice";
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
  { propertyName : "Company", label : "Company" , placeholder : "Company"}, 
  { propertyName : "Key", label : "Key" , placeholder : "Key"}, 
  { propertyName : "Url", label : "Url" , placeholder : "Url"}, 
];

const CompanyResourceForm = forwardRef(({
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
  formItem?: Partial<Companyresource>,
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
    values: Partial<Companyresource>,
    errors: FormikErrors<Companyresource>
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
  const error = useSelector(companyResourceErrorSelector);
  const companyResourceItem = useSelector(companyResourceSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Companyresource> = {
      Company: companyResourceItem?.Company || formItem?.Company || undefined,
      Key: companyResourceItem?.Key || formItem?.Key || '',
      Url: companyResourceItem?.Url || formItem?.Url || '',
      Meta: companyResourceItem?.Meta || formItem?.Meta || '',
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
    return companyResourceItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (companyResourceItem?.Id) return { Id: companyResourceItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Companyresource>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Company: Yup.string().required(textValues?.requiredText || 'Required'),
        Key: Yup.string().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (companyResource) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...companyResource, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateCompanyResource(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createCompanyResource(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteCompanyResource(companyResourceItem?.Id as number));
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
      dispatch(clearCompanyResourceError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.companyResourceForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-CompanyResource-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Company Resource` : saveButtonText ? saveButtonText : `Save Company Resource`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteCompanyResource"}
                title={deleteButtonText ? deleteButtonText : `Delete Company Resource`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Company') !== -1 ? false : true)}
            multiline={fieldConfig['Company']?.multiline ? fieldConfig['Company'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Company']?.numberOfLines ? fieldConfig['Company'].numberOfLines : 1}
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
            testID="Company"
            placeholder={ returnCorrectTextValue("Company", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Company", text.replace(/[^0-9.]/g, ''), true);
              
            }}
            onBlur={formik.handleBlur("Company")}
            value={formik.values.Company?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Company", "label") }
            errorMessage={formik.touched.Company && formik.errors.Company}
            errorPlace={'centerRight'}
            
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Company').map((fa) => {
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
            multiline={fieldConfig['Url']?.multiline ? fieldConfig['Url'].multiline  : true}
            numberOfLines={fieldConfig['Url']?.numberOfLines ? fieldConfig['Url'].numberOfLines : 10}
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
            maxLength={4000}
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
              testID={"submit-CompanyResource-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Company Resource` : saveButtonText ? saveButtonText : `Save Company Resource`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteCompanyResource"}
                title={deleteButtonText ? deleteButtonText : `Delete Company Resource`}
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


export default CompanyResourceForm;
