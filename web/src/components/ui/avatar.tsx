import * as AvatarPrimitive from "@rn-primitives/avatar";
import styled from "css-native";
import {
  aspect_square,
  bg,
  flex,
  h,
  h_full,
  items_center,
  justify_center,
  overflow_hidden,
  relative,
  rounded_full,
  shrink,
  w,
  w_full,
} from "tailwind-native";

const Avatar = styled(
  AvatarPrimitive.Root,
  relative,
  flex,
  h`10`,
  w`10`,
  shrink`0`,
  overflow_hidden,
  rounded_full,
  bg`var(--muted)`,
);

Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = styled(
  AvatarPrimitive.Image,
  aspect_square,
  w_full,
  h_full,
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = styled(
  AvatarPrimitive.Fallback,
  flex,
  h_full,
  w_full,
  items_center,
  justify_center,
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
