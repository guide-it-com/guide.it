import styled, { css } from "css-native";
import { Avatar, AvatarFallback } from "frontend/components/ui/avatar";
import { Button } from "frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "frontend/components/ui/card";
import { Form, FormContext } from "frontend/components/ui/form";
import { Input } from "frontend/components/ui/input";
import { Send, User } from "lucide-react-native";
import React from "react";
import {
  Platform,
  ScrollView as RNScrollView,
  View as RNView,
} from "react-native";
import {
  absolute,
  flex,
  flex_col,
  font_medium,
  gap,
  h_full,
  inset,
  items_center,
  leading_none,
  left,
  overflow_y_auto,
  overflow_y_scroll,
  p,
  pr,
  relative,
  right,
  sr_only,
  text,
  text_sm,
  w_full,
} from "tailwind-native";
import Message from "./message";

const IS_DESKTOP = Platform.OS === "windows" || Platform.OS === "macos";

const View = styled.View``;
const Text = styled.Text``;

export type Messages = {
  role: "agent" | "user" | "system";
  content: string;
}[];

const Chat = React.forwardRef<
  RNView,
  {
    messages: Messages;
    onSend: (message: string) => void;
  }
>(({ messages, onSend }, ref) => {
  const scrollRef = React.useRef<RNScrollView>(null);
  const handleSend = React.useCallback(
    ({ data, reset }: React.ContextType<typeof FormContext>) => {
      if (!data.message) {
        return;
      }
      onSend(data.message as string);
      reset({ ...data, message: "" });
    },
    [onSend],
  );

  React.useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 0);
  }, [messages]);

  return (
    <Card css={css(h_full, flex, flex_col)} ref={ref}>
      <CardHeader css={css(flex, items_center)}>
        <View css={css(flex, items_center, gap`4`)}>
          <Avatar alt="avatar" css={css(flex, items_center, p`2.5`)}>
            <User
              size={Platform.OS === "web" ? 48 : 24}
              style={{ marginRight: Platform.OS === "web" ? -10 : 0 }}
              stroke="black"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <View>
            <Text css={css(text_sm, font_medium, leading_none)}>Agent</Text>
            <Text css={css(text_sm, text`var(--color-muted-foreground)`)}>
              agent@guide.it.com
            </Text>
          </View>
        </View>
      </CardHeader>
      <View css={css(flex`1`, relative)}>
        <CardContent
          css={css(
            absolute,
            h_full,
            ...(IS_DESKTOP ? [left`6`, pr`0`] : [left`0`]),
            right`0`,
            inset`0`,
            Platform.OS !== "web" ? overflow_y_scroll : overflow_y_auto,
          )}
          ref={scrollRef as any}
        >
          {messages.map((message, index) => (
            <Message key={index} role={message.role}>
              {message.content}
            </Message>
          ))}
        </CardContent>
      </View>
      <CardFooter>
        <Form onSubmit={handleSend}>
          <View css={css(flex, w_full, items_center, gap`4`)}>
            <Input
              name="message"
              placeholder="Type here..."
              autoComplete="off"
              validations={[{ validation: /.+/ }]}
            />
            <Button size="icon" type="submit">
              <Send stroke="white" size={16} />
              <Text css={sr_only}>Send</Text>
            </Button>
          </View>
        </Form>
      </CardFooter>
    </Card>
  );
});

export default Chat;
