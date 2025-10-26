import { NavigationContainer } from "@react-navigation/native";
import React, { useMemo } from "react";
import { createNativeStackNavigator } from "./navigation-stack";
import pages from "./pages";
import { paramsToPath, pathToParams } from "./utils/pages";

const Stack = createNativeStackNavigator();

export function NativeNavigation() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {Object.entries({
        [""]: pages[""],
        ...pages,
      }).map(([page, component]) => (
        <Stack.Screen
          key={page || "guideithome"}
          name={page || "guideithome"}
          component={component}
        />
      ))}
    </Stack.Navigator>
  );
}

export function NavigationProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavigationContainer
      linking={useMemo(
        () => ({
          prefixes: ["native://"],
          getStateFromPath: (path) => ({
            routes: Object.keys(pages)
              .map(
                (page) =>
                  [page, pathToParams(page, path.replace(/^\//g, ""))] as const,
              )
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .filter(([_, params]) => params)
              .map(([page, params]) => ({
                name: page || "guideithome",
                params,
              })),
          }),
          getPathFromState(state) {
            return paramsToPath(
              state.routes[0].name,
              state.routes[0].params as any,
            );
          },
          config: {
            initialRouteName: "guideithome",
            screens: Object.keys(pages).reduce(
              (acc, page) => ({
                ...acc,
                [page || "guideithome"]: "",
              }),
              {} as Record<string, string>,
            ),
          },
        }),
        [...Object.keys(pages)],
      )}
    >
      {children}
    </NavigationContainer>
  );
}
