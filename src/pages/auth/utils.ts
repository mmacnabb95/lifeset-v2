export const passwordRegex = RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})",
);
export const passwordStrengthMessage =
  "Passwords need a minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character";
