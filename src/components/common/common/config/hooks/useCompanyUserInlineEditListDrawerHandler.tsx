/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useDispatch } from "react-redux";
  
//all inline edit lists can (optionally) have open close handlers injected by this type of hook
export const useCompanyUserInlineEditListDrawerHandler = (
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setDrawerItem: React.Dispatch<React.SetStateAction<number>>,
) => {
  const dispatch = useDispatch();

  const onOpen = async ({
    drawerItem,
    setDrawerItem,
  }: {
    drawerItem?: number; //index of the active drawer item
    setDrawerItem: (item: number) => void; //set the active drawer item
  }): Promise<boolean | void> => {};
  const onClose = async ({ drawerItem }: { drawerItem: number }) => {};

  return {
    onOpen,
    onClose,
  };
};