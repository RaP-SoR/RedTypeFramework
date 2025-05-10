export interface UIConfig {
    type: string;
    title?: string;
    props?: Record<string, any>;
    showControls?: boolean;
    layer?: number; // Z-Index Layer (höhere Zahl = mehr im Vordergrund)
    exclusive?: string[]; // Liste von UI-Typen, die nicht gleichzeitig angezeigt werden können
    hidden?: boolean;
 }
 
 