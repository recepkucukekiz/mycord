"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { IntlErrorCode, NextIntlClientProvider } from "next-intl";
import { SocketProvider } from "@/context/SocketContext";

export default function Providers({
  children,
  messages,
  locale,
}: Readonly<{
  children: React.ReactNode;
  messages: Record<string, any>;
  locale: string;
}>) {
  const handleError = (e: any) => {
    if ([IntlErrorCode.MISSING_MESSAGE].includes(e.code)) {
      return;
    }
  };

  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          onError={handleError}>
          <SocketProvider>{children}</SocketProvider>
          <Toaster />
        </NextIntlClientProvider>
      </ThemeProvider>
    </Provider>
  );
}
