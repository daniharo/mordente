/// Wait a number of milliseconds before resolving an empty Promise.
export function later(delay: number) {
  return new Promise<void>(function (resolve) {
    setTimeout(resolve, delay);
  });
}
