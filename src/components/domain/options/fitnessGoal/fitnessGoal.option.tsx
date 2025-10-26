/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from 'src/components/common';


// @ts-ignore
import { Fitnessgoal } from "domain";
import styles from "./fitnessGoal.styles";
import { clearFitnessGoalItems, getFitnessGoals, fitnessGoalsSelector } from "src/redux/domain/features/fitnessGoal/collection-slice";

import { View, Text } from "react-native";
import {SelectBoxType} from "src/components/common/select";

const useCommonStyles = require('../../../../themes/form/styles/styles').default
const useTypographyStyles = require('../../../../themes/typography/styles/styles').default


export default function FitnessGoalOption({ formik, type, editable, label, selectText, style, }: { formik: any; editable?: boolean; type:SelectBoxType, label?: string; selectText?: string; style?: any;  }) {
  const commonStyles = useCommonStyles();
  const typographyStyles = useTypographyStyles();

  const dispatch = useDispatch();
  
  const fitnessGoalItems: Fitnessgoal = useSelector(fitnessGoalsSelector);
  

  const [reRender, setReRender] = useState(0);
  const [zIndex, setZIndex] = React.useState(2)

  
  useEffect(() => {
    dispatch(getFitnessGoals({}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  

  

  return (
    <View style={{zIndex, width: "100%"}}>
      <Fragment>
          <Select
            key={`_FitnessGoal_${reRender}`}
            style={[styles.picker,{ zIndex }, style?.select]}
            dropdownStyle={[{ backgroundColor: 'transparent' }, style?.dropdownStyle]}
            value={formik.values.FitnessGoal || (type !== 'single' ? [] : -1)}
            placeholder={selectText}
            testID={"FitnessGoalPicker"}
            items={fitnessGoalItems ? fitnessGoalItems.map((o: Fitnessgoal) => ({
              label: o.Name,
              value: o.Id
            })) : []}
            setValue={(itemValue) => {
            
              if (itemValue === -1 && formik.values.FitnessGoal) {
                formik.setFieldValue("FitnessGoal", undefined, true);
                setReRender(reRender + 1);
              } else {
                formik.setFieldValue("FitnessGoal", itemValue, true);
              }
              
            
            }}
            onOpen={() => setZIndex(10)}
            onClose={() => setZIndex(1)}
            iconColor="black"
            disabled={!editable}
            iconSize={24}
            label={label}
            inputLabelStyle={style?.inputLabelStyle}
            errorMessage= {formik.touched.FitnessGoal && formik.errors.FitnessGoal}
            errorPlace={'bottomRight'}
            type={type}
          />
      </Fragment>
    </View>
  );
}