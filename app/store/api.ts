import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Meesages"]

  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: payload,
      }),
    }),

    login: builder.mutation({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        body: payload,
      }),
    }),

    getUsers: builder.query({
      query: () => "/user/all",
    }),

    getOrCreateConversation: builder.mutation({
      query: (recipientId) => ({
        url: "/message/conversation",
        method: "POST",
        body: { recipientId },
      }),
    }),

    getMessages: builder.query({
      query: (conversationId) =>
        `/message/conversation/${conversationId}/messages`,
      providesTags: ["Meesages"]
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUsersQuery,
  useGetOrCreateConversationMutation,
  useGetMessagesQuery,
} = api;
