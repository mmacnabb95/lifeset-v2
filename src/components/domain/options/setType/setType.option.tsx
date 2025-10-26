/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from 'src/components/common';


// @ts-ignore
import { Settype } from "domain";
import styles from "./setType.styles";
import { clearSetTypeItems, getSetTypes, setTypesSelector } from "src/redux/domain/features/setType/collection-slice";

import { View, Text } from "react-native";
import {SelectBoxType} from "src/components/common/select";

const useCommonStyles = require('../../../../themes/form/styles/styles').default
const useTypographyStyles = require('../../../../themes/typography/styles/styles').default


export default function SetTypeOption({ formik, type, editable, label, selectText, style, }: { formik: any; editable?: boolean; type:SelectBoxType, label?: string; selectText?: string; style?: any;  }) {
  const commonStyles = useCommonStyles();
  const typographyStyles = useTypographyStyles();

  const dispatch = useDispatch();
  
  const setTypeItems: Settype = useSelector(setTypesSelector);
  

  const [reRender, setReRender] = useState(0);
  const [zIndex, setZIndex] = React.useState(2)

  
  useEffect(() => {
    dispatch(getSetTypes({}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  

  

  return (
    <View style={{zIndex, width: "100%"}}>
      <Fragment>
          <Select
            key={`_SetType_${reRender}`}
            style={[styles.picker,{ zIndex }, style?.select]}
            dropdownStyle={[{ backgroundColor: 'transparent' }, style?.dropdownStyle]}
            value={formik.values.SetType || (type !== 'single' ? [] : -1)}
            placeholder={selectText}
            testID={"SetTypePicker"}
            items={setTypeItems ? setTypeItems.map((o: Settype) => ({
              label: o.Name,
              value: o.Id
            })) : []}
            setValue={(itemValue) => {
            
              if (itemValue === -1 && formik.values.SetType) {
                formik.setFieldValue("SetType", undefined, true);
                setReRender(reRender + 1);
              } else {
                formik.setFieldValue("SetType", itemValue, true);
              }
              
            
            }}
            onOpen={() => setZIndex(10)}
            onClose={() => setZIndex(1)}
            iconColor="black"
            disabled={!editable}
            iconSize={24}
            label={label}
            inputLabelStyle={style?.inputLabelStyle}
            errorMessage= {formik.touched.SetType && formik.errors.SetType}
            errorPlace={'bottomRight'}
            type={type}
          />
      </Fragment>
    </View>
  );
}