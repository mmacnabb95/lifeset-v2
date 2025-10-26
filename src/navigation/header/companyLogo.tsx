import { useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FaderView } from "src/components/common/fader/faderView";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import commonStyles from "src/pages/home/styles/common.styles";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  companyLoading,
  companySelector,
  getCompany,
} from "src/redux/domain/features/company/collection-slice";

type Style = Record<string, string | number>;

export const CompanyLogo = ({ style }: { style?: Style[] | Style }) => {
  const route = useRoute();
  const dispatch = useDispatch();
  const { companyId, roles } = useUserInfo();
  const company = useSelector(companySelector(companyId));
  const loading = useSelector(companyLoading);

  useEffect(() => {
    if (companyId && !company && !loading) {
      dispatch(getCompany(companyId));
    }
  }, [company, companyId, dispatch, loading, roles]);

  const logoUrl = company?.resources?.find(
    (r: { Key: string }) => r.Key === "Logo",
  )?.Url;

  return (
    <View
      style={[{ height: 55, width: 55, marginLeft: 20, borderWidth: 0 }, style]}
    >
      {!!logoUrl && (
        <FaderView duration={400} visible={true} style={{ flex: 1 }}>
          <IkImageViewer
            // style={commonStyles.thumbnail}
            imagePath={logoUrl}
            // height={constants.thumbnailHeight}
            width={style?.width || 55}
            transform
          />
        </FaderView>
      )}
    </View>
  );
};
