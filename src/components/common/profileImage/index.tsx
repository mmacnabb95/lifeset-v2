import React, { useState } from "react";
import { useWindowDimensions, View, Image } from "react-native";
import { useTranslation } from "src/translations/useTranslation";
import { triggerUploadPicture } from "src/lib/uploadFile";
import commonConstants from "src/themes/constants";
import { Typography, TypographyTypes } from "../typography";
import { uploadFile } from "../../../lib/imagekit/lib/imagekit";
import IkImageViewer from "src/lib/imagekit/screens/Fetch/ikImageViewer";
import { Settings } from "../../../../../types/domain/flat-types";
import { Loading } from "../loading/loading";

const useCommonStyles =
  require("../../../themes/profileImage/styles/styles").default;

interface Props {
  onUploaded?: (data: {
    url: string;
    key: string;
    meta?: string;
  }) => Promise<void>;
  onDeleted?: (id?: number, meta?: any) => Promise<void>;
  onUploading?: () => void;
  imageUrl: string;
  imageMeta: string;
  resourceLoading: boolean;
  viewOnly?: boolean;
  height?: number;
  width?: number;
}

const ProfileImage: React.FC<Props> = ({
  onUploaded,
  onUploading,
  onDeleted,
  imageUrl,
  imageMeta,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resourceLoading,
  viewOnly,
  height,
  width,
}) => {
  const commonStyles = useCommonStyles();
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [freshUpload, setFreshUpload] = useState<any>();
  const { t } = useTranslation();

  const mediaKey = "Photo";

  const meta = imageMeta ? JSON.parse(imageMeta) : "";

  // console.log("freshUpload?.filePath", freshUpload?.filePath)
  // console.log("meta?.filePath", meta?.filePath)

  return (
    <View testID="profile-image" style={commonStyles.container}>
      {!loading ? (
        <View key={imageUrl} testID="sub-profile-image" style={{ width: 51 }}>
          <IkImageViewer
            imageStyles={[commonStyles.imageStyles]}
            style={[commonStyles.imageContainer]}
            imagePath={freshUpload?.filePath || meta?.filePath}
            height={height || 61}
            width={width || 61}
            openFileSelector={async () => {
              setLoading(true);
              await triggerUploadPicture({ onUploaded, key: mediaKey }); //TODO: onuploaded isn't async! i.e. hence timout below
              setTimeout(() => setLoading(false), 4000);
            }}
            deleteResource={async (id?: number, meta?: any) => {
              setLoading(true);
              await onDeleted!(id, meta); //TODO: onDeleted isn't async! i.e. hence timout below
              setTimeout(() => setLoading(false), 2000);
            }}
            editButtonsStyle={[
              { right: -100 },
              viewOnly ? { display: "none" } : {},
            ]}
            transform
          />
          <>
            {!loading && !meta?.filePath && !freshUpload?.filePath && (
              <Image
                style={[
                  {
                    height: height || 61,
                    width: width || 61,
                    borderRadius: 85,
                    top: 0,
                    left: width ? 0 : -5,
                    position: "absolute",
                  },
                ]}
                source={require("../../../../assets/blank-profile-picture.png")}
              />
            )}
          </>
        </View>
      ) : (
        <View style={commonStyles.loading}>
          <Loading size="small" />
        </View>
      )}
    </View>
  );
};

export { ProfileImage };
