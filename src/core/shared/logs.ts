export function log(message: any, args?: any): void {
  if (args === undefined) {
    console.log(`[RedType Framework] ${message}`);
    return;
  }
  console.log(`[RedType Framework] ${message} ${args}`);
}
export function logError(message: any, args?: any): void {
  if (args === undefined) {
    console.error(`[RedType Framework] ${message}`);
    return;
  }
  console.error(`[RedType Framework] ${message} ${args}`);
}
export function logWarning(message: any, args?: any): void {
  if (args === undefined) {
    console.warn(`[RedType Framework] ${message}`);
    return;
  }
  console.warn(`[RedType Framework] ${message} ${args}`);
}
export function logInfo(message: any, args?: any): void {
  if (args === undefined) {
    console.info(`[RedType Framework] ${message}`);
    return;
  }
  console.info(`[RedType Framework] ${message} ${args}`);
}
