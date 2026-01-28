import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  useGetMessagesQuery,
  useGetOrCreateConversationMutation,
} from "@/store/api";
import { socket } from "@/utils/socket";
import { useSelector } from "react-redux";

const UserId = () => {
  const { userId } = useLocalSearchParams();
  const currentUser = useSelector((state: any) => state.auth.user);

  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState([]);

  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [getOrCreateConversation, { isLoading: isCreatingConversation }] =
    useGetOrCreateConversationMutation();

  // step 1: fetch or create conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await getOrCreateConversation(userId).unwrap();
        setConversationId(response._id);
        console.log("conv created/fetched", response._id);
      } catch (error: any) {
        // console.error("Error creating conversation", error);
        setError(
          error?.data?.message ||
            error?.message ||
            "Failed to load conversation",
        );
      }
    };

    if (userId) {
      initConversation();
    }
  }, [userId]);

  // step 2: fetch messages
  const {
    data: messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetMessagesQuery(conversationId, { skip: !conversationId });

  useEffect(() => {
    if (messages) {
      console.log("📨 Loaded messages:", messages.length);
      setLocalMessages(messages);
    }
  }, [messages]);

  // step 3: listen for message send confirmation
  useEffect(() => {
    socket.on("message_sent", (newMessage) => {
      console.log("✅ Message sent confirmation:", newMessage);

      // Replace optimistic message with real message from server
      setLocalMessages((prev) => {
        // Filter out temporary optimistic messages (they start with timestamp)
        const filtered = prev.filter((msg) => {
          const idStr = msg._id.toString();
          // Temp messages are pure timestamps (13 digits), real ones are MongoDB ObjectIds
          return idStr.length !== 13 || isNaN(Number(idStr));
        });

        // Check if real message already exists
        const exists = filtered.some((msg) => msg._id === newMessage._id);
        if (exists) return filtered;

        return [...filtered, newMessage];
      });
    });

    socket.on("message_error", (error) => {
      console.error("❌ Message error:", error);
      alert("Failed to send message: " + error.message);
    });

    return () => {
      socket.off("message_sent");
      socket.off("message_error");
    };
  }, []);

  // step 4: listen for incoming messages from other users
  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      console.log("📥 Received new message:", newMessage);

      // check if message belongs to current conversation
      if (newMessage.conversationId === conversationId) {
        setLocalMessages((prev) => {
          // check if message already exist
          const exists = prev.some((msg) => msg._id === newMessage._id);
          if (exists) return prev;

          return [...prev, newMessage];
        });
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [conversationId]);

  const handleSend = () => {
    if (!message.trim() || !conversationId) return;

    console.log("📤 Sending message:", message);

    // emit message via socket
    socket.emit("send_message", {
      conversationId,
      content: message.trim(),
      recipientId: userId,
    });

    // add message to local state
    const tempMessage = {
      _id: Date.now().toString(),
      content: message.trim(),
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
      },
      createdAt: new Date().toISOString(),
    };

    // @ts-ignore
    setLocalMessages((prev) => [...prev, tempMessage]);
    setMessage("");
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-center px-4">{error}</Text>
      </View>
    );
  }

  if (isCreatingConversation || !conversationId || isLoadingMessages) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading conversation...</Text>
      </View>
    );
  }

  return (
    <View className="mx-5 flex-1 bg-white">
      <Text>Chat - Conversation: {conversationId}</Text>
      <Text className="mb-4">Total Messages: {localMessages.length}</Text>

      <FlatList
        data={localMessages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="mb-3 p-3 bg-gray-100 rounded">
            <Text className="font-semibold">{item.sender.name}</Text>
            <Text className="mt-1">{item.content}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No messages yet. Start the conversation!
          </Text>
        }
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
