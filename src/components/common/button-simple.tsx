import React from "react";
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from "react-native";

export enum ButtonTypes {
  Primary = "Primary",
  Secondary = "Secondary",
  Tertiary = "Tertiary",
}

interface SimpleButtonProps extends TouchableOpacityProps {
  title: string;
  type?: ButtonTypes;
  loading?: boolean;
  /** Override primary button colour (e.g. from organisation branding) */
  primaryColor?: string;
}

export const Button: React.FC<SimpleButtonProps> = ({
  title,
  type = ButtonTypes.Primary,
  loading = false,
  primaryColor,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    type === ButtonTypes.Primary && styles.primary,
    type === ButtonTypes.Primary && primaryColor && { backgroundColor: primaryColor, borderColor: primaryColor },
    type === ButtonTypes.Secondary && styles.secondary,
    type === ButtonTypes.Tertiary && styles.tertiary,
    type === ButtonTypes.Tertiary && primaryColor && { borderColor: primaryColor },
    style,
  ];

  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      <Text style={[styles.text, type === ButtonTypes.Primary && styles.primaryText]}>
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#34C759',
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
});
