console.log("background loaded", chrome);

function getHtmlDom() {
    return document.getElementsByTagName("html")[0].innerHTML;
}
function onTabLoaded(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function onUpdated(id, change) {
            if (id === tabId && change.status === "complete") {
                chrome.tabs.onUpdated.removeListener(onUpdated);
                resolve();
            }
        });
    });
}

try {
    chrome.action.onClicked.addListener(async (tab) => {
        let htmlContent = "";
        await chrome.scripting
            .executeScript({
                target: {tabId: tab.id},
                func: () => {
                    htmlContent = document.getElementsByTagName("html")[0].innerHTML;
                    // localStorage.sharedData = htmlContent;
                    return htmlContent;
                    // console.log(html);
                },
            })
            .then(async (result) => {
                let innerHtml = result[0].result;
                const newTabUrl = chrome.runtime.getURL(
                    "/src/pages/newtab/index.html"
                );
                chrome.tabs.query({ url: newTabUrl }, async (tabs) => {
                    let tab = null;
                    if (tabs.length) {
                        tab = await chrome.tabs.update(tabs[0].id, {active: true});
                    } else {
                        tab = await chrome.tabs.create({ url: newTabUrl, selected: true });
                        await onTabLoaded(tab.id);
                    }

                    if (tab.id != null) {
                        await chrome.tabs.sendMessage(tab.id, {
                            action: "setData",
                            data: innerHtml,
                        });
                    }
                });
            })
            .catch((error) => {
                console.log("An error occurred", error);
                const newTabUrl = chrome.runtime.getURL(
                    "/src/pages/newtab/index.html"
                );
                chrome.tabs.query({ url: newTabUrl }, async (tabs) => {
                    let tab = null;
                    if (tabs.length) {
                        tab = await chrome.tabs.update(tabs[0].id, {active: true});
                    } else {
                        tab = await chrome.tabs.create({ url: newTabUrl, selected: true });
                        await onTabLoaded(tab.id);
                    }

                    if (tab.id != null) {
                        await chrome.tabs.sendMessage(tab.id, {
                            action: "errorMessage",
                            data: "An error occurred: " + error.message,
                        });
                    }
                });
            });
    });

    //       var optionsUrl = chrome.extension.getURL('options.html');

    // chrome.tabs.query({url: optionsUrl}, function(tabs) {
    //     if (tabs.length) {
    //         chrome.tabs.update(tabs[0].id, {active: true});
    //     } else {
    //         chrome.tabs.create({url: optionsUrl});
    //     }
    // });

    // chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
    //     chrome.scripting.executeScript(
    //       {
    //         target: {tabId: tab.id},
    //         // files: ['myscript.js'],
    //         function: () => {
    //           let html = document.getElementsByTagName('html')[0].innerHTML;
    //           console.log(html);

    //         }, // files or function, both do not work.
    //       })
    //   })

    // chrome.tabs.executeScript( null, {code: '(' + getHtmlDom + ')();'}, (result) => {
    //     console.log('result', result);
    //     chrome.action.onClicked.addListener(function(tab) {
    //         chrome.tabs.create({ url: chrome.runtime.getURL('/src/pages/newtab/index.html'), selected: true });
    //     });

    // } );
} catch (ex) {
    console.log(ex);
}

// https://stackoverflow.com/questions/28799892/how-to-launch-a-new-window-in-google-chrome-extension
