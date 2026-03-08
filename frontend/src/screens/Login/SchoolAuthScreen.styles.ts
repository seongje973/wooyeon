import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray600,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  skipButton: {
    marginTop: 20,
    color: Colors.gray600,
    textDecorationLine: "underline",
  },
});
