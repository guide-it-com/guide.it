import * as DialogPrimitive from "@rn-primitives/dialog";
import styled, { css, cva } from "css-native";
import { LucideProps, X } from "lucide-react-native";
import * as React from "react";
import {
  absolute,
  bg,
  border,
  fixed,
  flex,
  flex_col,
  flex_col_reverse,
  flex_row,
  focus,
  font_semibold,
  gap,
  grid,
  h,
  hover,
  inset,
  justify_end,
  leading_none,
  left,
  max_w_lg,
  mx,
  my,
  opacity,
  outline,
  outline_offset,
  p,
  right,
  rounded_lg,
  rounded_sm,
  shadow_lg,
  sm,
  sr_only,
  text,
  text_center,
  text_left,
  text_lg,
  text_sm,
  top,
  tracking_tight,
  translate_x,
  translate_y,
  w,
  z,
} from "tailwind-native";

const Dialog = styled(DialogPrimitive.Root)``;

const DialogTrigger = styled(DialogPrimitive.Trigger)``;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = styled(DialogPrimitive.Close)``;

const DialogOverlay = styled(
  DialogPrimitive.Overlay,
  fixed,
  inset`0`,
  z`50`,
  bg`oklch(from var(--color-black) l c h / 80)`,
  /* data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 */
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const Content = styled(
  DialogPrimitive.Content,
  fixed,
  left`50%`,
  top`50%`,
  z`50`,
  grid,
  w`full`,
  max_w_lg,
  translate_x`-50%`,
  translate_y`-50%`,
  gap`4`,
  border,
  bg`var(--color-background)`,
  p`6`,
  shadow_lg,
  /* duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] */
  sm(rounded_lg),
);
const closeVariants = cva({
  variants: {
    disabled: {
      true: [
        css`
          pointer-events: none;
        `,
      ],
    },
    "data-state": {
      open: [bg`var(--color-accent)`, text`var(--color-muted-foreground)`],
    },
  },
});
const Close = styled(
  DialogPrimitive.Close,
  closeVariants,
  absolute,
  right`4`,
  top`4`,
  rounded_sm,
  opacity`70`,
  /* transition-opacity,*/ hover(opacity`100`),
  focus(outline`2`, outline`var(--color-outline)`, outline_offset`2`),
);
const CloseIcon = styled(
  X as React.ComponentType<LucideProps & { style?: any }>,
  h`4`,
  w`4`,
);
const CloseText = styled.Text(...sr_only);
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    css?: ReturnType<typeof css>;
  }
>(({ children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Content ref={ref as any} {...props}>
      {children}
      <Close>
        <CloseIcon />
        <CloseText>Close</CloseText>
      </Close>
    </Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = styled.View(
  ...css(flex, flex_col, my`1.5`, text_center, sm(text_left)),
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = styled.View(
  ...css(flex, flex_col_reverse, sm(flex_row), sm(justify_end), sm(mx`2`)),
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = styled(
  DialogPrimitive.Title,
  text_lg,
  font_semibold,
  leading_none,
  tracking_tight,
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = styled(
  DialogPrimitive.Description,
  text_sm,
  text`var(--color-muted-foreground)`,
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
