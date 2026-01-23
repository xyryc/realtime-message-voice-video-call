import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  useGetMessagesQuery,
  useGetOrCreateConversationMutation,
} from "@/store/api";
import { socket } from "@/utils/socket";

const UserId = () => {
  const { userId } = useLocalSearchParams();
  // console.log("chat screen", userId);
  const [conversationId, setConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);

  const [getConversation, { isLoading: loadingConversation }] =
    useGetOrCreateConversationMutation();

  const { data: messages, isLoading: loadingMessages } = useGetMessagesQuery(
    conversationId || "skip",
    { skip: !conversationId }
  );

  useEffect(() => {
    getConversation(userId)
      .unwrap()
      .then((conv) => setConversationId(conv._id))
      .catch((err) => console.error(err));
  }, [userId]);

  // join conversation room
  useEffect(() => {
    if (conversationId) {
      socket.emit("join_conversation", conversationId);
      console.log("📥 Joined conversation", conversationId);
    }
  }, [conversationId]);

  // sync api messages to local state
  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  // listen for new messages
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (newMessage) => {
      console.log("📨 Received: ", newMessage);
      setLocalMessages((prev) => [...prev, newMessage]);
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [conversationId]);

  const handleSend = () => {
    if (!message.trim() || !conversationId) return;

    const messageData = {
      conversationId,
      content: message.trim(),
      type: "text",
    };

    socket.emit("send_message", messageData);
    console.log("📥 Sent: ", messageData);

    setMessage("");
  };

  return (
    <View className="mx-5 flex-1">
      <Text>Chat - Conversation: {conversationId}</Text>

      <FlatList
        data={localMessages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text>
            {item.sender.name}: {item.content}
          </Text>
        )}
      />

      <View className="flex-row mb-10">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type Message"
          className="flex-1 p-2.5 border bg-gray-200"
        />

        <TouchableOpacity onPress={handleSend} className="bg-black p-2.5">
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserId;
