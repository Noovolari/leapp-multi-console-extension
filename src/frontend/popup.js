"use strict";

require("./popup.css");

(function () {
  chrome.runtime.connect({name: "background-connection"});
  chrome.runtime.sendMessage(
    {type: "session-list-request"},
    (response) => {
      const sessions = [[]];
      const containerElement = document.getElementById("container");
      const sessionList = JSON.parse(response);
      const tabsListSum = sessionList
        .filter((session) => session.data)
        .map((session) => session.tabsList.length)
        .reduce((prev, curr) => prev + curr, 0);
      if (tabsListSum === 0) {
        containerElement.innerHTML += '<p class="first-launch">Start by opening a session from Leapp</p>'
      } else {
        for (const [sessionId, session] of sessionList.entries()) {
          if (session.data) {
            sessions.push(session.tabsList);
            if (session.tabsList.length > 0) {
              const sessionName = session.data.sessionName;
              const sessionRole = session.data.sessionRole;
              const sessionRegion = session.data.sessionRegion;
              const sessionType = session.data.sessionType;
              containerElement.innerHTML +=
                `<div class="row" data-session-id="${sessionId}">
                <img src="icons/${sessionType}.png" alt="provider-icon">
                <div class="session-info-container">
                    <p class="session-name">Name: ${sessionName}</p>
                    <p class="session-role">Role: ${sessionRole}</p>
                </div>
                <div class="badge-container">
                    <span class="badge badge-gray badge-region">${sessionRegion}</span>
                </div>
              </div>`
            }
          }
        }
        const elements = document.querySelectorAll('.row');
        elements.forEach(el => {
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            const sessionId = el.getAttribute("data-session-id");
            const tabId = sessions[sessionId][0];
            chrome.runtime.sendMessage({type: "focus-tab", tabId: tabId}, () => {
            })
          });
        });
      }
    }
  );
})();
