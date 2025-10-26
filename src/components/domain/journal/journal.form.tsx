/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useImperativeHandle, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { Journal } from "../../../../../types/domain/flat-types";
import { createJournal, updateJournal, deleteJournal, journalErrorSelector, journalSelector, clearJournalError } from "src/redux/domain/features/journal/collection-slice";
import { View, Text } from "react-native";
import { ButtonTypes } from "src/components/common/button";
import { Input, Button } from "src/components/common";
import commonConstants from "src/themes/constants";
import { useFocusEffect } from "@react-navigation/native";
import { useXPRewards } from '../../../useXPRewards';

// Import styles using require to maintain compatibility
const useCmsStyles = require("../../../themes/cms/styles/styles").default;
const useFormStyles = require("../../../themes/form/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;
const useButtonStyles = require("../../../themes/button/styles/styles").default;
const useLayoutStyles = require("../../../themes/layout/styles/styles").default;
const useCommonTypographyStyles = require("../../../themes/typography/styles/styles").default;
import { TypographyTypes } from "src/components/common/typography";

// Move interfaces and types to the top
interface DefaultTextValues {
  propertyName: string;
  label: string;
  placeholder: string;
}

interface JournalFormProps {
  customTextValues?: DefaultTextValues[];
  afterCreate?: ({ response, isValid }: { response?: any; isValid?: any }) => void;
  afterCreateIdCallback?: (id: number) => void;
  afterUpdate?: ({ response, isValid }: { response?: any; isValid?: any }) => void;
  beforeDelete?: () => Promise<boolean>;
  afterDelete?: ({ response }: { response?: any }) => void;
  formItem?: Partial<Journal>;
  saveButtonText?: string;
  updateButtonText?: string;
  deleteButtonText?: string;
  hideButtons?: boolean;
  hideDeleteButton?: boolean;
  fieldAppendees?: { el: ReactNode; fieldName: string }[];
  readOnly?: string[];
  isValid?: any;
  textValues?: { [index: string]: string };
  style?: any;
  viewOnly?: boolean;
  injectedValidationSchema?: any;
  fieldConfig?: Record<string, { multiline?: boolean; numberOfLines?: number }>;
  buttonsTop?: boolean;
  handleValuesChange?: ({
    values,
    errors,
  }: {
    values: Partial<Journal>;
    errors: FormikErrors<Journal>;
  }) => void;
}

// Memoize validation schema and default text values
const validationSchema = Yup.object().shape({
  Title: Yup.string().required('Title is required'),
  Content: Yup.string().required('Content is required'),
});

export const defaultTextValues: DefaultTextValues[] = [
  { propertyName: "Title", label: "Title", placeholder: "Give your entry a title..." },
  { propertyName: "Content", label: "", placeholder: "Write your thoughts here..." },
];

// Update the static styles
const staticStyles = {
  formContainer: {
    flex: 1,
    marginTop: 0,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginBottom: 16,
    marginTop: 0,
    paddingHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: commonConstants.primaryColor,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: {
    color: commonConstants.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    marginLeft: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dangerButtonText: {
    color: commonConstants.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentInput: {
    backgroundColor: commonConstants.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    height: 250,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  contentInputFocused: {
    borderColor: commonConstants.primaryColor,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  titleInput: {
    backgroundColor: commonConstants.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 12,
    fontWeight: '500',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleInputFocused: {
    borderColor: commonConstants.primaryColor,
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    position: 'absolute' as const,
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#848484',
  }
};

const JournalForm = forwardRef<any, JournalFormProps>(({
  customTextValues,
  afterCreate,
  afterCreateIdCallback,
  afterUpdate,
  beforeDelete,
  afterDelete,
  formItem,
  saveButtonText = 'Save Journal',
  updateButtonText = 'Update Journal',
  deleteButtonText = 'Delete Journal',
  hideButtons,
  hideDeleteButton,
  fieldAppendees,
  readOnly,
  isValid,
  style,
  viewOnly,
  injectedValidationSchema,
  fieldConfig = {},
  buttonsTop = false,
  handleValuesChange,
}, ref) => {
  const dispatch = useDispatch();
  const error = useSelector(journalErrorSelector);
  const journalItem = useSelector(journalSelector(formItem?.Id));
  const [currentTextValues, setCurrentTextValues] = useState(defaultTextValues);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const { handleJournalCreation } = useXPRewards();

  // Use hooks for styles
  const cmsStyles = useCmsStyles();
  const formStyles = useFormStyles();
  const buttonStyles = useButtonStyles();
  const layoutStyles = useLayoutStyles();
  const commonTypographyStyles = useCommonTypographyStyles();

  // Memoize initial values
  const initialValues = useMemo(() => ({
    User: journalItem?.User || formItem?.User || undefined,
    Category: journalItem?.Category || formItem?.Category || '',
    CreatedAt: journalItem?.CreatedAt || formItem?.CreatedAt || '',
    Title: journalItem?.Title || formItem?.Title || '',
    Content: journalItem?.Content || formItem?.Content || '',
  }), [journalItem, formItem]);

  const handleSubmit = useCallback(async (values: Partial<Journal>) => {
    try {
      const submissionValues = {
        ...values,
        Category: formItem?.Category || values.Category
      };

      if (journalItem || (formItem?.Id && formItem.Id > 0)) {
        const result = await dispatch(updateJournal({ ...submissionValues, Id: journalItem?.Id })).unwrap();
        afterUpdate?.({ response: result, isValid });
      } else {
        const result = await dispatch(createJournal(submissionValues)).unwrap();
        handleJournalCreation();
        afterCreate?.({ response: result, isValid });
        if (afterCreateIdCallback && result?.Id) {
          afterCreateIdCallback(result.Id);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while saving the journal entry';
      const response = { error: errorMessage };
      if (journalItem || (formItem?.Id && formItem.Id > 0)) {
        afterUpdate?.({ response, isValid });
      } else {
        afterCreate?.({ response, isValid });
      }
    }
  }, [dispatch, formItem, journalItem, afterCreate, afterUpdate, afterCreateIdCallback, isValid, handleJournalCreation]);

  const formik = useFormik<Partial<Journal>>({
    initialValues,
    validationSchema: injectedValidationSchema ? Yup.object(injectedValidationSchema) : validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: false
  });

  const handleDelete = useCallback(async () => {
    try {
      if (!beforeDelete || (await beforeDelete()) === true) {
        const result = await dispatch(deleteJournal(journalItem?.Id as number)).unwrap();
        afterDelete?.({ response: result });
      }
    } catch (error: any) {
      afterDelete?.({ response: { error: error.message } });
    }
  }, [dispatch, journalItem?.Id, beforeDelete, afterDelete]);

  const changeTextToCustomValue = useCallback((newValues: any) => {
    setCurrentTextValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues.forEach((e: any) => {
        const _search = newValues.filter((f: any) => f.propertyName === e.propertyName);
        if (_search.length > 0) {
          if (_search[0].label) e.label = _search[0].label;
          if (_search[0].placeholder) e.placeholder = _search[0].placeholder;
        }
      });
      return updatedValues;
    });
  }, []);

  const returnCorrectTextValue = useCallback((propertyName: string, location: string) => {
    return currentTextValues.find(e => e.propertyName === propertyName)?.[location as keyof DefaultTextValues] || '';
  }, [currentTextValues]);

  useEffect(() => {
    if (customTextValues?.length) changeTextToCustomValue(customTextValues);
  }, [customTextValues, changeTextToCustomValue]);

  useEffect(() => {
    handleValuesChange?.({ values: formik.values, errors: formik.errors });
  }, [formik.values, formik.errors, handleValuesChange]);

  useImperativeHandle(ref, () => formik, [formik]);

  useFocusEffect(
    useCallback(() => {
      dispatch(clearJournalError());
    }, [dispatch])
  );

  return (
    <View style={[formStyles.form, layoutStyles.parentForm, cmsStyles?.journalForm, style?.form, staticStyles.formContainer]}>
      {fieldAppendees?.filter((f) => f.fieldName === 'FormTop').map((fa, index) => {
        return React.cloneElement(fa.el as React.ReactElement, { key: `form-top-${index}` });
      })}

      {buttonsTop && (
        <View style={[formStyles.buttons, style?.buttons, staticStyles.buttonsContainer]}>
          <Button
            onPress={() => formik.handleSubmit()}
            testID={"submit-Journal-form"}
            title={journalItem ? updateButtonText || `Update Entry` : saveButtonText || `Save Entry`}
            style={[staticStyles.primaryButton, style?.submitFormButton]}
            titleStyle={staticStyles.primaryButtonText}
            type={ButtonTypes.Primary}
            loading={formik.isSubmitting}
          />
          {!hideDeleteButton && journalItem && (
            <Button
              onPress={handleDelete}
              testID={"deleteJournal"}
              title={deleteButtonText || `Delete Entry`}
              style={[staticStyles.dangerButton, style?.deleteButton]}
              titleStyle={staticStyles.dangerButtonText}
              type={ButtonTypes.Danger}
            />
          )}
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <Input
          editable={viewOnly === true ? false : readOnly && readOnly.indexOf('Title') !== -1 ? false : true}
          multiline={fieldConfig['Title']?.multiline || false}
          numberOfLines={fieldConfig['Title']?.numberOfLines || 1}
          style={[
            style?.input,
            staticStyles.titleInput,
            isTitleFocused && staticStyles.titleInputFocused,
          ]}
          testID="Title"
          placeholder={returnCorrectTextValue("Title", "placeholder")}
          onChangeText={(text) => formik.setFieldValue("Title", text, true)}
          onBlur={() => {
            formik.handleBlur("Title");
            setIsTitleFocused(false);
          }}
          onFocus={() => setIsTitleFocused(true)}
          value={formik.values.Title?.toString() || ""}
          label={returnCorrectTextValue("Title", "label")}
          maxLength={400}
        />
        {formik.touched.Title && formik.errors.Title && (
          <Text style={staticStyles.errorText}>{formik.errors.Title}</Text>
        )}
      </View>

      <View style={{ position: 'relative', height: 250 }}>
        <Input
          editable={viewOnly === true ? false : readOnly && readOnly.indexOf('Content') !== -1 ? false : true}
          multiline={true}
          numberOfLines={20}
          style={[
            style?.input,
            staticStyles.contentInput,
            isContentFocused && staticStyles.contentInputFocused
          ]}
          testID="Content"
          placeholder={returnCorrectTextValue("Content", "placeholder")}
          onChangeText={(text) => formik.setFieldValue("Content", text, true)}
          onBlur={() => {
            formik.handleBlur("Content");
            setIsContentFocused(false);
          }}
          onFocus={() => setIsContentFocused(true)}
          value={formik.values.Content?.toString() || ""}
          maxLength={4000}
          textAlignVertical="top"
          scrollEnabled={true}
          placeholderTextColor="#848484"
          inputStyle={{
            height: '100%',
            textAlignVertical: 'top',
            paddingTop: 0,
            fontSize: 16
          }}
        />
        {formik.touched.Content && formik.errors.Content && (
          <Text style={staticStyles.errorText}>{formik.errors.Content}</Text>
        )}
        <Text style={staticStyles.characterCount}>
          {`${formik.values.Content?.length || 0}/4000`}
        </Text>
      </View>

      {fieldAppendees?.filter((f) => f.fieldName === 'Content').map((fa, index) => {
        return React.cloneElement(fa.el as React.ReactElement, { key: `content-${index}` });
      })}

      {fieldAppendees?.filter((f) => f.fieldName === 'FormBottom').map((fa, index) => {
        return React.cloneElement(fa.el as React.ReactElement, { key: `form-bottom-${index}` });
      })}

      {!hideButtons && !buttonsTop && (
        <View style={[formStyles.buttons, style?.buttons, staticStyles.buttonsContainer]}>
          <Button
            onPress={() => formik.handleSubmit()}
            testID={"submit-Journal-form"}
            title={journalItem ? updateButtonText || `Update Entry` : saveButtonText || `Save Entry`}
            style={[staticStyles.primaryButton, style?.submitFormButton]}
            titleStyle={staticStyles.primaryButtonText}
            type={ButtonTypes.Primary}
            loading={formik.isSubmitting}
          />
          {!hideDeleteButton && journalItem && (
            <Button
              onPress={handleDelete}
              testID={"deleteJournal"}
              title={deleteButtonText || `Delete Entry`}
              style={[staticStyles.dangerButton, style?.deleteButton]}
              titleStyle={staticStyles.dangerButtonText}
              type={ButtonTypes.Danger}
            />
          )}
        </View>
      )}
      
      {error && (
        <View style={{ marginTop: 12 }}>
          <Text style={staticStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

export default React.memo(JournalForm);
