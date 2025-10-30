import styled, { css, cva } from "css-native";
import { Button } from "frontend/components/ui/button";
import { speak, stop } from "frontend/lib/tts";
import { Play } from "lucide-react-native";
import React, { useState } from "react";
import { Platform } from "react-native";
import {
  bg,
  bg_black,
  bg_transparent,
  bg_white,
  flex,
  flex_col,
  gap,
  h,
  hover,
  max_w,
  ml,
  mr,
  my,
  px,
  py,
  rounded_lg,
  rounded_xs,
  text,
  text_sm,
  w,
  w_full,
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
>) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlayback = async () => {
    if (isPlaying) {
      // Stop the speech
      await stop();
      setIsPlaying(false);
    } else {
      // Start the speech
      setIsPlaying(true);
      await speak(children);
      setIsPlaying(false);
    }
  };

  return (
    <MessageView {...props}>
      <Text>{children}</Text>
      <Button
        size="icon"
        type="button"
        onPress={handleTogglePlayback}
        variant="ghost"
        css={css(w_full, hover(bg_transparent))}
      >
        {isPlaying ? (
          <View
            css={css(
              w`4`,
              h`4`,
              rounded_xs,
              (props.role === "user" && bg_white) || bg_black,
            )}
          />
        ) : (
          <Play
            size={18}
            style={
              { color: (props.role === "user" && "white") || "black" } as any
            }
          />
        )}
      </Button>
    </MessageView>
  );
};

export default Message;
