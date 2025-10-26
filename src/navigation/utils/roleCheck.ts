import _ from "lodash";
import { Role } from "uiTypes";

export const isAdmin = (roles: Role[]) => {
  const _isAdmin = _.find(roles, { Name: "AdminUser" });
  return _isAdmin;
};

export const isCompanyManager = (roles: Role[]) => {
  const _isUser = _.find(roles, { Name: "CompanyManager" });
  return _isUser;
};

export const isUser = (roles: Role[]) => {
  const _isUser = _.find(roles, { Name: "User" });
  return _isUser;
};
