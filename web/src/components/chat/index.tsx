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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "frontend/components/ui/select";
import {
  listLanguages,
  listVoices,
  setLanguage,
  setVoice,
} from "frontend/lib/tts";
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
  flex_row,
  font_medium,
  gap,
  h_full,
  inset,
  items_center,
  justify_center,
  leading_none,
  left,
  overflow_y_auto,
  p,
  pr,
  relative,
  right,
  sm,
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
  const [languages, setLanguages] = React.useState<
    Awaited<ReturnType<typeof listLanguages>>
  >([]);
  const [voices, setVoices] = React.useState<
    Awaited<ReturnType<typeof listVoices>>
  >([]);
  const [selectedLanguage, setSelectedLanguage] = React.useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [selectedVoice, setSelectedVoice] = React.useState<
    { value: string; label: string } | undefined
  >(undefined);

  React.useEffect(() => {
    const loadTTSOptions = async () => {
      try {
        const [languagesList, voicesList] = await Promise.all([
          listLanguages(),
          listVoices(),
        ]);
        setLanguages(languagesList);
        setVoices(voicesList);

        // Set default selections if available
        if (languagesList.length > 0) {
          setSelectedLanguage({
            value: languagesList[0].id,
            label: languagesList[0].name,
          });
        }
        if (voicesList.length > 0) {
          setSelectedVoice({
            value: voicesList[0].id,
            label: voicesList[0].name,
          });
        }
      } catch (error) {
        console.error("Failed to load TTS options:", error);
      }
    };

    loadTTSOptions();
  }, []);

  const handleLanguageChange = React.useCallback(
    async (option: { value: string; label: string } | undefined) => {
      if (!option) return;
      setSelectedLanguage(option);
      await setLanguage(option.value);
      // Filter voices by selected language to find first available voice
      const currentVoices = voices.filter((v) => v.languageId === option.value);
      if (currentVoices.length > 0) {
        const firstVoice = {
          value: currentVoices[0].id,
          label: currentVoices[0].name,
        };
        setSelectedVoice(firstVoice);
        await setVoice(firstVoice.value);
      }
    },
    [voices],
  );

  const handleVoiceChange = React.useCallback(
    async (option: { value: string; label: string } | undefined) => {
      if (!option) return;
      setSelectedVoice(option);
      await setVoice(option.value);
    },
    [],
  );

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
      <CardHeader
        css={css(
          flex,
          flex_col,
          sm(flex_row),
          items_center,
          justify_center,
          gap`4`,
        )}
      >
        <View css={css(flex, items_center, justify_center, gap`4`)}>
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
        <View css={css(flex, justify_center, gap`4`)}>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem
                  key={language.id}
                  value={language.id}
                  label={language.name}
                >
                  <Text style={{ textAlign: "left" }}>{language.name}</Text>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices
                .filter(
                  (voice) =>
                    voice.languageId === (selectedLanguage?.value || ""),
                )
                .map((voice) => (
                  <SelectItem
                    key={voice.id}
                    value={voice.id}
                    label={voice.name}
                  >
                    <Text>{voice.name}</Text>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
            overflow_y_auto,
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
