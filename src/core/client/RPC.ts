import {
  INativeRPCRequest,
  INativeRPCResponse,
} from "../shared/interfaces/RPC";

export class ClientRPC {
  public static handleRequest(request: INativeRPCRequest): void {
    try {
      const nativeFunc = (global as any)[request.nativeName];
      if (typeof nativeFunc !== "function") {
        throw new Error(`Native ${request.nativeName} not found`);
      }

      const result = nativeFunc(...request.args);

      const response: INativeRPCResponse = {
        id: request.id,
        success: true,
        result,
      };

      emitNet("ctf:rpc:native:response", response);
    } catch (error) {
      const response: INativeRPCResponse = {
        id: request.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      emitNet("ctf:rpc:native:response", response);
    }
  }

  public static init(): void {
    onNet("ctf:rpc:native:request", (request: INativeRPCRequest) => {
      this.handleRequest(request);
    });
  }
}
