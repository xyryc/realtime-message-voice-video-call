import { useRegisterMutation } from "@/store/api";
import { setCredentials } from "@/store/authSlice";
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
import { useDispatch } from "react-redux";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }

    const payload = { email, password, name };

    try {
      const result = await register(payload).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Register Failed",
        error.data?.message || "Something went wrong"
      );
    }
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
              <Text className="text-xl text-center my-5">Register</Text>

              {/* Name Input */}
              <View className="mb-5">
                <Text className="mb-2">Name</Text>
                <TextInput
                  className="border border-neutral-light-active rounded-lg p-3 bg-white"
                  placeholder="Mohammad Anik"
                  placeholderTextColor="#7C7C7C"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>

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
              <View>
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

              {/* register button */}
              <View className="mt-10">
                <TouchableOpacity
                  onPress={handleRegister}
                  className="border py-2 rounded-md items-center"
                >
                  <Text>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
