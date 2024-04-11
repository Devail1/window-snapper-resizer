const childProcess = require("child_process");
const path = require("path");

let autohotkeyProcess;

async function reloadAutoHotkey() {
  if (autohotkeyProcess) {
    try {
      await autohotkeyProcess.kill();
    } catch (error) {
      console.error("Error killing child process:", error);
    }
  }
  const resourcesPath = path.join(process.cwd(), "/resources");
  const autohotkeyPath = path.join(resourcesPath, "autohotkey", "AutoHotkey32.exe");
  const scriptPath = path.join(resourcesPath, "autohotkey", "center-window-resize.ahk");

  try {
    autohotkeyProcess = childProcess.spawn(autohotkeyPath, [scriptPath]);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Error spawning AutoHotkey:", error.message);
    } else {
      console.error("Unexpected error spawning AutoHotkey:", error);
    }
  }
}

module.exports = {
  autohotkeyProcess, // Expose autohotkeyProcess for potential monitoring (optional)
  reloadAutoHotkey,
};
