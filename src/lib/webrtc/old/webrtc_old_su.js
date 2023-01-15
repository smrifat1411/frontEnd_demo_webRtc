"use strict";

// 0. Constants

let mediaStreamConstraints = { video: true, audio: false };
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

// 0.1
let device_name = null; // exm.: "smartunit_1636583903.8396943"
let secret_pin = null; // 5-digits
const keymaster_url = "https://keymaster.viewpointsystem.com";
let token_host_channel_on_pin_from_keymaster = null;
let rtc_configuration = null;

// 0.2
const streaming_protocol_version = 0;
let connection_state = {
  rtcConnectionState: "",
  wsConnectionState: "",
  hangupRequired: false,
  sdpAnswerReceived: false,
};
let rtc_peer_connection = null;
let rtc_peer_successful_connections_counter = 0;
let local_media_stream_promise = null;
let local_media_stream = null;
let ws_conn = null;
const WS_CONNECTION_STATES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
};
let remote_peer_id = null;
let rtc_send_channel_keepAlive = null;
const send_channel_keepAlive = "KeepAliveChannel";
let rtc_send_channel_annotation = null;
const send_channel_annotation = "AnnotationsChannel";

let ice_incoming_counter = 0;
let ice_outgoing_counter = 0;

// 1. UI-display functions

function setStatus(text) {
  console.log(text);
  let span = document.getElementById("status");
  // Don't set the status if it already contains an error
  if (!span.classList.contains("error")) {
    span.textContent = text;
  }
}

function setError(text) {
  console.error(text);
  let span = document.getElementById("status");
  span.textContent = text;
  span.classList.add("error");
}

function msToTime(s) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(ms, 3);
}

function getDateWithTime(date) {
  return `${date.toDateString()} ${msToTime(date.getTime())}`;
}

function logIntoUIAreaAndConsole(text, data = "") {
  const logEl = document.getElementById("logs");
  const node = document.createElement("p");
  node.className = "log";
  node.innerHTML = `${getDateWithTime(new Date())} - ${text}: ${JSON.stringify(
    data
  )}`;
  logEl.appendChild(node);

  console.log(getDateWithTime(new Date()), `${text} `, data);
}

// 2. XHR functions

function promisifiedXhrRequest(
  method,
  url,
  authString,
  logMessage,
  body = null
) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
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
    xhr.send(body);
  });
}

async function postSecretPinToKeymasterPromise(pin, deviceName) {
  const api_key = "6vO2-gO2I_s85W_2aEacOaSTOSdFby0XVITGzRzi";
  const prepareBody = JSON.stringify({
    su_peer_id: deviceName, // SMART_UNIT_NAME
    secret_pin: pin,
  });
  return await promisifiedXhrRequest(
    "POST",
    `${keymaster_url}/tokens/?key=${api_key}`,
    null,
    "postSecretPinToKeymasterPromise() ",
    prepareBody
  );
}

// 3. Helpers

function generateUnixTimestamp() {
  return window.Date.now();
}

function generateDeviceName() {
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  return "smartunit_" + generateUnixTimestamp() + "." + randomNumber;
}

function generateSecretPIN() {
  return Math.floor(Math.random() * 90000) + 10000; //5-digits
}

const getQuery = () => {
  let q = {};
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      q[item.split("=")[0]] = item.split("=")[1];
    });
  return q;
};

const appendToQuery = (key, value) => {
  location.search += `&${key}=${value}`;
};

const getVideoSetting = () => {
  const q = getQuery();
  if ("video" in q) {
    if (q.webcam === "off") {
      return false;
    }
    if (q.webcam === "on") {
      return true;
    }
  }
  return false;
};

const getAudioSetting = () => {
  const q = getQuery();
  if ("audio" in q) {
    if (q.audio === "off") {
      return false;
    }
    if (q.audio === "on") {
      return true;
    }
  }
  return true;
};

const getTurnSetting = () => {
  const q = getQuery();
  if ("turn" in q) {
    if (q.turn === "off") {
      return false;
    }
    if (q.turn === "on") {
      return true;
    }
  }
};

function constructXirsysFormattedMessage(
  channel,
  from_device_name_peer_id,
  to_peer_id,
  payload
) {
  return {
    t: "u",
    m: {
      f: `${channel}/${from_device_name_peer_id}`,
      t: to_peer_id,
      o: "message",
    },
    p: JSON.stringify(payload),
  };
}

function constructStreamingProtocolMessage(command, status) {
  const protocolMessage = {
    streaming: { protocol_version: streaming_protocol_version },
  };

  if (command) {
    protocolMessage.streaming.command = command;
  }

  if (status) {
    protocolMessage.streaming.status = status;
  }

  return protocolMessage;
}

function handleIncomingError(error) {
  setError("ERROR: " + error);
}

// WS_CONNECTION handlers:

function onWSServerOpen(event) {
  if (event.currentTarget.readyState === WS_CONNECTION_STATES.open)
    connection_state.wsConnectionState = "OPEN";
  setStatus("Registering with server");
  logIntoUIAreaAndConsole(
    " WebSocket connection has been opened!  event obj: ",
    event
  );
}

function onWSServerClose(event) {
  if (event.currentTarget.readyState === WS_CONNECTION_STATES.closed)
    connection_state.wsConnectionState = "CLOSED";
  setStatus("Disconnected from WS singalling server");
  logIntoUIAreaAndConsole(
    "signalling_server_close Disconnected from WS signalling server",
    event
  );

  if (rtc_peer_connection) {
    rtc_peer_connection.close();
    rtc_peer_connection = null;
  }

  if (connection_state.hangupRequired === false) {
    logIntoUIAreaAndConsole(
      "RECONNECTION CASE onWSServerClose connection_state.hangupRequired === false  ",
      ""
    );
    // window.setTimeout(runConnectionSequenceRTCAndWS, 2000);
  }
}

function onWSServerError(event) {
  logIntoUIAreaAndConsole("signalling_server_error event:", event);
  setError(
    "Unable to connect to server, did you add an exception for the certificate?"
  );
  // Retry after 3 seconds

  // todo re-enable reconnect
  // if (connection_state.hangupRequired === false) window.setTimeout(runConnectionSequenceRTCAndWS, 2000);
  console.log("ws server error:  event: ", event);
}

function onWSServerMessage(event) {
  console.log("ws server message,  event obj: ", event);
  // console.log("Received " + event.data);
  // {"m":{"f":"test/alex","o":"peer_connected","t":null},"p":"alex","t":"u"}
  // '{"t":"u","m":{f:"test/alex",t:"alex","o":"message"},"p":{"msg":"hi alex from alex"}}'
  logIntoUIAreaAndConsole(
    "signalling_server_msg_incoming event.data:",
    event.data
  );

  const xirsysMessage = JSON.parse(event.data);
  console.log(
    " @#@#@#@#  xirsysMessage: ",
    xirsysMessage,
    " event.data: ",
    event.data
  );
  // handle all xirsys messages types (peers, peer_connected, peer_removed, message)
  switch (xirsysMessage.m.o) {
    case "peers":
      setStatus(`list of connected peers ${xirsysMessage.p}`);
      break;
    case "peer_connected":
      setStatus(`peer just connected with name "${xirsysMessage.p}"`);
      logIntoUIAreaAndConsole("peer_connected", xirsysMessage.p);
      onPeerConnected(xirsysMessage);
      break;
    case "peer_removed":
      setStatus(`peer just disconnected with name "${xirsysMessage.p}"`);
      break;
    case "message":
      setStatus(`received message: "${xirsysMessage.p}"`);
      // handle incoming SDP
      const xirsysMessagePayload = xirsysMessage.p;

      if (xirsysMessagePayload.sdp) {
        // detect and set remote peer username, that sends us SDP and tries to establish RTC
        //  xirsys format   f:  "channelNAME/remotePeerName"

        // remote_peer_id = xirsysMessage.m.f.split("/").slice(-1)[0];
        // document.getElementById(
        //   "remote-peer-id-with-timestamp"
        // ).innerHTML = remote_peer_id;
        onIncomingSDP(xirsysMessagePayload.sdp.sdp);
      } else if (xirsysMessagePayload.ice) {
        // handle incoming ICE
        onIncomingICE(xirsysMessagePayload.ice);
      } else if (xirsysMessagePayload.streaming) {
        // detect message of type "command"
        switch (xirsysMessagePayload.streaming.command) {
          case "hangup":
            logIntoUIAreaAndConsole(
              "command_received_hangup data: ",
              JSON.stringify(xirsysMessagePayload)
            );
            connection_state.hangupRequired = true;
            onIncomingHangupCommand();
            break;
        }
        switch (xirsysMessagePayload.streaming.status) {
          case "hangupOK":
            logIntoUIAreaAndConsole(
              "status_received_hangupOK data: ",
              JSON.stringify(xirsysMessagePayload)
            );
            connection_state.hangupRequired = true;
            onIncomingHangupOK();
            break;
          case "alive":
            logIntoUIAreaAndConsole(
              "status_received_alive data: ",
              JSON.stringify(xirsysMessagePayload)
            );
            connection_state.hangupRequired = true;
            onIncomingAlive();
            break;
        }
      } else if (xirsysMessagePayload.testMessage) {
        logIntoUIAreaAndConsole(
          "testMessage data: ",
          JSON.stringify(xirsysMessagePayload)
        );
      } else {
        handleIncomingError(
          "Unknown incoming format of JSON object, message payload: " +
            xirsysMessagePayload
        );
      }
  }
}

// RTC_PEER_CONNECTION handlers:

function onLocalICECandidate(event) {
  setStatus("Sending outgoing ICE");
  console.log("rtc_peer_connection.onicecandidate  event obj: ", event);
  if (event.candidate == null) {
    console.log("ICE Candidate was null, done");
    return;
  }

  const ice = { ice: event.candidate };
  const xirsysFormatedMessageWithICE = constructXirsysFormattedMessage(
    token_host_channel_on_pin_from_keymaster.channel,
    device_name,
    remote_peer_id,
    ice
  );
  ws_conn.send(JSON.stringify(xirsysFormatedMessageWithICE)); // We have a candidate, send it to the remote party via Xirsys signalling WS connection

  ice_outgoing_counter++;
  logIntoUIAreaAndConsole(` (${ice_outgoing_counter}) ice_outgoing`, ice);
}

function onLocalICECandidatePromise(event) {
  logIntoUIAreaAndConsole("onLocalICECandidatePromise");
  return new Promise(function (resolve, reject) {
    if (connection_state.sdpAnswerReceived) {
      resolve(onLocalICECandidate(event));
    }
  });
}

function onLocalICECandidateGatheringStateChange(event) {
  console.log("rtc_peer_connection.onicecandidate  event obj: ", event);
  let connection = event.target;
  switch (connection.iceGatheringState) {
    case "gathering":
      console.log(
        "ICECandidateGatheringStateChange: 'gathering' collection of candidates has begun"
      );
      break;
    case "complete":
      console.log(
        "ICECandidateGatheringStateChange: 'complete' collection of candidates is finished"
      );
      break;
  }
}

function onDataChannel(event) {
  logIntoUIAreaAndConsole(
    "receive_remote_data_channel_received, event:",
    event
  );
  setStatus("Data channel received");
  console.log("onDataChannel() triggered Data channel EVENT obj: ", event);
}

function onNegotiationNeeded(event) {
  logIntoUIAreaAndConsole("on_negotiation_needed triggered event:", event);
}

function onConnectionStateChange(event) {
  connection_state.rtcConnectionState = rtc_peer_connection.connectionState;

  logIntoUIAreaAndConsole(
    "connection_state_changed triggered, event obj: ",
    JSON.stringify(event) +
      ` connectionState::${rtc_peer_connection.connectionState}`
  );

  logIntoUIAreaAndConsole(
    "connection_state_changed triggered,",
    `ws_connection::${ws_conn.readyState}`
  );

  if (rtc_peer_connection.connectionState === "connected") {
    rtc_peer_successful_connections_counter++; // count successfull connections
  }
}

function onRTCConnectionClose(event) {
  logIntoUIAreaAndConsole("rtc_peer_connection.onclose  ", `event: ${event}`);
  setStatus("Disconnected from RTC Peer Connection");
}

function getLocalMediaStreamPromise() {
  // Add local media stream
  if (navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
  } else {
    setError("Browser doesn't support getUserMedia!");
  }
}

function onPeerConnected(xirsysMessage) {
  // process the peer_connected event only on webclient peer id that is different from webclient_peer_id
  // listen to peer_connected messages look for type of user "SU" and then send "reconnect" message
  const isRtcConnectionClosedFailedOrDisconnected =
    rtc_peer_connection.connectionState === "failed" ||
    rtc_peer_connection.connectionState === "disconnected" ||
    rtc_peer_connection.connectionState === "closed";

  if (
    xirsysMessage.p.split("_").slice(-4)[0] === "webclient"
    // && rtc_peer_successful_connections_counter > 0 &&
    // isRtcConnectionClosedFailedOrDisconnected
  ) {
    remote_peer_id = xirsysMessage.m.f.split("/").slice(-1)[0];
    document.getElementById(
      "webclient-peer-id-with-timestamp"
    ).innerHTML = remote_peer_id;
    const xirsysFormattedMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      device_name,
      remote_peer_id,
      constructStreamingProtocolMessage("areYouAlive", null)
    );
    ws_conn.send(JSON.stringify(xirsysFormattedMessage));
  }
}

// SDP answer received from peer, set remote description
function onIncomingSDP(sdp) {
  logIntoUIAreaAndConsole("sdp_incoming", sdp);
  setStatus("Got SDP answer");

  rtc_peer_connection
    .setRemoteDescription(sdp)
    .then(() => {
      setStatus("Remote SDP set");
      connection_state.sdpAnswerReceived = true;
    })
    .catch(setError);
}

// ICE candidate received from peer, add it to the peer connection
function onIncomingICE(ice) {
  ice_incoming_counter++;
  logIntoUIAreaAndConsole(`(${ice_incoming_counter}) ice_incoming`, ice);
  let candidate = new RTCIceCandidate(ice);
  rtc_peer_connection
    .addIceCandidate(candidate)
    .then((addedIceCandidate) => {
      logIntoUIAreaAndConsole(
        "rtc_peer_connection.addIceCandidate(candidate)   =>  addedIceCandidate: ",
        addedIceCandidate
      );
    })
    .catch(setError);
}

// message of type COMMAND received from peer
function onIncomingHangupCommand() {
  logIntoUIAreaAndConsole("onIncomingHangupCommand");
  // if (rtc_peer_connection && rtc_peer_connection.connectionState === "connected") {
  //   const hangupOKStatus = constructStreamingProtocolMessage(null, "hangupOK");
  //   const xirsysHangupOKMessage = constructXirsysFormattedMessage(token_host_channel_on_pin_from_keymaster.channel, webclient_peer_id, remote_peer_id, hangupOKStatus);
  //   ws_conn.send(JSON.stringify(xirsysHangupOKMessage));
  //   logIntoUIAreaAndConsole('status_sent_hangupOK, hanging up.', null);
  //   closeRTCAndWSConnection();
  //   stopMediaStreamTracks();
  // }
}

function onIncomingHangupOK() {
  logIntoUIAreaAndConsole("onIncomingHangupOK");
  // closeRTCAndWSConnection();
  // stopMediaStreamTracks();
}

// Local description was set, send it to peer
function onLocalDescription(localSDP, sdpType = "") {
  console.log("Got local description: " + JSON.stringify(localSDP));
  rtc_peer_connection.setLocalDescription(localSDP).then(function () {
    setStatus(`Sending SDP ${sdpType}`);
    const payload = { sdp: rtc_peer_connection.localDescription };

    const xirsysFormatedMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      device_name,
      remote_peer_id,
      payload
    );

    ws_conn.send(JSON.stringify(xirsysFormatedMessage));
    logIntoUIAreaAndConsole(
      `sdp_outgoing type "${sdpType}" xirsysFormatedMessage(with sdp) `,
      xirsysFormatedMessage
    );
  });
}

function onIncomingAlive() {
  logIntoUIAreaAndConsole("onIncomingAlive");

  if (rtc_peer_connection) {
    rtc_send_channel_keepAlive = createRTCChannel(send_channel_keepAlive);
    rtc_send_channel_annotation = createRTCChannel(send_channel_annotation);

    document.getElementById("start-call").disabled = false;
  }
}

function stopMediaStreamTracks() {
  local_media_stream.getTracks().forEach((track) => {
    track.stop();
    logIntoUIAreaAndConsole(`mediaStreamTrack ${track.id} has been stopped`);
    setStatus(`mediaStreamTrack ${track.id} has been stopped`);
  });
}

function closeRTCAndWSConnection() {
  rtc_peer_connection.close();
  logIntoUIAreaAndConsole("rtc_peer_connection_closed");
  ws_conn.close();
  logIntoUIAreaAndConsole("ws_connection_closed");
  setStatus("RTC and WS connections are closed on hangup command");
  document.getElementById("start-call").disabled = true;
  document.getElementById("end-call").disabled = true;
}

function onInitiateSUHangup() {
  const hangupCommand = constructStreamingProtocolMessage("hangup", null);

  if (ws_conn.readyState === WS_CONNECTION_STATES.open) {
    const xirsysHangupMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      device_name,
      remote_peer_id,
      hangupCommand
    );
    ws_conn.send(JSON.stringify(xirsysHangupMessage));
  }

  setTimeout(() => {
    if (ws_conn.readyState === WS_CONNECTION_STATES.open) {
      const hangupOnTimeoutStatus = constructStreamingProtocolMessage(
        null,
        "hangupOnTimeout"
      );
      const xirsysHangupOnTimeoutMessage = constructXirsysFormattedMessage(
        token_host_channel_on_pin_from_keymaster.channel,
        device_name,
        remote_peer_id,
        hangupOnTimeoutStatus
      );
      ws_conn.send(JSON.stringify(xirsysHangupOnTimeoutMessage));
      closeRTCAndWSConnection();
      stopMediaStreamTracks();
      logIntoUIAreaAndConsole(
        "hangup_after_timeout  hung up on timeout on waiting for hangupOK",
        null
      );
    }
  }, 10000);
}

function createRTCChannel(channel_label) {
  let rtc_send_channel = rtc_peer_connection.createDataChannel(
    channel_label,
    null
  );
  rtc_send_channel.onopen = (event) => {
    console.log(
      `connection opened on channel: ${channel_label}, event obj: ${event}`
    );
    rtc_send_channel.send(
      `Hi from webclient browser, via channel label: ${channel_label}`
    );
  };

  rtc_send_channel.onclose = (event) => {
    logIntoUIAreaAndConsole("rtc_send_channel.onclose", `event: ${event}`);
    setStatus("Disconnected from RTC Peer Connection");
  };

  rtc_send_channel.onerror = (error) =>
    logIntoUIAreaAndConsole(
      `send_data_channel_on_error: ${channel_label}, error obj: ${error}`,
      error
    );

  return rtc_send_channel;
}

function createRTCPeerConnectionAndMediaStream() {
  // create call / new RTC connection to connect to remote peer
  // createCall()...

  logIntoUIAreaAndConsole("Creating RTCPeerConnection");

  rtc_peer_connection = new RTCPeerConnection(rtc_configuration);

  rtc_peer_connection.onicecandidate = onLocalICECandidatePromise;
  rtc_peer_connection.onicegatheringstatechange = onLocalICECandidateGatheringStateChange;

  rtc_peer_connection.ondatachannel = onDataChannel;

  /* if needed to re-connect, network configurations changed, etc. => a new negotiation is needed */
  rtc_peer_connection.onnegotiationneeded = onNegotiationNeeded;

  /* trying to detect the need of re-connect, listen to connectionStateChange */
  rtc_peer_connection.onconnectionstatechange = onConnectionStateChange;

  rtc_peer_connection.onclose = (event) => onRTCConnectionClose;

  /* display the local media stream (su video) to itself */
  local_media_stream_promise = getLocalMediaStreamPromise()
    .then((stream) => {
      local_media_stream = stream;
      console.log("adding local media stream");
      local_media_stream.getTracks().forEach(function (track) {
        rtc_peer_connection.addTrack(track, stream);
      });
      document.getElementById("mediaStreamConstraints_video").innerHTML =
        mediaStreamConstraints.video;
      document.getElementById("mediaStreamConstraints_audio").innerHTML =
        mediaStreamConstraints.audio;
      document.getElementById("video-stream").srcObject = stream;
    })
    .catch(setError);
}

function createWebsocketConnectionToXirsysSignalling() {
  if (token_host_channel_on_pin_from_keymaster) {
    const token = token_host_channel_on_pin_from_keymaster.ws_token;
    const host = token_host_channel_on_pin_from_keymaster.ws_host;

    // connect to Websocket with submitted / provided  username
    ws_conn = new WebSocket(`${host}/v2/${token}`);
    /* When connected, immediately register with the server */
    ws_conn.addEventListener("open", onWSServerOpen);
    ws_conn.addEventListener("error", onWSServerError);
    ws_conn.addEventListener("message", onWSServerMessage);
    ws_conn.addEventListener("close", onWSServerClose);
  } else {
    window.alert("TOKEN / HOST/ TURN LIST not received. ");
    console.log("error:  TOKEN / HOST/ TURN LIST not received. ");
  }

  // websocketServerConnect(username_peer_id_input || default_username);
}

// 4. Process

function runConnectionSequenceRTCAndWS() {
  // Step-2
  logIntoUIAreaAndConsole("runConnectionSequenceRTCAndWS");
  // Step-2.1 create RTC Peer Connection and Media Stream
  createRTCPeerConnectionAndMediaStream();
  // Step-2.2 connect to WebSocket Xirsys Singalling Sever
  createWebsocketConnectionToXirsysSignalling();
}

function generateSecretePinAndDeviceNameAndPostToKeymaster() {
  console.log("onClick!");
  // Step-1.1
  device_name = generateDeviceName();
  logIntoUIAreaAndConsole("device_name", device_name);
  document.getElementById("su_name").innerHTML = device_name;

  // Step-1.2
  secret_pin = generateSecretPIN();
  logIntoUIAreaAndConsole("secret_pin", secret_pin);
  document.getElementById("secret_pin").innerHTML = secret_pin;

  // Step-1.3
  postSecretPinToKeymasterPromise(secret_pin, device_name).then((result) => {
    logIntoUIAreaAndConsole(
      "getWShostTokenAndChannelFromKeymasterResponsePromise configuration",
      result
    );
    token_host_channel_on_pin_from_keymaster = JSON.parse(result);
    rtc_configuration =
      token_host_channel_on_pin_from_keymaster.rtc_configuration;
    document.getElementById("remote-ws-channel-id").innerHTML =
      token_host_channel_on_pin_from_keymaster.channel;
    document.getElementById(
      "txt-area-display-token-host-turn-list"
    ).value = JSON.stringify(result);
    setStatus(
      "Generate SECRET PIN, POST it to keymaster and GET xirsys credentials for future session"
    );
    runConnectionSequenceRTCAndWS();
    document.getElementById(
      "generate-pin-and-post-keymaster-token"
    ).disabled = true;
  });
}

export function prepareSendMessageAudioVideoHandlersAndButtons() {
  console.log('prepareSendMessageAudioVideoHandlersAndButtons()')

  document.getElementById("generate-pin-and-post-keymaster-token").onclick = (
    event
  ) => {
    event.preventDefault();
    setStatus("generate SECRET PIN");
    generateSecretePinAndDeviceNameAndPostToKeymaster();
  };

  document.getElementById("start-call").onclick = (event) => {
    event.preventDefault();
    if (!document.getElementById("start-call").disabled) {
      setStatus("Start call!");
      if (
        rtc_peer_connection.connectionState === "disconnected" ||
        rtc_peer_connection.connectionState === "failed"
      ) {
        offerOptions.iceRestart = true;
      }
      rtc_peer_connection
        .createOffer(offerOptions)
        .then((sdp) => {
          onLocalDescription(sdp);
          document.getElementById("end-call").disabled = false;
        })
        .catch(setError);
    }
  };

  document.getElementById("end-call").onclick = (event) => {
    event.preventDefault();
    onInitiateSUHangup();
  };

  document.getElementById("btn-submit-dc-message").onclick = (ev) => {
    ev.preventDefault();
    const dc_message = document
      .getElementById("dc-message-input")
      .value.replace('"', "");
    const payload = { testMessage: dc_message };
    const message = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      device_name,
      remote_peer_id,
      payload
    );

    if (ws_conn) {
      ws_conn.send(JSON.stringify(message));
      console.log("message sent: ", JSON.stringify(message));
    }
  };
}