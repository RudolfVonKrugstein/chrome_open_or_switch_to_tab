function on_activate_result(url, result) {
    if (!result) {
        document.location.replace(url)
    }
}

function activate_or_goto(url, regex) {
    if (regex !== null && regex !== "") {
        chrome.runtime.sendMessage({
            "command": "activate_tab_by_regex",
            "regex": regex,
        }, (res) => on_activate_result(url, res));
    } else {
        chrome.runtime.sendMessage({
            "command": "activate_tab_by_regex",
            "regex": url.replaceAll(".", "\\.").replaceAll("?", "\\?") + ".*",
        }, (res) => on_activate_result(url, res));
    }
}

function on_load() {
    // Connect the buttons
    document.getElementById("go_button").onclick = goto_with_form_data
    document.getElementById("copy_link_button").onclick = copy_link

    // Extract query string parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("url")) {
        activate_or_goto(urlParams.get("url"), urlParams.get("regex"))
    }
}

document.addEventListener('DOMContentLoaded', on_load, false);

function goto_with_form_data() {
    url = document.getElementById("url_input").value
    regex = document.getElementById("regex_input").value
    document.location.replace(create_link(url, regex))
}

function create_link(url, regex) {
    var query = new URLSearchParams();
    query.append("url", url)
    if (regex !== null && regex !== "") {
        query.append("regex", regex)
    }
    return location.origin + location.pathname + "?" + query.toString()
}

function copy_link() {
    url = document.getElementById("url_input").value
    regex = document.getElementById("regex_input").value
    navigator.clipboard.writeText(create_link(url, regex))
}
