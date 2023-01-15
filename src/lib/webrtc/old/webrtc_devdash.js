"use strict";

let mediaStreamConstraints = { video: false, audio: true };

// pin code is temporarily code generated on the SU as out of bound secret to connect to a SU stream from a web client via WebRTC.
let secret_pin = null;
/*  The name the frontend user (expert) gives to oneself */
let webclient_peer_id = null;
const webclient_session_uuid = uuidv4();

let ws_conn = null;
let rtc_peer_connection = null;
let rtc_peer_successful_connections_counter = 0;
let rtc_send_channel = null;
const send_channel_label = "label-webclient";
let rtc_receive_channel = null;
let rtc_keepalive_channel_from_su = null;
let rtc_annotations_channel_from_su = null;
let connection_state = {
  rtcConnectionState: "",
  wsConnectionState: "",
  hangupRequired: false,
};
const WS_CONNECTION_STATES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
};

const ICE_CONNECTION_STATES = [
  "failed",
  "disconnected",
  "closed",
  "new",
  "checking",
  "connected",
  "completed",
];

let local_media_stream_promise = null;
let local_media_stream = null;

const keymaster_url = "https://keymaster.viewpointsystem.com";

const streaming_protocol_version = 0;

const default_username = "expert";
const default_channel_name = "test";

let username_peer_id_input = null;
let channel_name_id_input = null;
let token_host_channel_on_pin_from_keymaster = null;
let rtc_configuration = null;

let remote_peer_id = null;

// Set this to use a specific peer id instead of a random one
let default_expert = default_username;
// Override with your own STUN servers if you want

let ice_incoming_counter = 0;
let ice_outgoing_counter = 0;

// keepAlive protocol, interval ID  to easy clear it out
let interval_id_for_keep_alive = null;

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

function logIntoUIAreaAndConsole(text, data = "") {
  const logEl = document.getElementById("logs");
  const node = document.createElement("p");
  node.className = "log";
  node.innerHTML = `${text}: ${JSON.stringify(data)}`;
  logEl.appendChild(node);

  console.log(`${text} `, data);
}

function promisifiedXhrRequest(method, url, authString, logMessage) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (authString)
      xhr.setRequestHeader("Authorization", "Basic " + btoa(authString));
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
    xhr.send();
  });
}

async function getWShostTokenAndChannelFromKeymasterResponsePromise(
  pin,
  expertNickname
) {
  // return only token, without whole object
  return await promisifiedXhrRequest(
    "GET",
    `${keymaster_url}/tokens/${pin}?webclient_peer_id=${expertNickname}`,
    null,
    "getWShostTokenAndChannelFromKeymasterResponsePromise() "
  );
}

function generateUnixTimestamp() {
  return window.Date.now();
}

function constructWebClientPeerID() {
  return (
    "webclient" +
    "_" +
    document.getElementById("webclient-peer-id-input").value +
    "_" +
    webclient_session_uuid +
    "_" +
    generateUnixTimestamp()
  );
}

function submitSecretPinWebclientPeerIDAndGetXirsysTokenPromise() {
  return new Promise(function (resolve, reject) {
    secret_pin = document.getElementById("secret-pin-input").value;
    webclient_peer_id = constructWebClientPeerID();
    if (secret_pin) {
      getWShostTokenAndChannelFromKeymasterResponsePromise(
        secret_pin,
        webclient_peer_id
      )
        .then((value) => {
          token_host_channel_on_pin_from_keymaster = JSON.parse(value);
          rtc_configuration =
            token_host_channel_on_pin_from_keymaster.rtc_configuration;
          document.getElementById("remote-ws-channel-id").innerHTML =
            token_host_channel_on_pin_from_keymaster.channel;
          logIntoUIAreaAndConsole(
            "getWShostTokenAndChannelFromKeymasterResponsePromise  value: ",
            value
          );
          document.getElementById(
            "webclient-peer-id-with-timestamp"
          ).innerHTML = webclient_peer_id;
          document.getElementById(
            "txt-area-display-token-host-turn-list"
          ).value = JSON.stringify(value);
          resolve(value);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      window.alert(
        "please enter PIN code generated by SU and expert nickname, then press 'submit' button. "
      );
      reject({
        error:
          "please enter PIN code generated by SU and expert nickname, then press 'submit' button",
      });
    }
  });
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

function runConnectionSequenceRTCAndWS() {
  // (1) submit secret pin and web client peer id
  submitSecretPinWebclientPeerIDAndGetXirsysTokenPromise().then((value) => {
    logIntoUIAreaAndConsole(
      "submit_pin_promise_result ubmitSecretPinWebclientPeerIDAndGetXirsysTokenPromise value: ",
      value
    );
    // (2) create RTC Peer Connection and Media Stream
    createRTCPeerConnectionAndMediaStream();

    // (3) connect to WebSocket Xirsys Singalling Sever
    createWebsocketConnectionToXirsysSignalling();
  });
}

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
      const xirsysMessagePayload = JSON.parse(xirsysMessage.p);

      if (xirsysMessagePayload.sdp) {
        // detect and set remote peer username, that sends us SDP and tries to establish RTC
        //  xirsys format   f:  "channelNAME/remotePeerName"
        remote_peer_id = xirsysMessage.m.f.split("/").slice(-1)[0];
        document.getElementById("remote-peer-id-with-timestamp").innerHTML =
          remote_peer_id;
        onIncomingSDP(xirsysMessagePayload.sdp);
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
          case "areYouAlive":
            logIntoUIAreaAndConsole(
              "command_received_areYouAlive data: ",
              JSON.stringify(xirsysMessagePayload)
            );
            onIncomingAreYouAliveCommand(xirsysMessage);
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

// Local description was set, send it to peer
function onLocalDescription(localSDP, sdpType = "") {
  console.log("Got local description: " + JSON.stringify(localSDP));
  rtc_peer_connection.setLocalDescription(localSDP).then(function () {
    setStatus(`Sending SDP ${sdpType}`);
    const sdp = { sdp: rtc_peer_connection.localDescription };
    const payload = { sdp: sdp };

    const xirsysFormatedMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
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

// Local description was set, send it to peer
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
    webclient_peer_id,
    remote_peer_id,
    ice
  );
  ws_conn.send(JSON.stringify(xirsysFormatedMessageWithICE)); // We have a candidate, send it to the remote party via Xirsys signalling WS connection

  ice_outgoing_counter++;
  logIntoUIAreaAndConsole(` (${ice_outgoing_counter}) ice_outgoing`, ice);
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

// SDP offer received from peer, set remote description and create an answer
function onIncomingSDP(sdp) {
  logIntoUIAreaAndConsole("sdp_incoming", sdp);
  setStatus("Got SDP offer");

  rtc_peer_connection
    .setRemoteDescription(sdp)
    .then(() => {
      setStatus("Remote SDP set");
      if (sdp.type !== "offer") {
        return;
      }

      //local_stream_promise
      if (local_media_stream_promise) {
        local_media_stream_promise
          .then((stream) => {
            setStatus("Got local stream, creating answer ");
            console.log(
              "Got local stream, creating answer, local stream obj: ",
              stream
            );

            rtc_peer_connection
              .createAnswer()
              .then((sdp) => onLocalDescription(sdp, "answer"))
              .catch(setError);
          })
          .catch(setError);
      } else {
        setStatus("Creating SDP answer");
        logIntoUIAreaAndConsole("creating_sdp_answer");
        rtc_peer_connection
          .createAnswer()
          .then((sdp) => onLocalDescription(sdp, "answer"))
          .catch(setError);
      }
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

function onPeerConnected(xirsysMessage) {
  // process the peer_connected event only on webclient peer id that is different from webclient_peer_id
  // listen to peer_connected messages look for type of user "SU" and then send "reconnect" message
  const isRtcConnectionClosedFailedOrDisconnected =
    rtc_peer_connection.connectionState === "failed" ||
    rtc_peer_connection.connectionState === "disconnected" ||
    rtc_peer_connection.connectionState === "closed";

  if (
    xirsysMessage.p.split("_").slice(-4)[0] === "smartunit" &&
    rtc_peer_successful_connections_counter > 0 &&
    isRtcConnectionClosedFailedOrDisconnected
  ) {
    remote_peer_id = xirsysMessage.m.f.split("/").slice(-1)[0];
    document.getElementById("webclient-peer-id-with-timestamp").innerHTML =
      remote_peer_id;
    const xirsysFormattedMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
      remote_peer_id,
      constructStreamingProtocolMessage("requestReconnect", null)
    );
    ws_conn.send(JSON.stringify(xirsysFormattedMessage));
  }
}

function onInitiateWebclientHangup() {
  const hangupCommand = constructStreamingProtocolMessage("hangup", null);

  if (ws_conn.readyState === WS_CONNECTION_STATES.open) {
    const xirsysHangupMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
      remote_peer_id,
      hangupCommand
    );
    ws_conn.send(JSON.stringify(xirsysHangupMessage));
  }
  // don't close rtc/ws connections yet, wait for hangupOK confirmation from remote peer

  // if no hangupOK received in 10 seconds, then hangup and close down rtc/ws
  setTimeout(() => {
    const hangupOnTimeoutStatus = constructStreamingProtocolMessage(
      null,
      "hangupOnTimeout"
    );
    const xirsysHangupOnTimeoutMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
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
  }, 10000);
}

function onIncomingHangupOK() {
  closeRTCAndWSConnection();
  stopMediaStreamTracks();
}

// message of type COMMAND received from peer
function onIncomingHangupCommand() {
  if (
    rtc_peer_connection &&
    rtc_peer_connection.connectionState === "connected"
  ) {
    const hangupOKStatus = constructStreamingProtocolMessage(null, "hangupOK");
    const xirsysHangupOKMessage = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
      remote_peer_id,
      hangupOKStatus
    );
    ws_conn.send(JSON.stringify(xirsysHangupOKMessage));
    logIntoUIAreaAndConsole("status_sent_hangupOK, hanging up.", null);
    closeRTCAndWSConnection();
    stopMediaStreamTracks();
  }
}

// message of type COMMAND received from peer
function onIncomingAreYouAliveCommand(xirsysMessage) {
  // create RTC connection , grab media device init MediaStream  (mic/cam)
  createRTCPeerConnectionAndMediaStream();
  remote_peer_id = xirsysMessage.m.f.split("/").slice(-1)[0];
  document.getElementById("webclient-peer-id-with-timestamp").innerHTML =
    remote_peer_id;
  const payload = constructStreamingProtocolMessage(null, "alive");
  const responseMessage = constructXirsysFormattedMessage(
    token_host_channel_on_pin_from_keymaster.channel,
    webclient_peer_id,
    remote_peer_id,
    payload
  );
  ws_conn.send(JSON.stringify(responseMessage));
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
}

function handleIncomingError(error) {
  setError("ERROR: " + error);
}

function onDataChannel(event) {
  logIntoUIAreaAndConsole(
    "receive_remote_data_channel_received, event:",
    event
  );
  setStatus("Data channel received");
  console.log("onDataChannel() triggered Data channel EVENT obj: ", event);

  if (event.channel.label === "KeepAliveChannel") {
    rtc_keepalive_channel_from_su = event.channel;
    logIntoUIAreaAndConsole(
      "RTC KeepAliveChannel received from SU and initialized: ",
      event.channel.label
    );

    rtc_keepalive_channel_from_su.onopen = (event) => {
      logIntoUIAreaAndConsole(
        'receive_remote_keepalive_channel rtc_keepalive_channel_from_su.onopen in state "open", event:',
        event
      );

      // start sending  keepAlive pings, once rtcReceiveChannel is opened
      startSendingKeepAlivePings();
    };
    rtc_keepalive_channel_from_su.onerror = (event) => {
      logIntoUIAreaAndConsole(
        "receive_remote_keepalive_channel_on_error",
        event
      );
    };
    rtc_keepalive_channel_from_su.onclose = (event) => {
      logIntoUIAreaAndConsole(
        "receive_remote_keepalive_channel_on_close",
        event
      );

      // stop sending keepAlive pings, remove interval
      clearInterval(interval_id_for_keep_alive);
    };
  }

  if (event.channel.label === "AnnotationsChannel") {
    rtc_annotations_channel_from_su = event.channel;
    logIntoUIAreaAndConsole(
      "RTC AnnotationsChannel received from SU and initialized: ",
      event.channel.label
    );
    rtc_annotations_channel_from_su.onopen = (event) => {
      logIntoUIAreaAndConsole(
        'receive_remote_annotations_channel rtc_annotations_channel_from_su.onopen in state "open", event:',
        event
      );
    };
    rtc_annotations_channel_from_su.onerror = (event) => {
      logIntoUIAreaAndConsole(
        "receive_remote_annotations_channel_on_error",
        event
      );
    };
    rtc_annotations_channel_from_su.onclose = (event) => {
      logIntoUIAreaAndConsole(
        "receive_remote_annotations_channel_on_close",
        event
      );

      // stop sending keepAlive pings, remove interval
      stopSendingKeepAlivePings();
    };
  }
}

function startSendingKeepAlivePings() {
  if (interval_id_for_keep_alive) {
    stopSendingKeepAlivePings();
  }
  let current_counter = 0;
  interval_id_for_keep_alive = setInterval(() => {
    current_counter++;
    rtc_keepalive_channel_from_su.send(current_counter);
    console.log("sent keepAlive ping with counter: ", current_counter);
    document.getElementById("current-keep-alive-tick").innerText =
      current_counter;
  }, 1000);
}

function stopSendingKeepAlivePings() {
  clearInterval(interval_id_for_keep_alive);
  interval_id_for_keep_alive = null;
}

function onRemoteTrack(event) {
  logIntoUIAreaAndConsole(
    "receive_remote_data_channel_on_track remote_track received, event obj: ",
    event
  );

  if (document.getElementById("video-stream").srcObject !== event.streams[0]) {
    logIntoUIAreaAndConsole("incoming_video_stream", event);
    document.getElementById("video-stream").srcObject = event.streams[0];
  }
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

  if (rtc_peer_connection.connectionState === "connected")
    rtc_peer_successful_connections_counter++; // count successfull connections

  const payload = constructStreamingProtocolMessage(null, {
    RTCPeerConnectionState: rtc_peer_connection.connectionState,
  });

  const xirsysFormattedMessage = constructXirsysFormattedMessage(
    token_host_channel_on_pin_from_keymaster.channel,
    webclient_peer_id,
    remote_peer_id,
    payload
  );

  ws_conn.send(JSON.stringify(xirsysFormattedMessage));
}

function onIceConnectionStateChange(event) {
  //ICE_CONNECTION_STATES

  logIntoUIAreaAndConsole(
    "onIceConnectionStateChange, iceConnectionState:",
    rtc_peer_connection.iceConnectionState
  );
  logIntoUIAreaAndConsole(
    "onIceConnectionStateChange, ws_conn readyState:",
    ws_conn.readyState
  );
}

function onRTCConnectionClose(event) {
  logIntoUIAreaAndConsole("rtc_peer_connection.onclose  ", `event: ${event}`);
  setStatus("Disconnected from RTC Peer Connection");

  // if not hangup state, it is reconnect state
  if (connection_state.hangupRequired === false) {
    logIntoUIAreaAndConsole(
      "RECONNECTION CASE onRTCConnectionClose connection_state.hangupRequired === false  ",
      ""
    );
    // todo re-enable reconnect
    // window.setTimeout(runConnectionSequenceRTCAndWS, 2000);
  }
}

function getLocalMediaStreamPromise() {
  // Add local media stream
  if (navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
  } else {
    setError("Browser doesn't support getUserMedia!");
  }
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

function printWebRTCstatsEveryXmilliseconds(milliseconds) {
  // print WebRTC stats
  setInterval(async () => {
    if (!rtc_peer_connection) {
      return;
    }
    const statsRaw = await rtc_peer_connection.getStats();
    let stats = [];
    statsRaw.forEach((item) => stats.push(item));

    console.log("raw getStats() every 3 seconds output: ", { stats });
  }, milliseconds);
}

function createRTCPeerConnectionAndMediaStream() {
  // create call / new RTC connection to connect to remote peer
  // createCall()...
  // let xirsysTurnStunList = hardcodedSTUNandTURNlist;
  /*        if (token_host_turnlist_values) {
                // xirsysTurnStunList = JSON.parse(token_host_turnlist_values[2]).v;
                xirsysTurnStunList = hardcodedSTUNandTURNlist;
            }*/

  console.log("Creating RTCPeerConnection");

  rtc_peer_connection = new RTCPeerConnection(rtc_configuration);

  rtc_send_channel = rtc_peer_connection.createDataChannel(
    send_channel_label,
    null
  );
  rtc_send_channel.onopen = (event) => {
    console.log(
      `connection opened on channel: ${send_channel_label}, event obj: ${event}`
    );
    rtc_send_channel.send(
      `Hi from webclient browser, via channel label: ${send_channel_label}`
    );
  };

  rtc_send_channel.onclose = (event) => {
    logIntoUIAreaAndConsole("rtc_send_channel.onclose", `event: ${event}`);
    setStatus("Disconnected from RTC Peer Connection");

    // if not hangup state, it is reconnect state
    if (connection_state.hangupRequired === false) {
      logIntoUIAreaAndConsole(
        "RECONNECTION CASE onRTCConnectionClose connection_state.hangupRequired === false  ",
        ""
      );
      // todo re-enable reconnect
      // window.setTimeout(runConnectionSequenceRTCAndWS, 2000);
    }
  };

  rtc_send_channel.onerror = (error) =>
    logIntoUIAreaAndConsole(
      `send_data_channel_on_error: ${send_channel_label}, error obj: ${error}`,
      error
    );

  rtc_peer_connection.onicecandidate = onLocalICECandidate;
  rtc_peer_connection.onicegatheringstatechange =
    onLocalICECandidateGatheringStateChange;

  rtc_peer_connection.ondatachannel = onDataChannel;

  /* listen to SU remote media stream */
  rtc_peer_connection.ontrack = onRemoteTrack;

  /* if needed to re-connect, network configurations changed, etc. => a new negotiation is needed */
  rtc_peer_connection.onnegotiationneeded = onNegotiationNeeded;

  /* trying to detect the need of re-connect, listen to connectionStateChange */
  rtc_peer_connection.onconnectionstatechange = onConnectionStateChange;

  rtc_peer_connection.onclose = (event) => onRTCConnectionClose;

  rtc_peer_connection.oniceconnectionstatechange = (event) =>
    onIceConnectionStateChange;

  /* send webclient video/audio stream to SU */
  /*    local_media_stream_promise = getLocalMediaStreamPromise().then((stream) => {
        local_media_stream = stream;
        console.log('adding local media stream');
        rtc_peer_connection.addStream(stream);
    }).catch(setError); */
}

function constructXirsysFormattedMessage(
  channel,
  from_username_expert_peer_id,
  to_peer_id,
  payload
) {
  return {
    t: "u",
    m: {
      f: `${channel}/${from_username_expert_peer_id}`,
      t: to_peer_id,
      o: "message",
    },
    p: payload,
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

// working with query string URL  for automated tests

// grab a specific query url parameter value  by its name (case sensitive)
function getQueryURLParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setPinAndWebClientPeerIDfromQueryURLParams() {
  // set PIN
  document.getElementById("secret-pin-input").value =
    getQueryURLParameterByName("pin");
  // set webclient PeerID
  document.getElementById("webclient-peer-id-input").value =
    getQueryURLParameterByName("webclientPeerID");
}

function prepareSendMessageAudioVideoHandlersAndButtons() {
  document.getElementById(
    "btn-submit-secret-pin-and-webclient-peer-id-connect-rtc-and-ws"
  ).onclick = (event) => {
    event.preventDefault();
    setStatus("connection sequence RTC/WS initiated!");
    runConnectionSequenceRTCAndWS();
  };

  document.getElementById("secret-pin-input").onkeydown = (event) => {
    if (event.key === "Enter") {
      setStatus("connection sequence RTC/WS initiated!");
      runConnectionSequenceRTCAndWS();
    }
  };

  document.getElementById("btn-webclient-initiate-hangup").onclick = (ev) => {
    ev.preventDefault();
    // (1) send hangup command over RTC send channel
    logIntoUIAreaAndConsole("send_webclient_initiated_hangup_command", "");
    connection_state.hangupRequired = true;
    onInitiateWebclientHangup();
  };

  document.getElementById(
    "btn-webclient-start-sending-keep-alive-ticks"
  ).onclick = (ev) => {
    ev.preventDefault();
    logIntoUIAreaAndConsole("initiated keepAlive ticks sending", "");
    startSendingKeepAlivePings();
  };

  document.getElementById(
    "btn-webclient-stop-sending-keep-alive-ticks"
  ).onclick = (ev) => {
    ev.preventDefault();
    logIntoUIAreaAndConsole("stopped keepAlive ticks sending", "");
    stopSendingKeepAlivePings();
  };

  /*    document.getElementById("btn-connect-to-ws-signalling-xirsys").onclick = (ev) => {
            ev.preventDefault()
            createWebsocketConnectionToXirsysSignalling();
        }*/

  document.getElementById("btn-submit-dc-message").onclick = (ev) => {
    ev.preventDefault();
    const dc_channel_name = document
      .getElementById("dc-channel-name-input")
      .value.replace('"', "");
    let destination_peer_name = document.getElementById(
      "remote-peer-id-with-timestamp"
    ).value;
    destination_peer_name = document
      .getElementById("dc-remote-peer-name-input")
      .value.replace('"', "");
    const dc_message_payload = document
      .getElementById("dc-message-input")
      .value.replace('"', "");
    const payload = { testMessage: dc_message_payload };
    const message = constructXirsysFormattedMessage(
      token_host_channel_on_pin_from_keymaster.channel,
      webclient_peer_id,
      destination_peer_name || remote_peer_id,
      payload
    );

    if (ws_conn) {
      ws_conn.send(JSON.stringify(message));
      console.log("message sent: ", JSON.stringify(message));
    }
  };

  document.getElementById("btn-webclient-send-annotation-test-image").onclick =
    (ev) => {
      ev.preventDefault();

      const c = document.createElement("canvas");
      const img = document.getElementById("annotation-test-image");
      c.height = img.naturalHeight;
      c.width = img.naturalWidth;
      const ctx = c.getContext("2d");

      ctx.drawImage(img, 0, 0, c.width, c.height);
      const imgConvertedToBase64String = c.toDataURL();

      const id = Math.random().toString(36).substr(2, 5);
      sendChunkedImage(
        imgConvertedToBase64String,
        (chunk, chunkIndex, count) => {
          const rtcMessage = {
            event: "send-image",
            data: {
              id: id,
              chunk: {
                totalCount: count,
                index: chunkIndex,
                data: chunk,
              },
            },
          };
          console.log({ rtcMessage });

          if (
            !rtc_annotations_channel_from_su ||
            rtc_annotations_channel_from_su.readyState !== "open"
          ) {
            console.error(
              "trying to send data channel message before opening connection"
            );
            return;
          }
          rtc_annotations_channel_from_su.send(JSON.stringify(rtcMessage));
        }
      );
    };

  // add on closing tab/window event listener to send hangup command
  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
    logIntoUIAreaAndConsole(
      "send_webclient_initiated_hangup_command on tab/window close",
      ""
    );
    connection_state.hangupRequired = true;
    onInitiateWebclientHangup();
  });
}

/*  execute as soon as browser window loads  */
window.onload = function () {
  // set pin and webclient peer id form value from query string URL
  setPinAndWebClientPeerIDfromQueryURLParams();
  // open WebSocket Connection on username submit and prepare send WS text message, submit username, send video/audio stream  buttons and handlers
  prepareSendMessageAudioVideoHandlersAndButtons();
  // printWebRTCstatsEveryXmilliseconds(3000);
};
