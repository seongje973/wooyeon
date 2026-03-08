import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/Colors";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const CommonButton: React.FC<Props> = ({
  title,
  onPress,
  disabled,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: Colors.gray400,
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CommonButton;
