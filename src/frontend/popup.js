"use strict";

require("./popup.css");

(function () {
  const sessions = [];
  chrome.runtime.connect({ name: "background-connection" });
  chrome.runtime.sendMessage(
    { type: "session-list-request" },
    (response) => {
      const containerElement = document.getElementById("container");
      const parsedResponse = JSON.parse(response);
      sessions.push([]);
      if(parsedResponse.length === 1) {
        containerElement.innerHTML += `<p class="first-launch">Start by opening a session from Leapp</p>`
      } else {
        parsedResponse.forEach((session, sessionId) => {
          if(session.data) {
            sessions.push(session.tabsList);
            const sessionName = session.data.sessionName;
            const sessionRole = session.data.sessionRole;
            const sessionRegion = session.data.sessionRegion;
            containerElement.innerHTML +=
              `<div class="row" data-session-id="${sessionId}">
                <img src="icons/aws-dark.png" alt="provider-icon">
                <div class="session-info-container">
                    <p class="session-name">Name: ${sessionName}</p>
                    <p class="session-role">Role: ${sessionRole}</p>
                </div>
                <span class="badge badge-gray badge-region">${sessionRegion}</span>
              </div>`
          }
        })
      }
      const elements = document.querySelectorAll('.row');
      elements.forEach(el => {
        el.addEventListener("click", function handleClick(event) {
          event.stopPropagation();
          const sessionId = this.getAttribute("data-session-id");
          const tabId = sessions[sessionId][0];
          chrome.runtime.sendMessage({ type: "focus-tab", tabId: tabId }, () => {})
        });
      });
    }
  );
})();
