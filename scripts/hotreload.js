/**
 * CFXType Framework - Hot Reload Script
 * Restarts resources through txAdmin API
 */

const RESTART_INTERVAL = 2000; // 30 seconds (adjust as needed)
const RESOURCES_TO_WATCH = ["redtype-framework"]; // Add resources to watch
let lastRestart = 0;

/**
 * Function to restart a specific resource
 * @param {string} resourceName - Name of the resource to restart
 */
function restartResource(resourceName) {
  const now = Date.now();

  // Prevent restarting too frequently
  if (now - lastRestart < RESTART_INTERVAL) {
    console.log(
      `[RTF-HotReload] Skipping restart, cooldown active (${Math.round(
        (RESTART_INTERVAL - (now - lastRestart)) / 1000
      )}s left)`
    );
    return;
  }

  try {
    // Use ExecuteCommand to restart the resource
    ExecuteCommand(`ensure ${resourceName}`);
    console.log(`[RTF-HotReload] Restarted resource: ${resourceName}`);
    lastRestart = now;
  } catch (error) {
    console.error(
      `[RTF-HotReload] Failed to restart resource: ${resourceName}`,
      error
    );
  }
}

/**
 * Setup file change watcher via txAdmin events
 */
function setupHotReload() {
  on("txAdmin:events:resourceStarted", (resourceName) => {
    console.log(`[RTF-HotReload] Resource started: ${resourceName}`);
  });

  on("txAdmin:events:configChanged", () => {
    console.log(
      "[RTF-HotReload] Configuration changed, checking for resource restarts"
    );

    // Restart monitored resources when config changes
    RESOURCES_TO_WATCH.forEach((resource) => {
      restartResource(resource);
    });
  });

  console.log("[RTF-HotReload] Hot reload system initialized");
}

// Initialize when resource starts
on("onResourceStart", (resourceName) => {
  if (resourceName === GetCurrentResourceName()) {
    setupHotReload();
  }
});

// Export functions for possible use in other resources
exports("restartResource", restartResource);
/**
 * Function to watch for build completion and trigger reload
 */
function watchForBuildCompletion() {
  // Define a path for a potential build status file or marker
  const buildStatusPath =
    GetResourcePath(GetCurrentResourceName()) + "/build_completed";

  // Set up a timer to check for build completion indicators
  setInterval(() => {
    // This is a placeholder for actual build detection
    // In a real implementation, you might:
    // 1. Check for a specific file that indicates build completion
    // 2. Use a network request to check build status
    // 3. Listen to an event emitted by the build process

    if (DoesFileExist(buildStatusPath)) {
      console.log(
        "[RTF-HotReload] Build completion detected, triggering reload"
      );

      // Clean up the marker file
      DeleteFile(buildStatusPath);

      // Restart resources after build
      RESOURCES_TO_WATCH.forEach((resource) => {
        restartResource(resource);
      });
    }
  }, 5000); // Check every 5 seconds

  console.log("[RTF-HotReload] Build completion watcher initialized");
}

// Initialize build watcher when resource starts
on("onResourceStart", (resourceName) => {
  if (resourceName === GetCurrentResourceName()) {
    setupHotReload();
    watchForBuildCompletion();
  }
});
