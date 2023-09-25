export const wait = (ms: number) => {
  let timeoutHandle: NodeJS.Timeout;
  return {
    promise: new Promise((resolve) => {
      timeoutHandle = setTimeout(resolve, ms);
    }),
    cancel: () => clearTimeout(timeoutHandle),
  };
};
