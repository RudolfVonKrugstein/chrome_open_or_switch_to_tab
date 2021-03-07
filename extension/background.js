/**
 * Receive Messages from the "chrome or open tab" page.
 */
chrome.runtime.onMessage.addListener( function(message, sender, sendResponse) {
    // Forward the message to runTabSwitchCommand
    runTabSwitchCommand(message, function(response) {
        sendResponse(response)
        if (response) {
            // We switched tabs! Close the old tab after a short timeout.
            // If we don't add the timeout, we close there is a problem with which tab
            // is active afterwards.
            setTimeout(() => {
                chrome.tabs.remove(sender.tab.id)
            }, 500)
        }
    })
    // Return true because we will use the sendResponse message
    return true
});

/**
 * Run a command to switch tabs.
 * @param msg The message with the structure of the command.
 * @param sendResponse Callback function. Called with "true" if we switched a tab, and "false" if we did not.
 */
function runTabSwitchCommand(msg, sendResponse) {
    switch (msg["command"]) {
        case "activate_tab":
            // Just switch to a tab by id
            tabId = msg["tabId"]
            chrome.tabs.update(tabId, {highlighted: true});
            sendResponse(true)
            return
        case "activate_tab_by_regex":
            // Search through the tabs urls by regex
            // Build the regex
            regex = new RegExp("^" + msg["regex"])
            // Get all tabs
            chrome.tabs.query({}, (tabs) => {
                for (const tab of tabs) {
                    // Filter tab by url-regex
                    if (tab.id >= 0 && regex.test(tab.url)) {
                        chrome.tabs.update(tab.id, {highlighted: true, active: true});
                        sendResponse(true) // Tell them, that we switched tabs
                        return
                    }
                }
                // Tab not found!
                sendResponse(false) // Tell them, that we did not switch tabs
                return
            });
            return
        default:
            // Unkown command, log the message
            console.log("Received: " + JSON.stringify(msg));
            sendResponse(false) // Tell them, that we did not switch tabs
            return
    }
}

