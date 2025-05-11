
export function log(message: any, args?: any): void {
  console.log(`[RedType Framework] ${message} ${args}`);
}
export function logError(message: any , args?: any): void {
  console.error(`[RedType Framework] ${message} ${args}`);
}
export function logWarning(message: any, args?: any): void {
  console.warn(`[RedType Framework] ${message} ${args}`);
}
export function logInfo(message: any,args?: any): void {
  console.info(`[RedType Framework] ${message} ${args}`);
}