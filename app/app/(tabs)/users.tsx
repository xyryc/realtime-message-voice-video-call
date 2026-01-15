import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { useGetUsersQuery } from "@/store/api";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Users = () => {
  const { data: users, isLoading } = useGetUsersQuery(undefined);
  // console.log("from users tab", users);
  const router = useRouter();

  return (
    <SafeAreaView className="mx-5">
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push("/chat/[userId]")}
            className="border-b border-gray-300 px-4 py-2"
          >
            <Text className="text-xl font-bold">{item.name}</Text>
            <Text>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Users;
