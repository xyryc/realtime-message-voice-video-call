import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  useGetMessagesQuery,
  useGetOrCreateConversationMutation,
} from "@/store/api";

const UserId = () => {
  const { userId } = useLocalSearchParams();
  console.log("chat screen", userId);
  const [conversationId, setConversationId] = useState(null);

  const [getConversation, { isLoading: loadingConversation }] =
    useGetOrCreateConversationMutation();
  const { data: messages, isLoading: loadingMessages } = useGetMessagesQuery(
    conversationId,
    { skip: !conversationId }
  );

  useEffect(() => {
    getConversation(userId)
      .unwrap()
      .then((conv) => setConversationId(conv._id))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <View>
      <Text>Chat - Conversation: {conversationId}</Text>

      <FlatList
        data={messages || []}
        renderItem={({ item }) => (
          <Text>
            {item.sender.name}: {item.content}
          </Text>
        )}
      />
    </View>
  );
};

export default UserId;
