import { createServerFn } from "@tanstack/react-start";

/** Which sign-in buttons this host can finish. Never includes secrets. */
export const getSignInMethods = createServerFn({ method: "GET" }).handler(async () => {
  const { brokerSignInEnabled } = await import("./server");
  return { broker: brokerSignInEnabled };
});
