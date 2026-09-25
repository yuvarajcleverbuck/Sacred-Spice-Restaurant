import { Platform } from "react-native";

// iOS 26+ gets NativeTabs (liquid glass); older iOS, Android and web use the JS <Tabs>.
export const usesNativeTabs =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;
