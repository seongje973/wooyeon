import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Colors } from "@/constants/Colors";

// 👇 여기가 핵심입니다! label: string을 추가해야 합니다.
interface Props extends TextInputProps {
  label: string;
}

const CommonInput: React.FC<Props> = ({ label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* 받아온 label 값을 화면에 표시 */}
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[styles.input, isFocused && styles.focused]}
        placeholderTextColor={Colors.gray400}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props} // 나머지 설정들(onChangeText 등)을 TextInput에 전달
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.text,
  },
  focused: {
    borderBottomColor: Colors.primary,
  },
});

export default CommonInput;
