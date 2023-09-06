function setFormInstance() {
  // for setting form instance inside input fields
  document.getElementById("extension-form").addEventListener("keyup", () => {
    let email = document.getElementById("email").value;
    let ssh = document.getElementById("ssh-key").value;
    inputInstance = {
      email: email,
      ssh: ssh,
    };
    chrome.storage.local.set({
      inputInstance: inputInstance,
    });
  });
}

function setJSONDataFormInstance() {
  // for setting instance inside import textarea form
  document.getElementById("import-form").addEventListener("keyup", () => {
    let jsonData = document.getElementById("json-data").value;
    inputJsonDataInstance = jsonData;
    chrome.storage.sync.set({
      inputJsonDataInstance: inputJsonDataInstance,
    });
  });
}

function getFormInstance() {
  chrome.storage.local.get("inputInstance", function (result) {
    document.getElementById("email").value = result.inputInstance.email;
    document.getElementById("ssh-key").textContent = result.inputInstance.ssh;
  });
}

function getJSONDataFormInstance() {
  chrome.storage.sync.get("inputJsonDataInstance", function (result) {
    document.getElementById("json-data").textContent =
      result.inputJsonDataInstance;
  });
}

function exportData() {
  let exportButton = document.getElementById("export-button");
  exportButton.addEventListener("click", () => {
    let data = [];
    let rows = document.querySelectorAll(".email-list-row tr");
    // console.log(rows.length);
    for (let i = 0; i < rows.length; i++) {
      let row = {};
      let cols = rows[i].querySelectorAll("#ssh-key-list, .email-list-link");

      row.email = cols[0].innerText;
      row.ssh = cols[1].innerText;

      data.push(row);
    }
    console.log(data);
    downloadObjectAsJson(data, "email-list");
  });
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, undefined, 2));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// function exportData() {
//   let exportButton = document.getElementById("export-button");
//   exportButton.addEventListener("click", () => {
//     let csv = [];
//     let filename = "email-list.csv";
//     let rows = document.querySelectorAll(".email-list tr");
//     // console.log(rows.length);
//     for (let i = 0; i < rows.length; i++) {
//       let row = [];
//       let cols = rows[i].querySelectorAll(
//         ".email-col-1, .col-ssh, #ssh-key-list, .email-list-link"
//       );

//       for (let j = 0; j < cols.length; j++) {
//         row.push(cols[j].innerText);
//       }

//       csv.push(row.join(","));
//     }
//     // csv.join("\n");
//     // console.log(csv);

//     // Download CSV file
//     downloadCSV(csv.join("\n"), filename);
//   });
// }

// function downloadCSV(csv, filename) {
//   let csvFile;
//   let downloadLink;

//   // CSV file
//   csvFile = new Blob([csv], { type: "text/csv" });

//   // Download link
//   downloadLink = document.createElement("a");

//   // File name
//   downloadLink.download = filename;

//   // Create a link to the file
//   downloadLink.href = window.URL.createObjectURL(csvFile);

//   // Hide download link
//   downloadLink.style.display = "none";

//   // Add the link to DOM
//   document.body.appendChild(downloadLink);

//   // Click download link
//   downloadLink.click();
// }

function importData() {
  // for checking error in json format
  let errorJSONElement = document.createElement("span");
  errorJSONElement.classList.add("errorJSONClass");
  let errorJSONMessage = document.getElementsByClassName("error-json")[0];
  errorJSONContent = `
        <b>Not in JSON format</b><br/>`;
  errorJSONElement.innerHTML = errorJSONContent;
  // if valid json format but doesn't contain the key
  let invalidKeyElement = document.createElement("span");
  invalidKeyElement.classList.add("invalidKeyClass");
  let invalidKeyMessage = document.getElementsByClassName("error-key-json")[0];
  invalidKeyContent = `
        <b>Invalid key</b><br/>`;
  invalidKeyElement.innerHTML = invalidKeyContent;

  let importButton = document.getElementById("upload");
  importButton.addEventListener("click", () => {
    chrome.storage.sync.clear();
    document.getElementsByClassName("error-json")[0].style.display = "none";
    document.getElementsByClassName("error-key-json")[0].style.display = "none";
    let importData = document.getElementById("json-data").value;
    try {
      let importArray = JSON.parse(importData);
      if (Object.prototype.toString.apply(importArray) === "[object Object]") {
        importArray = [importArray];
      }
      // console.log(importArray);
      let count = 0;
      for (let i = 0; i < importArray.length; i++) {
        if (
          importArray[i].hasOwnProperty("email") &&
          importArray[i].hasOwnProperty("ssh")
        ) {
          let email = importArray[i].email;
          let ssh = importArray[i].ssh;

          let key = makeid(5);

          localStorage.setItem(
            key,
            JSON.stringify({
              email,
              ssh,
            })
          );
          addToList(key);
          count++;
        }
      }
      // console.log(importArray.length);
      // console.log(count);
      if (count != importArray.length) {
        if (
          document.getElementsByClassName("error-json")[0].style.display ===
            "none" ||
          document.getElementsByClassName("error-key-json")[0].style.display ===
            "none"
        ) {
          document.getElementsByClassName("error-json")[0].style.display ===
            "none";
          document.getElementsByClassName("error-key-json")[0].style.display =
            "block";
          invalidKeyMessage.append(invalidKeyElement);
        }
        return;
      }
    } catch (e) {
      if (
        document.getElementsByClassName("error-json")[0].style.display ===
          "none" ||
        document.getElementsByClassName("error-key-json")[0].style.display ===
          "none"
      ) {
        document.getElementsByClassName("error-key-json")[0].style.display =
          "none";
        document.getElementsByClassName("error-json")[0].style.display =
          "block";
        errorJSONMessage.append(errorJSONElement);
      }

      return;
    }
    document.getElementById("json-data").value = "";
    document.getElementById("list").checked = true;
  });
}

function listAllEmail() {
  keys = Object.keys(localStorage);
  i = 0;
  let key;

  for (; (key = keys[i]); i++) {
    addToList(key);
  }
}

function makeid(length) {
  let result = [];
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

function addSingleUserData() {
  // create error message for email
  let errorJSONElement = document.createElement("span");
  errorJSONElement.classList.add("errorJSONClass");
  let errorJSONMessage = document.getElementsByClassName("error-email")[0];
  errorJSONContent = `
        <b>invalid email</b><br/>`;
  errorJSONElement.innerHTML = errorJSONContent;

  // create error message for blank email
  let errorBlankEmailElement = document.createElement("span");
  errorBlankEmailElement.classList.add("errorJSONClass");
  let errorBlankEmailMessage =
    document.getElementsByClassName("error-blank-email")[0];
  errorBlankEmailContent = `
        <b>Email should not be blanked</b><br/>`;
  errorBlankEmailElement.innerHTML = errorBlankEmailContent;

  // create error message for blank ssh
  let errorBlankSshElement = document.createElement("span");
  errorBlankSshElement.classList.add("errorJSONClass");
  let errorBlankSshMessage =
    document.getElementsByClassName("error-blank-ssh")[0];
  errorBlankSshContent = `
        <b>Ssh should not be blanked</b><br/>`;
  errorBlankSshElement.innerHTML = errorBlankSshContent;

  let formButton = document.getElementById("form-button");
  formButton.addEventListener("click", () => {
    ;
    let email = document.getElementById("email").value;
    let ssh = document.getElementById("ssh-key").value;
    document.getElementsByClassName("error-email")[0].style.display = "none";
    document.getElementsByClassName("error-blank-email")[0].style.display =
      "none";
    document.getElementsByClassName("error-blank-ssh")[0].style.display =
      "none";
    let mailformat =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email == "" || email == " ") {
      if (
        document.getElementsByClassName("error-email")[0].style.display ===
          "none" ||
        document.getElementsByClassName("error-blank-email")[0].style
          .display === "none" ||
        document.getElementsByClassName("error-blank-ssh")[0].style.display ===
          "none"
      ) {
        document.getElementsByClassName("error-email")[0].style.display =
          "none";
        document.getElementsByClassName("error-blank-email")[0].style.display =
          "block";
        errorBlankEmailMessage.append(errorBlankEmailElement);
      }
    }

    if (ssh == "" || ssh == " ") {
      if (
        document.getElementsByClassName("error-email")[0].style.display ===
          "none" ||
        document.getElementsByClassName("error-blank-email")[0].style
          .display === "none" ||
        document.getElementsByClassName("error-blank-ssh")[0].style.display ===
          "none"
      ) {
        document.getElementsByClassName("error-blank-ssh")[0].style.display =
          "block";
        errorBlankSshMessage.append(errorBlankSshElement);
      }
      return;
    }

    if (!mailformat.test(email)) {
      if (
        document.getElementsByClassName("error-email")[0].style.display ===
          "none" ||
        document.getElementsByClassName("error-blank-email")[0].style
          .display === "none" ||
        document.getElementsByClassName("error-blank-ssh")[0].style.display ===
          "none"
      ) {
        document.getElementsByClassName("error-blank-email")[0].style.display =
          "none";
        document.getElementsByClassName("error-email")[0].style.display =
          "block";
        errorJSONMessage.append(errorJSONElement);
      }
      return;
    }
    let key = makeid(5);

    localStorage.setItem(
      key,
      JSON.stringify({
        email,
        ssh,
      })
    );
    addToList(key);
    document.getElementById("email").value = "";
    document.getElementById("ssh-key").value = "";
    chrome.storage.local.clear();
    document.getElementById("list").checked = true;
  });
}

function addToList(key) {
  userDetail = JSON.parse(localStorage.getItem(key));
  let email = userDetail.email;
  let sshKey = userDetail.ssh;

  let emailList = document.createElement("tr");
  emailList.classList.add("email-list-rows");
  let emailLists = document.getElementsByClassName("email-list-row")[0];

  emailRowContents = `
    <td class="column email-col">
    <a href="#" class="email-list-link">${email}</a>
    <textarea name="ssh-key" id="ssh-key-list">${sshKey}</textarea>
      </td>
      <td class="column delete-col">
      <input type="hidden" id="key" value="${key}">
    <i class="fa fa-trash"></i>
      </td>`;
  emailList.innerHTML = emailRowContents;
  emailLists.append(emailList);
  emailList
    .getElementsByClassName("fa-trash")[0]
    .addEventListener("click", removeEmailList);

  emailList
    .getElementsByClassName("email-list-link")[0]
    .addEventListener("click", checkTabUrl);
  emailList
    .getElementsByClassName("email-list-link")[0]
    .addEventListener("click", getParticulardetail);
  emailList
    .getElementsByClassName("email-list-link")[0]
    .addEventListener("click", async () => {
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        function() {
          chrome.storage.local.get("userClickedDetail", function (result) {
            document.getElementsByClassName("setting-input")[1].value =
              result.userClickedDetail.sshKey;
            document.getElementsByClassName("setting-input")[2].value =
              result.userClickedDetail.email;
          });
        },
      });
    });
}

function removeEmailList(event) {
  let buttonClicked = event.target;
  let key = buttonClicked.previousElementSibling.value;
  buttonClicked.parentElement.parentElement.remove();
  localStorage.removeItem(key);
}

function getParticulardetail(event) {
  let sshKey = event.target.nextElementSibling.textContent;
  let email = event.target.textContent;
  userClickedDetail = {
    sshKey,
    email,
  };
  chrome.storage.local.set({
    userClickedDetail: userClickedDetail,
  });
}

function checkTabUrl() {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    function (tabs) {
      let current_url = tabs[0].url;
      let local_url =
      "https://jenkins.searchunify.com/view/devops/job/server-access/build";
      if (current_url != local_url) {
        let newURL = local_url;
        chrome.tabs.create({
          url: newURL,
        });
      }
    }
  );
}

function getTaskData() {
  let xhr = new XMLHttpRequest();
  // console.log(xhr);
  xhr.open(
    "GET",
    // "https://jira.grazitti.com/rest/api/2/search?jql=assignee=currentuser() AND (status=3 OR status=10001) order%20by%20created%20desc &fields=id,key,summary,description,issuetype,status &maxResults=5",
    "https://jira.grazitti.com/rest/api/2/search?jql=assignee=currentuser() AND project = SDT AND issuetype=10003 AND (status=1 OR status=3 OR status=10002) order%20by%20created%20desc &fields=id,key,summary,description,issuetype,status &maxResults=5",
    true
  );
  xhr.onreadystatechange = function () {
    //   Check if vpn is not enabled
    if (xhr.readyState == 4 && xhr.status == 0) {
      document.getElementsByClassName("task-list")[0].style.display = "none";
      let vpnDisabledElement = document.createElement("div");
      vpnDisabledElement.classList.add("vpn-class");
      let vpnDisabledMessage = document.getElementsByClassName("task-lists")[0];
      vpnDisabledContent = `
        <h3>Your VPN is disabled, please enable your VPN in order to access JIRA Software.</h3>`;
      vpnDisabledElement.innerHTML = vpnDisabledContent;
      vpnDisabledMessage.append(vpnDisabledElement);
    }

    // check unauthorized user
    if (xhr.readyState == 4 && xhr.status == 400) {
      console.log("Unauthorzied");
      document.getElementsByClassName("task-list")[0].style.display = "none";
      let unauthorizedElement = document.createElement("div");
      unauthorizedElement.classList.add("unauthorized-class");
      let unauthorizedMessage =
        document.getElementsByClassName("task-lists")[0];
      unauthorizedUserContent = `
        <h3>please <a href="https://jira.grazitti.com/secure/Dashboard.jspa" target="_blank">Login</a> first in order to continue.</h3>`;
      unauthorizedElement.innerHTML = unauthorizedUserContent;
      unauthorizedMessage.append(unauthorizedElement);
    }

    //check authorized user
    if (xhr.readyState == 4 && xhr.status == 200) {
      // JSON.parse does not evaluate the attacker's scripts.
      let resp = JSON.parse(xhr.responseText);
      let respLength = resp.issues.length;
      console.log(resp);
      let counter = 0;
      for (let i = 0; i < respLength; i++) {
        let taskKey = resp.issues[i].key;
        let summary = resp.issues[i].fields.summary;

        // console.log(resp.issues[resp.issues.length-1].key);
        // console.log(taskKey);
        // console.log(summary);

        let taskList = document.createElement("tr");
        let taskLists = document.getElementsByClassName("task-list-row")[0];

        taskRowContents = `
      <td class="task-col-id">
      <a href="#" class="task-list-link">${taskKey}</a>
      </td>
      <td class="task-col-summary">
      <a href="#" class="task-list-summary">${summary}</a>
      </td>`;
        taskList.innerHTML = taskRowContents;
        taskLists.append(taskList);
        counter++; // increment the limit till it reaches to 5.

        //<----------------- if user clicks on task Id -------------------------->
        taskList
          .getElementsByClassName("task-list-link")[0]
          .addEventListener("click", getParticulartaskDetailBytaskId);

        taskList
          .getElementsByClassName("task-list-link")[0]
          .addEventListener("click", async () => {
            let [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });

            chrome.scripting.executeScript({
              target: {
                tabId: tab.id,
              },
              function() {
                chrome.storage.local.get(
                  "taskClickedDetail",
                  function (result) {
                    document.getElementsByClassName("setting-input")[0].value =
                      result.taskClickedDetail.taskId;
                    document.getElementsByClassName("setting-input")[3].value =
                      result.taskClickedDetail.summary;
                  }
                );
              },
            });
          });

        //<----------------- if user clicks on summary -------------------------->

        taskList
          .getElementsByClassName("task-list-summary")[0]
          .addEventListener("click", getParticulartaskDetailBytaskSummary);

        taskList
          .getElementsByClassName("task-list-summary")[0]
          .addEventListener("click", async () => {
            let [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true,
            });

            chrome.scripting.executeScript({
              target: {
                tabId: tab.id,
              },
              function() {
                chrome.storage.local.get(
                  "taskClickedDetail",
                  function (result) {
                    document.getElementsByClassName("setting-input")[0].value =
                      result.taskClickedDetail.taskId;
                    document.getElementsByClassName("setting-input")[3].value =
                      result.taskClickedDetail.summary;
                  }
                );
              },
            });
          });
      }

      // condition works if there are no work in progress or open status
      if (counter == 0) {
        document.getElementsByClassName("task-list")[0].style.display = "none";
        let statusElement = document.createElement("div");
        statusElement.classList.add("status-class");
        let statusMessage = document.getElementsByClassName("task-lists")[0];
        statusContent = `
        <h3>You have no Tasks currently .</h3>`;
        statusElement.innerHTML = statusContent;
        statusMessage.append(statusElement);
      }
    }

    //check condition if something went wrong !!
    if (xhr.readyState != 4 && xhr.status != 200 && xhr.status != 400) {
      document.getElementsByClassName("task-list")[0].style.display = "none";
      let errorElement = document.createElement("div");
      errorElement.classList.add("error-class");
      let errorMessage = document.getElementsByClassName("task-lists")[0];
      errorContent = `
        <h3>Something went wrong .</h3>`;
      errorElement.innerHTML = errorContent;
      errorMessage.append(errorElement);
    }
  };
  xhr.send();
}

function getParticulartaskDetailBytaskId(event) {
  let taskId = event.target.textContent;
  let summary =
    event.target.parentElement.nextElementSibling.children[0].textContent;
  taskClickedDetail = {
    taskId,
    summary,
  };
  chrome.storage.local.set({
    taskClickedDetail: taskClickedDetail,
  });
}

function getParticulartaskDetailBytaskSummary(event) {
  let taskId =
    event.target.parentElement.previousElementSibling.children[0].textContent;
  let summary = event.target.textContent;
  taskClickedDetail = {
    taskId,
    summary,
  };
  chrome.storage.local.set({
    taskClickedDetail: taskClickedDetail,
  });
}

getFormInstance();
getJSONDataFormInstance();
setFormInstance();
setJSONDataFormInstance();
exportData();
addSingleUserData();
importData();
listAllEmail();
getTaskData();
