// ===============================================================
// 2. XHR functions

import {
  xirsysAuthString,
  xirsysTokenExpireTime,
  xirsysUrl,
} from "@lib/webrtc/constants";
import { logIntoUIAreaAndConsole } from "@lib/webrtc/utils/html-helpers";

export function promisifiedXhrRequest(
  method,
  url,
  authString,
  logMessage,
  body = null
) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function ($evt) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let res = JSON.parse(xhr.responseText);
        console.log("promisifiedXhrRequest response: ", res);
      }
    };
    xhr.open(method, url, true);
    if (authString) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(authString));
    }
    xhr.onload = function (event) {
      if (this.status >= 200 && this.status < 300) {
        console.log(
          `${logMessage} xhr.response: `,
          xhr.response,
          "event object: ",
          event
        );
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    if (body) {
      xhr.setRequestHeader("Content-Type", "application/json");
    }
    xhr.send(body);
  });
}

export async function postCreateXirsysChannel(channelId) {
  return promisifiedXhrRequest(
    "PUT",
    `${xirsysUrl}/_ns/${channelId}`,
    xirsysAuthString,
    "postCreateXirsysChannelPromise() "
  );
}

export async function putTokenXirsysChannel(channelId, user_name) {
  return promisifiedXhrRequest(
    "PUT",
    `${xirsysUrl}/_token/${channelId}?k=${user_name}&expire=${xirsysTokenExpireTime}`,
    xirsysAuthString,
    "putTokenXirsysChannelPromise() "
  );
}

export async function getHostXirsysChannel(user_name) {
  return promisifiedXhrRequest(
    "GET",
    `${xirsysUrl}/_host?type=signal&k=${user_name}`,
    xirsysAuthString,
    "getHostXirsysChannelPromise() "
  );
}

export async function putIceServersXirsysChannel(channelId) {
  return promisifiedXhrRequest(
    "PUT",
    `${xirsysUrl}/_turn/${channelId}`,
    xirsysAuthString,
    "putIceServersXirsysChannelPromise() ",
    JSON.stringify({ format: "urls", expire: xirsysTokenExpireTime })
  );
}

export function getAllConnectedUsersXirsys(channel_Id) {
  return promisifiedXhrRequest(
    "GET",
    `${xirsysUrl}/_subs/${channel_Id}`,
    xirsysAuthString,
    "getXirsysChannelUsersPromise() "
  )
    .then((connectedUsersRes) => {
      console.log("getXirsysChannelUsers:", connectedUsersRes);
      const allConnectedUsers = JSON.parse(connectedUsersRes).v;
      if (!allConnectedUsers) {
        console.log("getXirsysChannelUsers res error");
        return;
      }
      return allConnectedUsers;
    })
    .catch((e) =>
      logIntoUIAreaAndConsole("getAllConnectedUsersXirsys error:", e)
    );
}
