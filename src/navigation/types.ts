import { RouteProp, ParamListBase } from "@react-navigation/native";

export interface NavProps {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}
