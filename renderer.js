const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  // Load settings
  ipcRenderer.send("load-settings");
  ipcRenderer.on("load-settings-reply", (event, data) => {
    if (data) {
      const { settings } = data;
      document.getElementById("centerKeybind").value = settings.centerWindow.keybinding || "";
      document.getElementById("resizeKeybind").value = settings.resizeWindow.keybinding || "";

      // Set slider values based on settings
      let sizes = ["small", "medium", "large"];
      sizes.forEach((size, i) => {
        document.getElementById(`${size}WidthPercentage`).value =
          settings.resizeWindow.windowSizePercentages[i].width;
        document.getElementById(`${size}WidthPercentage-value`).textContent =
          settings.resizeWindow.windowSizePercentages[i].width + "%";

        document.getElementById(`${size}HeightPercentage`).value =
          settings.resizeWindow.windowSizePercentages[i].height;
        document.getElementById(`${size}HeightPercentage-value`).textContent =
          settings.resizeWindow.windowSizePercentages[i].height + "%";
      });
    }
  });

  // Update labels for width percentage
  document.querySelectorAll('input[type="range"]').forEach((input) => {
    input.addEventListener("input", () => {
      const spanId = input.id + "-value";
      document.getElementById(spanId).textContent = input.value + "%";
    });
  });
});

function openTab(event, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  document.getElementById(tabName).style.display = "block";
  event?.currentTarget.classList.add("active");
}

function saveCenterSettings(event) {
  event.preventDefault();
  const centerKeybind = document.getElementById("centerKeybind").value;
  const data = { centerKeybind };
  ipcRenderer.send("save-center-settings", data);
}

async function saveResizeSettings(event) {
  event.preventDefault();
  const resizeKeybind = document.getElementById("resizeKeybind").value;

  // Get percentage values from slider values (assuming 0-100 range)
  const smallWidthPercentage = document.getElementById("smallWidthPercentage").value;
  const smallHeightPercentage = document.getElementById("smallHeightPercentage").value;
  const mediumWidthPercentage = document.getElementById("mediumWidthPercentage").value;
  const mediumHeightPercentage = document.getElementById("mediumHeightPercentage").value;
  const largeWidthPercentage = document.getElementById("largeWidthPercentage").value;
  const largeHeightPercentage = document.getElementById("largeHeightPercentage").value;

  const data = {
    resizeKeybind,
    windowSizePercentages: [
      { width: smallWidthPercentage, height: smallHeightPercentage },
      { width: mediumWidthPercentage, height: mediumHeightPercentage },
      { width: largeWidthPercentage, height: largeHeightPercentage },
    ],
  };
  ipcRenderer.send("save-resize-settings", data);
}

function resetSettings() {
  ipcRenderer.send("reset-settings");
}
