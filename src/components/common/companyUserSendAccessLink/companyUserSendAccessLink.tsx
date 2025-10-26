import React, { useState } from "react";
import { NavOption } from "../navOption";
import { useRoute } from "@react-navigation/native";
import style from "src/pages/settings/countryPicker/style";
import { Button, ButtonTypes } from "../button";
import { TypographyTypes } from "../typography";
import { Modal } from "../modal";
import { useDispatch } from "react-redux";
import { updateCompany } from "src/redux/domain/features/company/collection-slice";
import { updateCompanyUser } from "src/redux/domain/features/companyUser/collection-slice";
import { useSnackBar } from "../snackBar";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { isCompanyManager } from "src/navigation/utils/roleCheck";
import { Companyuser } from "../../../../../types/domain/flat-types";

const useCommonTypographyStyles =
  require("../../../themes/typography/styles/styles").default;

export const CompanyUserSendAccessLink = ({
  source,
}: {
  source: Companyuser & { user: { Id: number } };
}) => {
  const route = useRoute();
  const { roles, userId } = useUserInfo();
  const dispatch = useDispatch();
  const commonTypographyStyles = useCommonTypographyStyles();
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const { companyUserId } = route.params as any;
  const [loading, setLoading] = useState(false);
  const isDisabled =
    !companyUserId ||
    companyUserId === "new" ||
    (isCompanyManager(roles) && source?.user?.Id === userId);

  return (
    <>
      <Button
        onPress={async () => {
          setLoading(true);
          const res: any = await dispatch(
            updateCompanyUser({ Id: companyUserId, sendLink: true }),
          );
          if (res?.meta?.requestStatus === "fulfilled") {
            setAlertTitle("User notified");
            setIsAlertOpen(true);
          } else {
            setAlertTitle("Error");
            setIsAlertOpen(true);
          }
          setLoading(false);
        }}
        loading={loading}
        testID={"send-access-link"}
        title={"Send access notifcation"}
        titleStyle={commonTypographyStyles[TypographyTypes.ButtonTextPrimary]}
        style={[
          {
            marginBottom: -7,
            zIndex: 10,
            marginTop: 15,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        type={ButtonTypes.Primary}
        disabled={isDisabled}
      />
      <Modal
        visible={isAlertOpen}
        title={alertTitle}
        acceptButton={
          <Button
            type={ButtonTypes.Primary}
            title="Ok"
            onPress={() => {
              setIsAlertOpen(false);
              setTimeout(() => {
                setAlertTitle("");
              }, 1000); //fading modal needs to wait
            }}
          />
        }
      />
    </>
  );
};
