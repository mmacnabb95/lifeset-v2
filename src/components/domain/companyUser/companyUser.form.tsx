/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';

import { useDispatch, useSelector } from "react-redux";
import { Toggle } from "src/components/common";
// @ts-ignore
import { Companyuser } from "domain";
import { createCompanyUser, updateCompanyUser, deleteCompanyUser, companyUserErrorSelector, companyUserSelector , clearCompanyUserError } from "src/redux/domain/features/companyUser/collection-slice";
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
  { propertyName : "Email", label : "Email" , placeholder : "Email"}, 
  { propertyName : "Manager", label : "Manager" , placeholder : "Manager"}, 
];

const CompanyUserForm = forwardRef(({
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
  formItem?: Partial<Companyuser>,
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
    values: Partial<Companyuser>,
    errors: FormikErrors<Companyuser>
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
  const error = useSelector(companyUserErrorSelector);
  const companyUserItem = useSelector(companyUserSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);

  
  const initialValues: Partial<Companyuser> = {
      Company: companyUserItem?.Company || formItem?.Company || undefined,
      Email: companyUserItem?.Email || formItem?.Email || '',
      Manager: companyUserItem?.Manager || formItem?.Manager || false,
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
    return companyUserItem || (formItem && formItem?.Id && formItem.Id > 0) ? true : false;
  };

  const getItemId = () => {
    if (companyUserItem?.Id) return { Id: companyUserItem?.Id };
    return {};
  }

  useImperativeHandle(ref, () => (formik));

  const formik = useFormik<Partial<Companyuser>>({
    initialValues: { ...initialValues, ...formItem },
    validationSchema: Yup.object({
        Email: Yup.string().email().required(textValues?.requiredText || 'Required'),
        ...injectedValidationSchema,
    }),
    onSubmit: async (companyUser) => {
      let response:any;
      if (itemExists()) {
        const updateObjectFull = { ...companyUser, ...getItemId() } ;
        const updateObjectIgnored = _.omit(updateObjectFull, ["HasVideo", "HasImage", ]);
        response = await dispatch(updateCompanyUser(updateObjectIgnored));

        if(afterUpdate) afterUpdate({...response, isValid});
      } else {
        response = await dispatch(createCompanyUser(_.omit(formik.values, ["HasVideo", "HasImage"])));

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
        const response: any = await dispatch(deleteCompanyUser(companyUserItem?.Id as number));
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
      dispatch(clearCompanyUserError());
    }, [dispatch]),
  );

  return (
    <View style={[formStyles.form, cmsStyles?.companyUserForm, style?.form]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa) => {
        return fa.el;
      })}
      { buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-CompanyUser-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Company User` : saveButtonText ? saveButtonText : `Save Company User`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteCompanyUser"}
                title={deleteButtonText ? deleteButtonText : `Delete Company User`}
                titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextDanger]}
                style={[buttonStyles[ButtonTypes.Delete], formStyles.button, style?.deleteButton]}
                type={ButtonTypes.Danger}
              />
            )}
          </View>
      )}
      

          <Input
            editable={viewOnly === true ? false : (readOnly && readOnly.indexOf('Email') !== -1 ? false : true)}
            multiline={fieldConfig['Email']?.multiline ? fieldConfig['Email'].multiline  : windowWidth > mobileBreak ? false : false}
            numberOfLines={fieldConfig['Email']?.numberOfLines ? fieldConfig['Email'].numberOfLines : 1}
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
            testID="Email"
            placeholder={ returnCorrectTextValue("Email", "placeholder") }
            onChangeText={(text) => {
              formik.setFieldValue("Email", text, true)
            }}
            onBlur={formik.handleBlur("Email")}
            value={formik.values.Email?.toString()  || ""}
            onKeyPress={handleKeyDown}
            label={ returnCorrectTextValue("Email", "label") }
            errorMessage={formik.touched.Email && formik.errors.Email}
            errorPlace={'centerRight'}
            maxLength={200}
          />

        
          {fieldAppendees?.filter((f) => f.fieldName === 'Email').map((fa) => {
            return fa.el;
          })}
        


        <Toggle
          label={returnCorrectTextValue("Manager", "label")}
          testID={"company-user-manager"}
          enabled={formik.values.Manager}
          onChange={(value) => formik.setFieldValue("Manager", value, true)}
          labelStyle={style?.toggleLabel}
          disabled={viewOnly === true ? true : (readOnly && readOnly.indexOf('Manager') !== -1 ? true : false)}
          errorMessage={formik.errors.Manager}
        />


        
          {fieldAppendees?.filter((f) => f.fieldName === 'Manager').map((fa) => {
            return fa.el;
          })}
        

        {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa) => {
          return fa.el;
        })}

        { !hideButtons && !buttonsTop && (
          <View style={[formStyles.buttons, style?.buttons]}>
            <Button
              onPress={() => formik.handleSubmit()}
              testID={"submit-CompanyUser-form"}
              title={itemExists() ? updateButtonText ? updateButtonText : `Update Company User` : saveButtonText ? saveButtonText : `Save Company User`}
              titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
              style={[formStyles.button, style?.submitFormButton]}
              type={ButtonTypes.Primary}
              loading={formik.isSubmitting}
            />
            {!hideDeleteButton && itemExists() && (
              <Button
                onPress={handleDelete}
                testID={"deleteCompanyUser"}
                title={deleteButtonText ? deleteButtonText : `Delete Company User`}
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


export default CompanyUserForm;
