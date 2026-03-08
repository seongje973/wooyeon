import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray800,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.black,
  },
  inputFocused: {
    borderBottomColor: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray400,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
