import styled, { css, cva } from "css-native";
import { FormContext } from "frontend/components/ui/form";
import React from "react";
import { Pressable } from "react-native";
import {
  bg,
  border,
  color,
  focus,
  font_medium,
  gap,
  h,
  hover,
  inline_flex,
  items_center,
  justify_center,
  opacity,
  outline_none,
  px,
  py,
  ring,
  rounded_md,
  shadow_xs,
  shrink,
  size,
  text_sm,
  text_white,
  underline,
  underline_offset,
  whitespace_nowrap,
} from "tailwind-native";

const buttonVariants = cva({
  variants: {
    variant: {
      default: [
        bg`var(--primary)`,
        color`var(--primary-foreground)`,
        shadow_xs,
        hover(opacity`90`),
      ],
      destructive: [
        bg`var(--destructive)`,
        text_white,
        shadow_xs,
        hover(opacity`90`),
        focus(ring`oklch(from var(--destructive) l c h / 20%)`),
      ],
      outline: [
        border,
        bg`var(--background)`,
        shadow_xs,
        hover(bg`var(--accent)`, color`var(--accent-foreground)`),
      ],
      secondary: [
        bg`var(--secondary)`,
        color`var(--secondary-foreground)`,
        shadow_xs,
        hover(opacity`80`),
      ],
      ghost: [hover(bg`var(--accent)`), hover(color`var(--accent-foreground)`)],
      link: [color`var(--primary)`, underline_offset`4`, hover(underline)],
    },
    size: {
      default: [h`9`, px`4`, py`2`],
      sm: [h`8`, rounded_md, gap`1.5`, px`3`],
      lg: [h`10`, rounded_md, px`6`],
      icon: [size`9`],
    },
    disabled: {
      true: [
        css`
          pointer-events: none;
        `,
        opacity`50`,
      ],
    },
  },
  compoundVariants: [
    {
      variant: "destructive",
      theme: "dark",
      css: [focus(ring`oklch(from var(--destructive) l c h / 40%)`)],
    },
    {
      variant: "outline",
      theme: "dark",
      css: [bg`var(--input) 30%`, border`var(--input)`, hover(opacity`50`)],
    },
    {
      variant: "ghost",
      theme: "dark",
      css: [hover(opacity`50`)],
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const ButtonComponent = styled(
  Pressable,
  buttonVariants,
  inline_flex,
  items_center,
  justify_center,
  gap`2`,
  whitespace_nowrap,
  rounded_md,
  text_sm,
  font_medium,
  css`
    cursor: pointer;
  `,
  /* transition-colors, */
  shrink`0`,
  outline_none,
  focus(border`1`, ring`var(--color-ring)`),
  /* [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 */
);
export const Button = React.forwardRef<
  any,
  Omit<React.ComponentProps<typeof ButtonComponent>, "onPress"> &
    (
      | {
          type: "button";
          onPress?: (e: any) => void;
        }
      | {
          type: "submit";
          disabled?: never;
          onPress?: never;
        }
    )
>(({ type: t, onPress, ...props }, ref) => {
  const { errors, submit } =
    t === "submit" ? React.useContext(FormContext) : {};
  if (errors) {
    props.disabled = true;
  }
  const handlePress = (e: any) => {
    switch (t) {
      case "button":
        if (props.disabled) return;
        onPress?.(e);
        break;
      case "submit":
        submit!();
        break;
      default:
        throw new Error("Invalid button type");
    }
  };
  return <ButtonComponent {...props} ref={ref} onPress={handlePress} />;
});
Button.displayName = "Button";
