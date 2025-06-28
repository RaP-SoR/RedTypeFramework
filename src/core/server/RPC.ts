import {
  INativeRPCRequest,
  INativeRPCResponse,
} from "../shared/interfaces/RPC";

export class ServerRPC {
  private static pendingRequests: Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();

  private static generateId(): string {
    return `rpc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public static async call(
    source: number,
    nativeName: string,
    args: any[] = [],
    timeout: number = 5000
  ): Promise<any> {
    const requestId = this.generateId();

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`RPC timeout for native ${nativeName}`));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      const request: INativeRPCRequest = {
        id: requestId,
        nativeName,
        args,
        timeout,
      };

      emitNet("ctf:rpc:native:request", source, request);
    });
  }

  public static handleResponse(response: INativeRPCResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.success) {
      pending.resolve(response.result);
    } else {
      pending.reject(new Error(response.error || "Unknown RPC error"));
    }
  }

  public static init(): void {
    onNet("ctf:rpc:native:response", (response: INativeRPCResponse) => {
      this.handleResponse(response);
    });
  }
}
