/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from 'src/components/common';


// @ts-ignore
import { Workoutlocation } from "domain";
import styles from "./workoutLocation.styles";
import { clearWorkoutLocationItems, getWorkoutLocations, workoutLocationsSelector } from "src/redux/domain/features/workoutLocation/collection-slice";

import { View, Text } from "react-native";
import {SelectBoxType} from "src/components/common/select";

const useCommonStyles = require('../../../../themes/form/styles/styles').default
const useTypographyStyles = require('../../../../themes/typography/styles/styles').default


export default function WorkoutLocationOption({ formik, type, editable, label, selectText, style, }: { formik: any; editable?: boolean; type:SelectBoxType, label?: string; selectText?: string; style?: any;  }) {
  const commonStyles = useCommonStyles();
  const typographyStyles = useTypographyStyles();

  const dispatch = useDispatch();
  
  const workoutLocationItems: Workoutlocation = useSelector(workoutLocationsSelector);
  

  const [reRender, setReRender] = useState(0);
  const [zIndex, setZIndex] = React.useState(2)

  
  useEffect(() => {
    dispatch(getWorkoutLocations({}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  

  

  return (
    <View style={{zIndex, width: "100%"}}>
      <Fragment>
          <Select
            key={`_WorkoutLocation_${reRender}`}
            style={[styles.picker,{ zIndex }, style?.select]}
            dropdownStyle={[{ backgroundColor: 'transparent' }, style?.dropdownStyle]}
            value={formik.values.WorkoutLocation || (type !== 'single' ? [] : -1)}
            placeholder={selectText}
            testID={"WorkoutLocationPicker"}
            items={workoutLocationItems ? workoutLocationItems.map((o: Workoutlocation) => ({
              label: o.Name,
              value: o.Id
            })) : []}
            setValue={(itemValue) => {
            
              if (itemValue === -1 && formik.values.WorkoutLocation) {
                formik.setFieldValue("WorkoutLocation", undefined, true);
                setReRender(reRender + 1);
              } else {
                formik.setFieldValue("WorkoutLocation", itemValue, true);
              }
              
            
            }}
            onOpen={() => setZIndex(10)}
            onClose={() => setZIndex(1)}
            iconColor="black"
            disabled={!editable}
            iconSize={24}
            label={label}
            inputLabelStyle={style?.inputLabelStyle}
            errorMessage= {formik.touched.WorkoutLocation && formik.errors.WorkoutLocation}
            errorPlace={'bottomRight'}
            type={type}
          />
      </Fragment>
    </View>
  );
}