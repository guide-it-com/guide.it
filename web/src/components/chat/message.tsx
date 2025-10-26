import styled, { cva } from "css-native";
import { Platform } from "react-native";
import {
  bg,
  flex,
  flex_col,
  gap,
  max_w,
  ml,
  mr,
  my,
  px,
  py,
  rounded_lg,
  text,
  text_sm,
  w_max,
} from "tailwind-native";

const IS_DESKTOP = Platform.OS === "windows" || Platform.OS === "macos";

const View = styled.View``;
const Text = styled.Text``;

const messageVariants = cva({
  variants: {
    role: {
      user: [bg`var(--primary)`, text`var(--primary-foreground)`, ml`auto`],
      agent: [bg`var(--muted)`, text`var(--muted-foreground)`, mr`auto`],
      system: [text`var(--muted-foreground)`, ml`auto`, mr`auto`],
    },
  },
});

const MessageView = styled(
  View,
  messageVariants,
  flex,
  max_w`75%`,
  flex_col,
  gap`2`,
  rounded_lg,
  px`3`,
  py`2`,
  text_sm,
  my`4`,
  ...(IS_DESKTOP ? [] : [w_max]),
);

const Message = ({
  children,
  ...props
}: { children: string } & Omit<
  React.ComponentProps<typeof MessageView>,
  "children"
>) => (
  <MessageView {...props}>
    <Text>{children}</Text>
  </MessageView>
);

export default Message;
