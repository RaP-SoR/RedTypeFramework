import { markRaw, reactive } from 'vue';

/**
 * Lädt automatisch alle UI-Komponenten aus Unterordnern im views-Verzeichnis
 */
export const loadUIComponents = async () => {
  const components: Record<string, any> = reactive({});
  
  const modules = import.meta.glob('../views/**/*.vue');
  const disabledModules = new Set();

  if (import.meta.env.DEV) {
    const disabledFiles = import.meta.glob('../views/**/.skip', { eager: true });
    for (const disabledPath in disabledFiles) {
      const parts = disabledPath.split('/');
      const moduleName = parts[parts.indexOf('views') + 1];
      disabledModules.add(moduleName);
    }
  }

  for (const path in modules) {
    try {
      const moduleFolder = path.split('/')[path.split('/').indexOf('views') + 1];

      if (disabledModules.has(moduleFolder)) {
        console.log(`Überspringe deaktiviertes UI-Modul: ${moduleFolder}`);
        continue;
      }
      const pathSegments = path.split('/');
      const fileName = pathSegments.pop()?.replace('.vue', '');
      const folderName = pathSegments[pathSegments.length - 1];
      
      if (fileName === 'index') {
        const module = await modules[path]() as { default: any };
        components[folderName] = markRaw(module.default);
      } else if (folderName !== 'views') {
        const componentName = `${folderName}-${fileName}`;
        const module = await modules[path]() as { default: any };
        components[componentName] = markRaw(module.default);
      } else {
        const module = await modules[path]() as { default: any };
        components[fileName?.toLowerCase() || ''] = markRaw(module.default);
      }
    } catch (error) {
      console.error(`Fehler beim Laden der UI-Komponente aus ${path}:`, error);
    }
  }
  
  return components;
};