// Shared types and interfaces for the example module
export interface ExampleConfig {
  enabled: boolean;
  maxUsers: number;
  features: string[];
}

export interface ExampleUser {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

export interface ExampleEvent {
  type: "join" | "leave" | "action";
  userId: string;
  data?: any;
  timestamp: Date;
}

export const EXAMPLE_EVENTS = {
  USER_JOIN: "example:user:join",
  USER_LEAVE: "example:user:leave",
  USER_ACTION: "example:user:action",
  CONFIG_UPDATE: "example:config:update",
} as const;
