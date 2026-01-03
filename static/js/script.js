function scanDevices() {
  const loading = document.getElementById("loading");
  const deviceList = document.getElementById("deviceList");
  loading.style.display = "flex";
  deviceList.innerHTML = "";

  fetch("/discover")
    .then((response) => response.json())
    .then((devices) => {
      loading.style.display = "none";
      devices.forEach((device) => {
        const li = document.createElement("div");
        li.className = "device-item";
        li.innerHTML = `
                    <h3><i class="fas fa-tv"></i> ${device.name}</h3>
                    <p><i class="fas fa-microchip"></i> ${device.model}</p>
                    <p><i class="fas fa-network-wired"></i> ${device.ip}</p>
                    ${
                      device.userdevicename !== device.name
                        ? `<p><i class="fas fa-tag"></i> ${device.userdevicename}</p>`
                        : ""
                    }
                `;
        li.onclick = () => (window.location.href = `/remote/${device.ip}`);
        deviceList.appendChild(li);
      });
      if (devices.length === 0) {
        deviceList.innerHTML =
          '<div class="status-message"><i class="fas fa-exclamation-circle"></i> No devices found</div>';
      }
    })
    .catch((error) => {
      loading.style.display = "none";
      deviceList.innerHTML =
        '<div class="status-message"><i class="fas fa-exclamation-triangle"></i> Error scanning for devices</div>';
      console.error("Error:", error);
    });
}

function sendCommand(command) {
  fetch("/command", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ip: ipAddress,
      command: command,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "error") {
        showToast("Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Failed to send command");
    });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "status-message";
  toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function loadApps() {
  const appsContainer = document.getElementById("apps-container");

  fetch(`/apps/${ipAddress}`)
    .then((response) => response.json())
    .then((apps) => {
      appsContainer.innerHTML = "";
      apps.forEach((app) => {
        const button = document.createElement("button");
        button.className = "app-button";
        button.onclick = () => launchApp(app.id, ipAddress);
        button.innerHTML = `
                    <img src="${app.icon_url}" alt="${app.name}" onerror="this.src='/static/images/app-placeholder.png'">
                    <span>${app.name}</span>
                `;
        appsContainer.appendChild(button);
      });
      if (apps.length === 0) {
        appsContainer.innerHTML =
          '<div class="status-message">No apps found</div>';
      }
    })
    .catch((error) => {
      console.error("Error loading apps:", error);
      appsContainer.innerHTML =
        '<div class="status-message">Error loading apps</div>';
    });
}

function launchApp(appId) {
  fetch(`/launch/${ipAddress}/${appId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "error") {
        console.error("Error launching app:", data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function pulse(elementOrSelector) {
  const element =
    typeof elementOrSelector === "string"
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  element.classList.add("active");
  setTimeout(() => {
    element.classList.remove("active");
  }, 200);
}

document.addEventListener("keydown", (event) => {
  console.log(event.key);
  switch (event.key) {
    case "ArrowUp":
      sendCommand("up");
      pulse(".nav-up");
      break;
    case "ArrowDown":
      sendCommand("down");
      pulse(".nav-down");
      break;
    case "ArrowLeft":
      sendCommand("left");
      pulse(".nav-left");
      break;
    case "ArrowRight":
      sendCommand("right");
      pulse(".nav-right");
      break;
    case "Enter":
      sendCommand("select");
      pulse(".nav-ok");
      break;

    case "Backspace":
      sendCommand("back");
      pulse(".cmd-back");
      break;
    case "Home":
      sendCommand("home");
      pulse(".cmd-home");
      break;

    case "PageUp":
    case ",":
    case "<":
      sendCommand("reverse");
      pulse(".ctl-rev");
      break;
    case "Space":
      sendCommand("play");
      pulse(".ctl-play");
      break;
    case "PageDown":
    case ".":
    case ">":
      sendCommand("forward");
      pulse(".ctl-fwd");
      break;

    case "=":
    case "+":
      sendCommand("volume_up");
      pulse(".vol-up");
      break;
    case "-":
      sendCommand("volume_down");
      pulse(".vol-down");
      break;
    case "\\":
      sendCommand("volume_mute");
      pulse(".vol-mute");
      break;
  }
});

// Load apps when the remote page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("apps-container")) {
    loadApps();
  }
});
