import styled, { css, cva } from "css-native";
import { FormContext, Validation } from "frontend/components/ui/form";
import React from "react";
import { TextInput } from "react-native";

import {
  bg_white,
  border,
  flex,
  focus,
  font_medium,
  h,
  md,
  min_w,
  opacity,
  outline_none,
  px,
  py,
  rounded_md,
  shadow_sm,
  text,
  text_base,
  text_sm,
  w_full,
} from "tailwind-native";

const inputVariants = cva({
  variants: {
    type: {
      file: [border`0`, text_sm, font_medium],
    },
    value: {
      "": [text`var(--muted-foreground)`],
    },
    disabled: {
      true: [
        css`
          cursor: not-allowed;
        `,
        opacity`50`,
      ],
    },
  },
});
const InputContainer = styled.View(...flex`1`);
const InputComponent = styled(
  TextInput,
  inputVariants,
  text`var(--foreground)`,
  w_full,
  min_w`100%`,
  h`9`,
  rounded_md,
  border`var(--input)`,
  bg_white,
  px`3`,
  py`1`,
  text_base,
  shadow_sm,
  focus(border`1`, border`var(--primary)`),
  md(text_sm),
  outline_none,
  /* transition-colors */
);
const Input = React.forwardRef<
  TextInput,
  Omit<
    React.ComponentProps<typeof InputComponent>,
    "value" | "onChangeText" | "onSubmitEditing"
  > & {
    name: string;
    validations?: Validation[];
  }
>(({ name, validations, ...props }, ref) => {
  const { data, setFieldValidations, submit } = React.useContext(FormContext);
  if (data._reset) {
    (props as any).value = (data[name] as string) || "";
  }

  React.useEffect(() => {
    if (validations) {
      setFieldValidations(name, validations);
    }
  }, [validations]);

  return (
    <InputContainer>
      <InputComponent
        {...props}
        ref={ref}
        onChangeText={(text) => {
          data[name] = text;
          if (validations) {
            setFieldValidations(name, validations);
          }
        }}
        onSubmitEditing={submit}
        placeholderTextColor="gray"
        selectionColor="black"
      />
    </InputContainer>
  );
});
Input.displayName = "Input";

export { Input };
