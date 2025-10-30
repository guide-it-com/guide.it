import * as SelectPrimitive from "@rn-primitives/select";
import styled, { css, cva } from "css-native";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import * as React from "react";
import { Platform, View } from "react-native";
import {
  absolute,
  bg,
  bg_white,
  border,
  bottom,
  flex,
  focus,
  gap,
  h,
  h_full,
  hover,
  items_center,
  items_start,
  justify_between,
  justify_center,
  max_h,
  min_w,
  mx,
  my,
  opacity,
  outline_none,
  overflow_x_hidden,
  overflow_y_auto,
  p,
  pb,
  pl,
  pr,
  pt,
  px,
  py,
  relative,
  right,
  ring,
  rounded_md,
  rounded_sm,
  shadow_md,
  shadow_xs,
  shrink,
  text,
  text_sm,
  text_xs,
  top,
  translate_x,
  translate_y,
  w_fit,
  w_full,
  whitespace_nowrap,
  z,
} from "tailwind-native";

const IS_DESKTOP = Platform.OS === "windows" || Platform.OS === "macos";

const Select = styled(SelectPrimitive.Root)``;

const SelectGroup = styled(SelectPrimitive.Group)``;

const SelectValue = styled(SelectPrimitive.Value)``;

const SelectPortal = SelectPrimitive.Portal;

const triggerVariants = cva({
  variants: {
    size: {
      default: [h`9`],
      sm: [h`8`],
    },
    disabled: {
      true: [
        css`
          cursor: not-allowed;
        `,
        opacity`50`,
      ],
    },
    invalid: {
      true: [
        border`var(--destructive)`,
        ring`oklch(from var(--destructive) l c h / 20%)`,
      ],
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const SelectTriggerWrapper = styled(
  SelectPrimitive.Trigger,
  triggerVariants,
  relative,
  border`var(--input)`,
  border`0.5`,
  focus(
    border`var(--ring)`,
    ring`oklch(from var(--ring) l c h / 50%)`,
    ring`3`,
  ),
  text`var(--foreground)`,
  bg_white,
  ...(IS_DESKTOP ? [] : [w_fit]),
  flex,
  items_center,
  justify_between,
  gap`2`,
  rounded_md,
  px`3`,
  py`2`,
  pr`7`,
  text_sm,
  whitespace_nowrap,
  shadow_xs,
  outline_none,
  shrink`0`,
  // data-[placeholder]:text-muted-foreground
  // [&_svg:not([class*='text-'])]:text-muted-foreground
  // transition-[color,box-shadow]
  // *:data-[slot=select-value]:line-clamp-1
  // *:data-[slot=select-value]:flex
  // *:data-[slot=select-value]:items-center
  // *:data-[slot=select-value]:gap-2
  // [&_svg]:pointer-events-none
  // [&_svg]:shrink-0
  // [&_svg:not([class*='size-'])]:size-4
);
SelectTriggerWrapper.displayName = SelectPrimitive.Trigger.displayName;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTriggerWrapper>,
  React.ComponentPropsWithoutRef<typeof SelectTriggerWrapper> & {
    children: React.ReactNode;
  }
>(({ children, ...props }, ref) => (
  <SelectTriggerWrapper ref={ref as any} {...props}>
    {children}
    <View
      style={{
        display: "flex",
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 32,
      }}
    >
      <ChevronDown size={16} color="gray" style={{ margin: "auto" }} />
    </View>
  </SelectTriggerWrapper>
));
SelectTrigger.displayName = "SelectTrigger";

const contentVariants = cva({
  compoundVariants: [
    {
      position: "popper",
      side: "bottom",
      css: [translate_y`1`],
    },
    {
      position: "popper",
      side: "left",
      css: [translate_x`-1`],
    },
    {
      position: "popper",
      side: "right",
      css: [translate_x`1`],
    },
    {
      position: "popper",
      side: "top",
      css: [translate_y`-1`],
    },
  ],
});
const ContentOuterView = styled(
  View,
  contentVariants,
  z`50`,
  rounded_md,
  pr`1`,
  border`0.5`,
  bg`var(--card)`,
  text`var(--card-foreground)`,
  shadow_md,
  // data-[state=open]:animate-in
  // data-[state=closed]:animate-out
  // data-[state=closed]:fade-out-0
  // data-[state=open]:fade-in-0
  // data-[state=closed]:zoom-out-95
  // data-[state=open]:zoom-in-95
  // data-[side=bottom]:slide-in-from-top-2
  // data-[side=left]:slide-in-from-right-2
  // data-[side=right]:slide-in-from-left-2
  // data-[side=top]:slide-in-from-bottom-2
);
ContentOuterView.displayName = "SelectContentOuter";

const ContentInnerView = styled(
  View,
  pl`1`,
  pt`1`,
  pb`1`,
  max_h`50`,
  min_w`8rem`,
  overflow_x_hidden,
  overflow_y_auto,
);
ContentInnerView.displayName = "SelectContentInner";

const viewportVariants = cva({
  variants: {
    position: {
      popper: [
        h_full,
        w_full,
        // scroll-my-1,
      ],
    },
  },
});
const Viewport = styled(View, viewportVariants, p`1`);

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    css?: ReturnType<typeof css>;
  }
>(({ children, position = "popper", align = "center", ...props }, ref) => (
  <SelectPortal>
    <SelectPrimitive.Content ref={ref as any} position={position} align={align}>
      <ContentOuterView {...props}>
        <ContentInnerView>
          <Viewport position={position as any}>{children}</Viewport>
        </ContentInnerView>
      </ContentOuterView>
    </SelectPrimitive.Content>
  </SelectPortal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = styled(
  SelectPrimitive.Label,
  text`var(--muted-foreground)`,
  px`2`,
  py`1.5`,
  text_xs,
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const itemVariants = cva({
  variants: {
    disabled: {
      true: [
        opacity`50`,
        css`
          pointer-events: none;
        `,
      ],
    },
  },
  defaultVariants: {
    disabled: "false",
  },
});
const SelectItemComponent = styled(
  View,
  itemVariants,
  relative,
  flex,
  w_full,
  items_start,
  gap`2`,
  rounded_sm,
  py`1.5`,
  pr`8`,
  pl`2`,
  text_sm,
  outline_none,
  shrink`0`,
  css`
    cursor: default;
    user-select: none;
  `,
  hover(bg`var(--accent)`, text`var(--accent-foreground)`),
  // [&_svg:not([class*='text-'])]:text-muted-foreground
  // [&_svg]:pointer-events-none
  // [&_svg]:shrink-0
  // [&_svg:not([class*='size-'])]:size-4
  // *:[span]:last:flex
  // *:[span]:last:items-center
  // *:[span]:last:gap-2
);
SelectItemComponent.displayName = SelectPrimitive.Item.displayName;

const ItemIndicatorWrapper = styled(
  View,
  absolute,
  right`2`,
  top`0`,
  bottom`0`,
  flex,
  items_center,
  justify_center,
);

const SelectItem = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof SelectItemComponent> & {
    value: string;
    label: string;
    children: React.ReactNode;
  }
>(({ children, value, label, ...props }, ref) => (
  <SelectPrimitive.Item
    value={value}
    label={label}
    style={Platform.OS === "web" ? ({ outlineWidth: 0 } as any) : undefined}
  >
    <SelectItemComponent ref={ref as any} {...props}>
      <ItemIndicatorWrapper>
        <SelectPrimitive.ItemIndicator>
          <Check size={16} color="gray" />
        </SelectPrimitive.ItemIndicator>
      </ItemIndicatorWrapper>
      {children}
    </SelectItemComponent>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = styled(
  SelectPrimitive.Separator,
  bg`var(--border)`,
  h`1`,
  mx`-1`,
  my`1`,
  css`
    pointer-events: none;
  `,
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const SelectScrollUpButtonComponent = styled(
  View,
  w_full,
  flex,
  items_center,
  justify_center,
  py`1`,
  css`
    cursor: default;
  `,
);
SelectScrollUpButtonComponent.displayName = "SelectScrollUpButton";

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectScrollUpButtonComponent>,
  React.ComponentPropsWithoutRef<typeof SelectScrollUpButtonComponent>
>(({ ...props }, ref) => (
  <SelectScrollUpButtonComponent ref={ref as any} {...props}>
    <ChevronUp size={16} />
  </SelectScrollUpButtonComponent>
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButtonComponent = styled(
  View,
  w_full,
  flex,
  items_center,
  justify_center,
  py`1`,
  css`
    cursor: default;
  `,
);
SelectScrollDownButtonComponent.displayName = "SelectScrollDownButton";

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectScrollDownButtonComponent>,
  React.ComponentPropsWithoutRef<typeof SelectScrollDownButtonComponent>
>(({ ...props }, ref) => (
  <SelectScrollDownButtonComponent ref={ref as any} {...props}>
    <ChevronDown size={16} />
  </SelectScrollDownButtonComponent>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
