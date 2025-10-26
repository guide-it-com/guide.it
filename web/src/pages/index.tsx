import styled, { css } from "css-native";
import { Button } from "frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "frontend/components/ui/card";
import { useRouter } from "solito/router";
import {
  gap,
  h_full,
  max_w,
  ml,
  mr,
  p,
  text_white,
  w_full,
} from "tailwind-native";

const View = styled.View``;
const Text = styled.Text``;

const HomePage = () => {
  const router = useRouter();

  return (
    <View css={css(ml`auto`, mr`auto`, max_w`640px`, p`4`, w_full, h_full)}>
      <Card>
        <CardHeader>
          <CardTitle>Guide It</CardTitle>
          <CardDescription>
            For now there is only a chat example.
          </CardDescription>
        </CardHeader>
        <CardContent css={gap`2`}>
          <Text>Open the chat example by clicking the button.</Text>
          <Button type="button" onPress={() => router.push("/chat")}>
            <Text css={text_white}>Submit</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
};

export default HomePage;
