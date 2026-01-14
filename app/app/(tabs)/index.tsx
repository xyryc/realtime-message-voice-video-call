import { View, Text } from "react-native";
import React from "react";
import { useSelector } from "react-redux";

const Index = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  console.log("from register", user, token);

  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
};

export default Index;
