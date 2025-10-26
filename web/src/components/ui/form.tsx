import React from "react";

export type Validation = {
  validation: RegExp;
  error?: string;
};

export const FormContext = React.createContext<{
  data: Record<string, unknown>;
  reset: (data?: Record<string, unknown>) => void;
  setFieldValidations: (field: string, validations: Validation[]) => void;
  errors: undefined | string[];
  submit: () => void;
}>({} as any);

export const Form = ({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: (context: React.ContextType<typeof FormContext>) => void;
}) => {
  const [data, setData] = React.useState({} as Record<string, unknown>);
  const [validations, setValidations] = React.useState<
    Record<string, Validation[]>
  >({});

  const errors = Object.keys(validations).reduce(
    (errors, field) => {
      const fieldErrors = validations[field].filter(
        ({ validation }) => !validation.test((data[field] as string) || ""),
      );
      if (fieldErrors.length) {
        errors = [
          ...(errors ?? []),
          ...(fieldErrors
            .map((error) => error.error)
            .filter(Boolean) as string[]),
        ];
      }
      return errors;
    },
    undefined as undefined | string[],
  );

  const setFieldValidations = React.useCallback(
    (field: string, validations: Validation[]) => {
      setValidations((prev) => ({ ...prev, [field]: validations }));
    },
    [],
  );

  const reset = React.useCallback(
    (d?: typeof data) => {
      setData((data) => ({ ...(d || data), _reset: true }));
    },
    [setData],
  );

  const submit = React.useCallback(() => {
    if (!errors) {
      onSubmit({ data, reset, setFieldValidations, errors, submit });
    }
  }, [errors, data, reset, setFieldValidations, onSubmit]);

  React.useEffect(() => {
    if (data._reset) {
      setData({ ...data, _reset: false });
    }
  }, [data._reset]);

  return (
    <FormContext.Provider
      value={{
        data,
        reset,
        setFieldValidations,
        errors,
        submit,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
