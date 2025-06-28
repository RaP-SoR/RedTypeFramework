export interface INativeRPCRequest {
  id: string;
  nativeName: string;
  args: any[];
  timeout?: number;
}

export interface INativeRPCResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}
