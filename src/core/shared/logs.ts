export function log(message: any, args?: any): void {
  if (args === undefined) {
    console.log(`[CFXType Framework] ${message}`);
    return;
  }
  console.log(`[CFXType Framework] ${message} ${args}`);
}
export function logError(message: any, args?: any): void {
  if (args === undefined) {
    console.error(`[CFXType Framework] ${message}`);
    return;
  }
  console.error(`[CFXType Framework] ${message} ${args}`);
}
export function logWarning(message: any, args?: any): void {
  if (args === undefined) {
    console.warn(`[CFXType Framework] ${message}`);
    return;
  }
  console.warn(`[CFXType Framework] ${message} ${args}`);
}
export function logInfo(message: any, args?: any): void {
  if (args === undefined) {
    console.info(`[CFXType Framework] ${message}`);
    return;
  }
  console.info(`[CFXType Framework] ${message} ${args}`);
}
