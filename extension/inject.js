// (function () {
//     window.location.assign('https://www.nytimes.com/games/wordle/index.html');
// })();

(function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }

  window.hasRun = true;
  console.log("injected");

  let states = {
    microphone: true,
    camera: false,
    screenshare: false,
    isAppRunning: false,
  };

  const stateIDElementIDMapping = {
    microphone: "tippy-40",
    /*
    camera: "bttnCam",
    screenshare: "bttnScreen",
    */
  };

  const elementIDStateClassesMapping = {
    microphone: { enabled: "Mute", disabled: "Unmute" },
    camera: { enabled: "classEnabled", disabled: "classDisabled" },
    screenshare: { enabled: "classEnabled", disabled: "classDisabled" },
  };

  let intervalChecker = undefined;
  function tick() {
    console.log("tick");
    Object.keys(stateIDElementIDMapping).forEach((stateID) => {
      console.log(stateID);
      let button = document.getElementById(stateIDElementIDMapping[stateID]);
      if (button !== null) {
        console.log("button found");
        if (
          button.getAttribute("aria-label") ==
          elementIDStateClassesMapping[stateID][
            states[stateID] ? "disabled" : "enabled"
          ]
        ) {
          console.log("click");
          button.click();
        }
      } else {
        console.log("button not present");
      }
    });
  }

  browser.runtime.onMessage.addListener((message) => {
    switch (message.command) {
      case "start":
        if (!states["isAppRunning"]) {
          intervalChecker = setInterval(tick, 1000);
          states["isAppRunning"] = true;
        }
        break;
      case "stop":
        if (intervalChecker !== undefined && states["isAppRunning"]) {
          clearInterval(intervalChecker);
          states["isAppRunning"] = false;
        }
        break;
      case "stateChanged":
        states = message.data;
        console.log(states);
        break;
      default:
        break;
    }
  });
})();
