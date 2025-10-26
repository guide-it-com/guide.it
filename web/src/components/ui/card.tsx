import styled from "css-native";
import { View, Text } from "react-native";
import {
  bg,
  border,
  flex,
  flex_col,
  font_semibold,
  items_center,
  leading_none,
  my,
  p,
  pt,
  rounded_xl,
  shadow_sm,
  text,
  text_sm,
  tracking_tight,
} from "tailwind-native";

const Card = styled(
  View,
  rounded_xl,
  border,
  bg`var(--card)`,
  text`var(--card-foreground)`,
  shadow_sm,
);
Card.displayName = "Card";

const CardHeader = styled(View, flex, flex_col, my`1.5`, p`6`);
CardHeader.displayName = "CardHeader";

const CardTitle = styled(
  Text,
  text`var(--card-foreground)`,
  font_semibold,
  leading_none,
  tracking_tight,
);
CardTitle.displayName = "CardTitle";

const CardDescription = styled(Text, text_sm, text`var(--muted-foreground)`);
CardDescription.displayName = "CardDescription";

const CardContent = styled(View, p`6`, pt`0`);
CardContent.displayName = "CardContent";

const CardFooter = styled(View, flex, items_center, p`6`, pt`0`);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
