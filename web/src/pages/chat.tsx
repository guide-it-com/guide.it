import styled, { css } from "css-native";
import Chat, { Messages } from "frontend/components/chat";
import React from "react";
import { h_full, max_w, ml, mr, p, w_full } from "tailwind-native";

const View = styled.View``;

const ChatPage = () => {
  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?",
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account.",
    },
    {
      role: "agent",
      content: "What seems to be the problem?",
    },
    {
      role: "user",
      content: "I can't log in.",
    },
  ] as Messages);
  const onSend = (message: string) => {
    setMessages([
      ...messages,
      {
        role: "user",
        content: message,
      },
    ]);
  };

  return (
    <View css={css(ml`auto`, mr`auto`, max_w`640px`, p`4`, h_full, w_full)}>
      <Chat messages={messages} onSend={onSend} />
    </View>
  );
};

export default ChatPage;
