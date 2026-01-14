import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleNext = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }

    router.push("/(tabs)");
    // try {
    // } catch (error: any) {
    //   Alert.alert(
    //     "Login Failed",
    //     error.data?.message || "Something went wrong"
    //   );
    // }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Form Content */}
            <View className="flex-1 px-5">
              <Text className="text-xl text-center my-5">Login</Text>

              {/* Email Input */}
              <View className="mb-5">
                <Text className="mb-2">Email</Text>
                <TextInput
                  className="border border-neutral-light-active rounded-lg p-3 bg-white"
                  placeholder="example@gmail.com"
                  placeholderTextColor="#7C7C7C"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View className="mb-5">
                <Text className="mb-2">Password</Text>
                <TextInput
                  style={{
                    fontFamily: "SourceSans3-Medium",
                  }}
                  className="border border-neutral-light-active rounded-lg p-3 bg-white"
                  placeholder="Type your password"
                  placeholderTextColor="#7C7C7C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Next Button */}
              <View className="mb-5">
                <TouchableOpacity
                  onPress={handleNext}
                  className="border py-2 rounded-md items-center"
                >
                  <Text>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
