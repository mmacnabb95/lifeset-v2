import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from 'src/components/common/config/formInjection/getAppendees';
import { RootState } from 'src/redux/store';
import { FormScreen } from 'src/components/common/form/formScreen';

export const HabitEditScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const formRef = useRef(null);
  const state = useSelector((state: RootState) => state);
  
  return (
    <FormScreen
      navigation={navigation}
      route={route}
      formRef={formRef}
      sourceName="Habit"
      buttonsTop={true}
      getConfig={(sourceName, source) => 
        getConfig(sourceName, source, formRef, navigation, route, state)
      }
    />
  );
};

export default HabitEditScreen; 