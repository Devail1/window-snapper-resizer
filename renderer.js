const { ipcRenderer } = require("electron");
const hotkeys = require("hotkeys-js");

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
          settings.resizeWindow.windowSizePercentages[i].width * 100;
        document.getElementById(`${size}HeightPercentage`).value =
          settings.resizeWindow.windowSizePercentages[i].height * 100;
      });
    }
  });

  let currentKeybindingInput = null;
  let keyCombinations = []; // Array to store key combinations

  function bindKeybindingInput(input) {
    currentKeybindingInput = input;
    keyCombinations = []; // Reset key combinations on focus
    hotkeys.setScope("keybinding-input");
    hotkeys("esc", "keybinding-input", function (event, handler) {
      input.value = "";
      keyCombinations = [];
      hotkeys.deleteScope("keybinding-input");
      currentKeybindingInput = null;
    });
  }

  function unbindKeybindingInput() {
    if (currentKeybindingInput) {
      hotkeys.deleteScope("keybinding-input");
      currentKeybindingInput = null;
    }
  }

  document.querySelectorAll(".keybinding-input").forEach((input) => {
    input.addEventListener("focus", () => {
      bindKeybindingInput(input);
    });

    input.addEventListener("blur", () => {
      unbindKeybindingInput();
      // Update input field value only if there are captured key combinations
      if (keyCombinations.length > 0) {
        input.value = keyCombinations.join(" + "); // Join combinations with "+"
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.code === "Escape") {
        // Reset on Esc key press (optional)
        keyCombinations = [];
        currentKeybindingInput.value = "";
        return;
      }

      // Only prevent default behavior while actively capturing
      event.stopPropagation(); // Prevent event from bubbling up
      if (event.code === "Delete" || event.code === "Backspace") {
        return;
      }
      if (keyCombinations.length < 3) {
        event.preventDefault();
        // Allow Delete and Backspace for normal deletion

        if (currentKeybindingInput) {
          keyCombinations.push(event.key); // Append to the array

          console.log("Current key combinations:", keyCombinations.join(" + "));
          currentKeybindingInput.value = keyCombinations.join(" + ");
        }
      }
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
  const smallWidthPercentage = document.getElementById("smallWidthPercentage").value / 100;
  const smallHeightPercentage = document.getElementById("smallHeightPercentage").value / 100;
  const mediumWidthPercentage = document.getElementById("mediumWidthPercentage").value / 100;
  const mediumHeightPercentage = document.getElementById("mediumHeightPercentage").value / 100;
  const largeWidthPercentage = document.getElementById("largeWidthPercentage").value / 100;
  const largeHeightPercentage = document.getElementById("largeHeightPercentage").value / 100;

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
