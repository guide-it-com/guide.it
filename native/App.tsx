import { Provider } from "frontend/provider";
import React from "react";
import { NativeNavigation, NavigationProvider } from "./navigation";

export default function App() {
  return (
    <Provider>
      <NavigationProvider>
        <NativeNavigation />
      </NavigationProvider>
    </Provider>
  );
}
