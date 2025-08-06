export function delayAsyncExecution(delayInMilliseconds: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMilliseconds);
  });
}
