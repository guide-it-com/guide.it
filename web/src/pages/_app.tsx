import { Provider } from "frontend/provider";
import { NextPageContext } from "next";
import Head from "next/head";
import { SolitoAppProps } from "solito";

const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })

  window.addEventListener('unhandledrejection', event => {
    event.stopImmediatePropagation()
  })
`;

function GuideIt({ Component, pageProps }: SolitoAppProps) {
  return (
    <>
      <Head>
        <title>Guide It</title>
        <meta name="description" content="Guide It" />
        <link rel="icon" href="/favicon.ico" />
        {process.env.NODE_ENV !== "production" && (
          <script
            dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
          />
        )}
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

// by adding getInitialProps to app we force dynamic SSR for all pages
GuideIt.getInitialProps = async ({
  Component,
  ctx,
}: {
  Component: any;
  ctx: NextPageContext;
}) => {
  const { req, res } = ctx;
  if (!req || !res) {
    // on the client we don't do anything
    return {
      pageProps: (await Component.getInitialProps?.({ ctx })) || {},
    };
  }

  // set location hostname to localhost if running locally
  (globalThis as any).location = {
    hostname: req.headers.host?.split(":")[0],
  };

  // get the customer IP from the request
  const customerIp =
    (req.headers["x-real-ip"] as string) ||
    [req.headers["x-forwarded-for"] || []].flat()[0]?.split(",")[0] ||
    req.connection.remoteAddress;

  // store the customer IP and session in globalThis so SSR can use them
  Object.assign(globalThis, {
    customerIp,
  });

  // return the session as a prop to the client
  return {
    pageProps: (await Component.getInitialProps?.({ ctx })) || {},
  };
};

export default GuideIt;
