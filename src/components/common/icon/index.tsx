import React from "react";
import Svg from "react-native-svg";
import Camera from "src/assets/be-icons/camera";
import ChevronLeft from "src/assets/be-icons/chevron-left";
import ChevronRight from "src/assets/be-icons/chevron-right";
import Close from "src/assets/be-icons/close";
import DND from "src/assets/be-icons/dnd";
import Edit from "src/assets/be-icons/edit";
import Lock from "src/assets/be-icons/lock";
import Logout from "src/assets/be-icons/logout";
import Menu from "src/assets/be-icons/menu";
import Plus from "src/assets/be-icons/plus";
import Safe from "src/assets/be-icons/safe";
import Search from "src/assets/be-icons/search";
import Trash from "src/assets/be-icons/trash";
import Unlock from "src/assets/be-icons/unlock";
import UserEdit from "src/assets/be-icons/user-edit";
import GearFilled from "src/assets/be-icons/gear-filled";
import GearOutline from "src/assets/be-icons/gear-outline";
import Sort from "src/assets/be-icons/sort";
import List from "src/assets/be-icons/list";
import Dots from "src/assets/be-icons/dots";
import AppsOutline from "src/assets/be-icons/apps-outline";
import AppsFilled from "src/assets/be-icons/apps-filled";
import EventsOutline from "src/assets/be-icons/events-outline";
import EventsFilled from "src/assets/be-icons/events-filled";
import BookOutline from "src/assets/be-icons/book-outline";
import BookFilled from "src/assets/be-icons/book-filled";
import HomeOutline from "src/assets/be-icons/home-outline";
import HomeFilled from "src/assets/be-icons/home-filled";
import EmailOutline from "src/assets/be-icons/email-outline";
import EmailFilled from "src/assets/be-icons/email-filled";
import LeadershipOutline from "src/assets/be-icons/leadership-outline";
import LeadershipFilled from "src/assets/be-icons/leadership-filled";
import VerifyOutline from "src/assets/be-icons/verify-outline";
import VerifyFilled from "src/assets/be-icons/verify-filled";
import CheckedOutline from "src/assets/be-icons/checked-outline";
import CheckedFilled from "src/assets/be-icons/checked-filled";
import ChevronDown from "src/assets/be-icons/chevron-down";
import PieChart from "src/assets/be-icons/pie-chart";
import CheckedRadioOutline from "src/assets/be-icons/checked-radio-outline";
import CheckedRadioFilled from "src/assets/be-icons/checked-radio-filled";
import SearchCheck from "src/assets/be-icons/search-check";
import Yoga from "src/assets/be-icons/yoga";
import Location from "src/assets/be-icons/location";
import Card from "src/assets/be-icons/card";
import Folder from "src/assets/be-icons/folder";
import Book from "src/assets/be-icons/book";
import EditPencil from "src/assets/be-icons/edit-pencil";
import HabitPacks from "src/assets/be-icons/habit-packs";
import Filter from "src/assets/be-icons/filter";
import EyeOutline from "src/assets/be-icons/eye-outline";
import EyeOff from "src/assets/be-icons/eye-off";

export type IconTypes =
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "menu"
  | "dnd"
  | "logout"
  | "close"
  | "lock"
  | "unlock"
  | "plus"
  | "search"
  | "camera"
  | "safe"
  | "trash"
  | "user-edit"
  | "edit"
  | "sort"
  | "list"
  | "dots"
  | "pie-chart"
  | "gear-outline"
  | "gear-filled"
  | "apps-outline"
  | "apps-filled"
  | "events-outline"
  | "events-filled"
  | "book-outline"
  | "book-filled"
  | "home-outline"
  | "home-filled"
  | "email-outline"
  | "email-filled"
  | "leadership-outline"
  | "leadership-filled"
  | "verify-outline"
  | "verify-filled"
  | "checked-outline"
  | "checked-filled"
  | "checked-radio-outline"
  | "checked-radio-filled"
  | "search-check"
  | "yoga"
  | "location"
  | "card"
  | "folder"
  | "book"
  | "edit-pencil"
  | "habit-packs"
  | "filter"
  | "eye-outline"
  | "eye-off";

export interface IconOptions {
  iconType: IconTypes;
  iconSize?: string | number;
  iconColor?: string;
}

const Icon = ({
  iconType,
  iconSize = 16,
  iconColor = "currentColor",
}: IconOptions) => {
  const renderIcon = () => {
    switch (iconType) {
      case "chevron-left":
        return <ChevronLeft iconColor={iconColor} />;
      case "chevron-right":
        return <ChevronRight iconColor={iconColor} />;
      case "chevron-down":
        return <ChevronDown iconColor={iconColor} />;
      case "menu":
        return <Menu iconColor={iconColor} />;
      case "dnd":
        return <DND iconColor={iconColor} />;
      case "logout":
        return <Logout iconColor={iconColor} />;
      case "close":
        return <Close iconColor={iconColor} />;
      case "unlock":
        return <Unlock iconColor={iconColor} />;
      case "lock":
        return <Lock iconColor={iconColor} />;
      case "plus":
        return <Plus iconColor={iconColor} />;
      case "search":
        return <Search iconColor={iconColor} />;
      case "camera":
        return <Camera iconColor={iconColor} />;
      case "safe":
        return <Safe iconColor={iconColor} />;
      case "trash":
        return <Trash iconColor={iconColor} />;
      case "user-edit":
        return <UserEdit iconColor={iconColor} />;
      case "edit":
        return <Edit iconColor={iconColor} />;
      case "sort":
        return <Sort iconColor={iconColor} />;
      case "list":
        return <List iconColor={iconColor} />;
      case "dots":
        return <Dots iconColor={iconColor} />;
      case "pie-chart":
        return <PieChart iconColor={iconColor} />;
      case "gear-outline":
        return <GearOutline iconColor={iconColor} />;
      case "gear-filled":
        return <GearFilled iconColor={iconColor} />;
      case "apps-outline":
        return <AppsOutline iconColor={iconColor} />;
      case "apps-filled":
        return <AppsFilled iconColor={iconColor} />;
      case "events-outline":
        return <EventsOutline iconColor={iconColor} />;
      case "events-filled":
        return <EventsFilled iconColor={iconColor} />;
      case "book-outline":
        return <BookOutline iconColor={iconColor} />;
      case "book-filled":
        return <BookFilled iconColor={iconColor} />;
      case "home-outline":
        return <HomeOutline iconColor={iconColor} />;
      case "home-filled":
        return <HomeFilled iconColor={iconColor} />;
      case "email-outline":
        return <EmailOutline iconColor={iconColor} />;
      case "email-filled":
        return <EmailFilled iconColor={iconColor} />;
      case "leadership-outline":
        return <LeadershipOutline iconColor={iconColor} />;
      case "leadership-filled":
        return <LeadershipFilled iconColor={iconColor} />;
      case "verify-outline":
        return <VerifyOutline iconColor={iconColor} />;
      case "verify-filled":
        return <VerifyFilled iconColor={iconColor} />;
      case "checked-outline":
        return <CheckedOutline iconColor={iconColor} />;
      case "checked-filled":
        return <CheckedFilled iconColor={iconColor} />;
      case "checked-radio-outline":
        return <CheckedRadioOutline iconColor={iconColor} />;
      case "checked-radio-filled":
        return <CheckedRadioFilled iconColor={iconColor} />;
      case "search-check":
        return <SearchCheck iconColor={iconColor} />;
      case "yoga":
        return <Yoga iconColor={iconColor} />;
      case "location":
        return <Location iconColor={iconColor} />;
      case "card":
        return <Card iconColor={iconColor} />;
      case "folder":
        return <Folder iconColor={iconColor} />;
      case "book":
        return <Book iconColor={iconColor} />;
      case "edit-pencil":
        return <EditPencil iconColor={iconColor} />;
      case "habit-packs":
        return <HabitPacks iconColor={iconColor} />;
      case "filter":
        return <Filter iconColor={iconColor} />;
      case "eye-outline":
        return <EyeOutline iconColor={iconColor} />;
      case "eye-off":
        return <EyeOff iconColor={iconColor} />;
    }
  };

  return (
    <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
      {renderIcon()}
    </Svg>
  );
};

export default Icon;
