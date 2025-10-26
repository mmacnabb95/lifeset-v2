/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from 'src/components/common';


// @ts-ignore
import { Habitpackhabitschedule } from "domain";
import styles from "./habitPackHabitSchedule.styles";
import { clearHabitPackHabitScheduleItems, getHabitPackHabitSchedules, habitPackHabitSchedulesSelector } from "src/redux/domain/features/habitPackHabitSchedule/collection-slice";

import { View, Text } from "react-native";
import {SelectBoxType} from "src/components/common/select";

const useCommonStyles = require('../../../../themes/form/styles/styles').default
const useTypographyStyles = require('../../../../themes/typography/styles/styles').default


export default function HabitPackHabitScheduleOption({ formik, type, editable, label, userhabitpackhabit, selectText, style, }: { formik: any; editable?: boolean; type:SelectBoxType, label?: string, userhabitpackhabit: any; selectText?: string; style?: any;  }) {
  const commonStyles = useCommonStyles();
  const typographyStyles = useTypographyStyles();

  const dispatch = useDispatch();
  
  const habitPackHabitScheduleItems: Habitpackhabitschedule = useSelector(habitPackHabitSchedulesSelector);
  

  const [reRender, setReRender] = useState(0);
  const [zIndex, setZIndex] = React.useState(2)

  
  useEffect(() => {
    dispatch(getHabitPackHabitSchedules({userhabitpackhabit,}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  

  

  return (
    <View style={{zIndex, width: "100%"}}>
      <Fragment>
          <Select
            key={`_HabitPackHabitSchedule_${reRender}`}
            style={[styles.picker,{ zIndex }, style?.select]}
            dropdownStyle={[{ backgroundColor: 'transparent' }, style?.dropdownStyle]}
            value={formik.values.HabitPackHabitSchedule || (type !== 'single' ? [] : -1)}
            placeholder={selectText}
            testID={"HabitPackHabitSchedulePicker"}
            items={habitPackHabitScheduleItems ? habitPackHabitScheduleItems.map((o: Habitpackhabitschedule) => ({
              label: o.Name,
              value: o.Id
            })) : []}
            setValue={(itemValue) => {
            
              if (itemValue === -1 && formik.values.HabitPackHabitSchedule) {
                formik.setFieldValue("HabitPackHabitSchedule", undefined, true);
                setReRender(reRender + 1);
              } else {
                formik.setFieldValue("HabitPackHabitSchedule", itemValue, true);
              }
              
            
            }}
            onOpen={() => setZIndex(10)}
            onClose={() => setZIndex(1)}
            iconColor="black"
            disabled={!editable}
            iconSize={24}
            label={label}
            inputLabelStyle={style?.inputLabelStyle}
            errorMessage= {formik.touched.HabitPackHabitSchedule && formik.errors.HabitPackHabitSchedule}
            errorPlace={'bottomRight'}
            type={type}
          />
      </Fragment>
    </View>
  );
}