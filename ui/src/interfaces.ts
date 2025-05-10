export interface UIConfig {
    type: string;
    title?: string;
    props?: Record<string, any>;
    showControls?: boolean;
    layer?: number; 
    exclusive?: string[]; 
    hidden?: boolean;
 }
 
 