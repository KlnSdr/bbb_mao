// alert(
//     'Solution: ' + JSON.parse(localStorage.getItem('nyt-wordle-state')).solution
// );

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */

/*
    function redirect(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        command: "redirect",
      });

    browser.runtime.onMessage.addListener((message) => {
    });

    browser.tabs
        .query({ active: true, currentWindow: true })
        .then(redirect)
        .catch(reportError);

*/

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
const extName = "mao";

function reportExecuteScriptError(error) {
  document.write(`Failed to execute ${extName}: ${error}`);
}

function reportError(error) {
  document.write(`Failed to execute ${extName} script: ${error.message}`);
}

function main() {
  let states = {
    microphone: true,
    camera: false,
    screenshare: false,
    isAppRunning: false,
  };

  const elementIDStateIDMapping = {
    microphone: "cbMicro",
    camera: "cbCam",
    screenshare: "cbShare",
  };

  function writeStatesToStore() {
    browser.storage.sync.set({
      states: states,
    });
  }

  function readStatesFromStore() {
    return new Promise((resolve) => {
      let storageItem = browser.storage.sync.get("states");

      storageItem
        .then((res) => {
          if (res["states"] !== undefined) {
            states = res.states;
            console.log(states);
          }

          resolve();
        })
        .catch((error) => {
          console.log(error);
          resolve();
        });
    });
  }

  function sendMessage(data) {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, data);
      })
      .catch(reportError);
  }

  function syncStatesWithStore() {
    return new Promise((resolve) => {
      readStatesFromStore().then(() => {
        Object.keys(states).forEach((state) => {
          if (state === "isAppRunning") {
            document.getElementById("bttnToggle").innerText = states[state]
              ? "stop"
              : "start";
            document.getElementById("lblAppState").innerText = states[state]
              ? "aktiv"
              : "inaktiv";
            document
              .getElementById("lblAppState")
              .classList.add(states[state] ? "appRunning" : "appNotRunning");
            document
              .getElementById("lblAppState")
              .classList.remove(states[state] ? "appNotRunning" : "appRunning");

            return;
          }
          document.getElementById(elementIDStateIDMapping[state]).checked =
            states[state];
        });

        sendMessage({ command: states["isAppRunning"] ? "start" : "stop" });
        sendMessage({ command: "stateChanged", data: states });
      });
      resolve();
    });
  }

  function checkStateChanged(event) {
    if (event.target !== undefined) {
      states[event.target.value] = event.target.checked;
      writeStatesToStore();
      sendMessage({
        command: "stateChanged",
        data: states,
      });
    }
  }

  function toggleState() {
    states["isAppRunning"] = !states["isAppRunning"];
    writeStatesToStore();

    // display what happens when button is clicked again
    document.getElementById("bttnToggle").innerText = states["isAppRunning"]
      ? "stop"
      : "start";
    document.getElementById("lblAppState").innerText = states["isAppRunning"]
      ? "aktiv"
      : "inaktiv";
    document
      .getElementById("lblAppState")
      .classList.add(states["isAppRunning"] ? "appRunning" : "appNotRunning");
    document
      .getElementById("lblAppState")
      .classList.remove(
        states["isAppRunning"] ? "appNotRunning" : "appRunning"
      );

    // send new state as command to injected script
    sendMessage({ command: states["isAppRunning"] ? "start" : "stop" });
  }

  // sync with store =================
  syncStatesWithStore().then(() => {
    // add clicks ======================
    Array.from(document.getElementsByTagName("INPUT")).forEach((inp) => {
      inp.addEventListener("click", checkStateChanged);
    });

    document.getElementById("bttnToggle").addEventListener("click", () => {
      toggleState();
    });
  });
  // add clicks ======================
}
/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */

browser.tabs
  .executeScript({ file: "inject.js" })
  .then(main)
  .catch(reportExecuteScriptError);
