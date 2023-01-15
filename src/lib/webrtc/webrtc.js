"use strict";

// 0. Constants

import {
  XIRSYS_CHANNEL_NAME_REGEX,
  WS_CONNECTION_STATES,
  screenStreamDisplayMediaOptions,
} from "@lib/webrtc/constants";
import {
  addRemoteVideoEl,
  createLocalScreenSharingVideoElement,
  disabledControlBtns,
  enableControlBtns,
  logIntoUIAreaAndConsole,
  removeStreamFromDOM,
  setError,
  setGeneratedUserNameToDOM,
  setLocalMediaStreamToDOM,
  setStatus,
  updateLayout,
} from "@lib/webrtc/utils/html-helpers";
import {
  constructXirsysFormattedMessage,
  generateUserId,
  handleIncomingError,
} from "@lib/webrtc/utils/js-tools";
import {
  getAllConnectedUsersXirsys,
  getHostXirsysChannel,
  postCreateXirsysChannel,
  putIceServersXirsysChannel,
  putTokenXirsysChannel,
} from "@lib/webrtc/utils/fetch-helpers";

// ===============================================================
// 0. Global variables

let mediaStreamConstraints = { video: true, audio: true };

let channel_Id = null;
let user_name = null; // exm.: "user_NAME_1636583903.8396943"

// 0.1 (xirsys)
let token_host_rtc_config_from_xirsys = null;

// 0.2 (ws & rtc)
let rtc_configuration = null;
let connection_state = {
  rtcConnectionState: "",
  wsConnectionState: "",
  hangupRequired: false,
};
//TODO rename rtc_peer_connection to rtc_peer_connections
let rtc_peer_connection = null; //it should be object with connected peers = {[remotePeerUuid]: {displayName: '', pc:  new RTCPeerConnection(rtc_configuration) }}
let ws_conn = null;
let local_media_stream = null;
let local_screen_stream = null;

let isGridMode = false;

// ===============================================================
// 2. XHR functions

async function createXirsysChannelAndConnect(channelId) {
  try {
    await postCreateXirsysChannel(channelId);

    const tokenRes = await putTokenXirsysChannel(channelId, user_name);
    const token = JSON.parse(tokenRes);

    const hostRes = await getHostXirsysChannel(user_name);
    const host = JSON.parse(hostRes);

    const iceServersRes = await putIceServersXirsysChannel(channelId);
    const iceServers = JSON.parse(iceServersRes);

    return {
      ws_token: token.v,
      ws_host: host.v,
      channel: channelId,
      rtc_configuration: { iceServers: [{ ...iceServers.v.iceServers }] },
    };
  } catch (e) {
    logIntoUIAreaAndConsole("createXirsysChannelAndConnect error:", e);
  }
}

// ===============================================================
// 3. WS and RTC

// Get LOCAL STREAMS
function getLocalStream(callback) {
  /* display the local media stream (video) to itself */
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(mediaStreamConstraints)
      .then((stream) => {
        local_media_stream = stream;
        callback();
      })
      .catch(setError);
  } else {
    setError("Browser doesn't support getUserMedia!");
  }
}

function getScreenStreamPromise(callback) {
  if (navigator.getDisplayMedia) {
    navigator
      .getDisplayMedia(screenStreamDisplayMediaOptions)
      .then((screenStream) => {
        local_screen_stream = screenStream;
        callback();
      });
  } else if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices
      .getDisplayMedia(screenStreamDisplayMediaOptions)
      .then((screenStream) => {
        local_screen_stream = screenStream;
        callback();
      });
  } else {
    setError("Browser doesn't support getDisplayMedia!");
    // getScreenId(function(error, sourceId, screen_constraints) {
    //   navigator.mediaDevices.getUserMedia(screen_constraints).then(function(screenStream) {
    //     local_screen_stream = screenStream;
    //   });
    // });
  }
}

// SCREEN SHARING
function onCloseSharingStream() {
  const screenSharingContainer = document.getElementById(
    "screen-sharing-container"
  );
  const currentScreenSharingVideo = document.getElementById(
    "screen-sharing-video"
  );

  let isSuccess = false;
  //TODO 1. remove screen-sharing from rtc-connections

  //2. if success - remove screen-sharing from html: remove id=currentScreenSharingVideo
  let tracks = currentScreenSharingVideo.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  // currentScreenSharingVideo.srcObject = null;
  screenSharingContainer.innerHTML = "";
  document.getElementById("local-share-screen-btn").disabled = false;
  local_screen_stream = null;
}

function onLocalShareScreen() {
  const currentScreenSharingVideo = document.getElementById(
    "screen-sharing-video"
  );

  if (!currentScreenSharingVideo) {
    getScreenStreamPromise(() => {
      if (!local_screen_stream) {
        console.log(
          "onLocalShareScreen error, local_screen_stream:",
          local_screen_stream
        );
        return;
      }
      createLocalScreenSharingVideoElement(
        local_screen_stream,
        "Local screen sharing",
        true,
        onCloseSharingStream
      );
      // somebody clicked on "Stop sharing"
      local_screen_stream.getVideoTracks()[0].onended = onCloseSharingStream;
      document.getElementById("local-share-screen-btn").disabled = true;
      // add sharing-screen stream to remote peerIds
      if (rtc_peer_connection) {
        //TODO add local_screen_stream to each rtc_peer_connection peerId
        const shareScreenVideoTrack = local_screen_stream.getVideoTracks()[0];
        Object.keys(rtc_peer_connection).forEach((remotePeerId) => {
          const sender = rtc_peer_connection[remotePeerId].rtcPC
            .getSenders()
            .find(function (s) {
              return s.track.kind == shareScreenVideoTrack.kind;
            });
          sender.replaceTrack(shareScreenVideoTrack);
        });
      }
    });
  }
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

  if (rtc_peer_connection && Object.keys(rtc_peer_connection).length) {
    Object.keys(rtc_peer_connection).map((key) => {
      rtc_peer_connection[key].rtcPC.close();
    });

    rtc_peer_connection = null;
  }
}

function onWSServerError(event) {
  logIntoUIAreaAndConsole("signalling_server_error event:", event);
  setError(
    "Unable to connect to server, did you add an exception for the certificate?"
  );
  console.log("ws server error:  event: ", event);
}

function onWSServerMessage(event) {
  console.log("ws server message,  event obj: ", event);
  // console.log("!!!!!rtc_peer_connection:", rtc_peer_connection);
  // console.log("Received " + event.data);
  // {"m":{"f":"test/alex","o":"peer_connected","t":null},"p":"alex","t":"u"}
  // '{"t":"u","m":{f:"test/alex",t:"alex","o":"message"},"p":{"msg":"hi alex from alex"}}'
  logIntoUIAreaAndConsole(
    "signalling_server_msg_incoming event.data:"
    // event.data
  );

  const xirsysMessage = JSON.parse(event.data);
  // console.log(
  //   " @#@#@#@#  xirsysMessage: ",
  //   xirsysMessage,
  //   " event.data: ",
  //   event.data
  // );
  const remotePeerId = xirsysMessage.m.f.split("/")[1];
  // handle all xirsys messages types (peers, peer_connected, peer_removed, message)
  switch (xirsysMessage.m.o) {
    case "peers":
      setStatus(`list of connected peers ${xirsysMessage.p}`);
      break;
    case "peer_connected":
      setStatus(`peer just connected with name "${xirsysMessage.p}"`);
      logIntoUIAreaAndConsole("peer_connected", xirsysMessage.p);
      onPeerConnected(remotePeerId, xirsysMessage);
      break;
    case "peer_removed":
      setStatus(`peer just disconnected with name "${xirsysMessage.p}"`);
      logIntoUIAreaAndConsole("peer_removed", xirsysMessage.p);
      onPeerRemoved(remotePeerId, xirsysMessage);
      break;
    case "message":
      setStatus(`received message: "${xirsysMessage.p}"`);
      // handle incoming SDP
      const xirsysMessagePayload = JSON.parse(xirsysMessage.p);

      if (xirsysMessagePayload.sdp) {
        onIncomingSDP(remotePeerId, xirsysMessagePayload.sdp);
      } else if (xirsysMessagePayload.ice) {
        // handle incoming ICE
        onIncomingICE(remotePeerId, xirsysMessagePayload.ice);
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

function onLocalICECandidate(remotePeerId, event) {
  // setStatus("Sending outgoing ICE");
  // console.log(
  //   "rtc_peer_connection.onicecandidate event obj: ",
  //   event,
  //   ", to remotePeerId:",
  //   remotePeerId
  // );
  if (event.candidate === null) {
    console.log("ICE Candidate was null, done");
    return;
  }

  const ice = { ice: event.candidate };
  const xirsysFormatedMessageWithICE = constructXirsysFormattedMessage(
    token_host_rtc_config_from_xirsys.channel,
    user_name,
    remotePeerId,
    ice
  );
  ws_conn.send(JSON.stringify(xirsysFormatedMessageWithICE)); // We have a candidate, send it to the remote party via Xirsys signalling WS connection
}

function onLocalICECandidateGatheringStateChange(event) {
  // console.log("rtc_peer_connection.onicecandidate  event obj: ", event);
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
  // console.log("onDataChannel() triggered Data channel EVENT obj: ", event);
}

function onRemoteTrack(remotePeerId, event) {
  logIntoUIAreaAndConsole(
    `remote_track received from remotePeerId=${remotePeerId}, event obj: `,
    event
  );
  console.log("onRemoteTrack streams:", event.streams);

  const displayName = rtc_peer_connection[remotePeerId].displayName;
  addRemoteVideoEl(event.streams[0], remotePeerId, displayName);
}

function onNegotiationNeeded(remotePeerId, event) {
  logIntoUIAreaAndConsole("on_negotiation_needed triggered event:", event);
}

function onConnectionStateChange(event) {
  if (rtc_peer_connection && rtc_peer_connection.length) {
    rtc_peer_connection.forEach((item) => {
      console.log("item connectionState", item.rtcPC.connectionState);
    });
  }
}

function onRTCConnectionClose(event) {
  logIntoUIAreaAndConsole("rtc_peer_connection.onclose  ", `event: ${event}`);
  setStatus("Disconnected from RTC Peer Connection");
}

function onPeerConnected(remotePeerId, xirsysMessage) {
  if (xirsysMessage.p === user_name && !rtc_peer_connection) {
    //1. Ask xirsys is anybody in ws-room
    rtc_peer_connection = {};
    getAllConnectedUsersXirsys(channel_Id).then((allConnectedUsers) => {
      // console.log('getAllConnectedUsersXirsys allConnectedUsers:',allConnectedUsers)
      const connectedUsersWithoutMy = allConnectedUsers.filter(
        (uid) => uid !== user_name
      );
      console.log(
        "getAllConnectedUsersXirsys connectedUsersWithoutMy:",
        connectedUsersWithoutMy
      );
      if (connectedUsersWithoutMy.length) {
        connectedUsersWithoutMy.forEach((remotePeerId) => {
          //2. create rtc with each user and send each user spd-offer
          createRTCPeerConnectionAndMediaStream(remotePeerId, true);
        });
      }
    });
  }

  if (xirsysMessage.p !== user_name) {
    createRTCPeerConnectionAndMediaStream(remotePeerId);
  }
}

function onPeerRemoved(remotePeerId, xirsysMessage) {
  if (xirsysMessage.p !== user_name) {
    const state = rtc_peer_connection[remotePeerId].rtcPC.iceConnectionState;
    console.log(`remove connection with peer ${remotePeerId}, state: ${state}`);

    removeStreamFromDOM(remotePeerId, local_media_stream);

    // remove rtc_peer_connection obj for remotePeerId
    delete rtc_peer_connection[remotePeerId];

    //TODO: implement logic
    updateLayout();
  }
}

function onIncomingSDP(remotePeerId, sdp) {
  // SDP offer received from peer, set remote description and create an answer

  logIntoUIAreaAndConsole("sdp_incoming", sdp);

  switch (sdp.type) {
    case "offer": {
      setStatus("Got SDP offer from remotePeerId=", remotePeerId);
      rtc_peer_connection[remotePeerId].rtcPC
        .setRemoteDescription(sdp) //or new RTCSessionDescription(sdp)
        .then(() => {
          setStatus("Remote SDP set");

          rtc_peer_connection[remotePeerId].rtcPC
            .createAnswer()
            .then((description) =>
              onLocalDescription(remotePeerId, description, "answer")
            )
            .catch(setError);
        })
        .catch(setError);
      break;
    }
    case "answer": {
      setStatus("Got SDP answer");

      rtc_peer_connection[remotePeerId].rtcPC
        .setRemoteDescription(sdp)
        .then(() => {
          setStatus(`Remote SDP for remotePeerId=${remotePeerId} set`);
        })
        .catch(setError);
    }
  }
}

function onIncomingICE(remotePeerId, ice) {
  // ICE candidate received from peer, add it to the peer connection

  let candidate = new RTCIceCandidate(ice);
  rtc_peer_connection[remotePeerId].rtcPC
    .addIceCandidate(candidate)
    .then((addedIceCandidate) => {
      // logIntoUIAreaAndConsole(
      //   "rtc_peer_connection.addIceCandidate(candidate)   =>  addedIceCandidate: ",
      //   addedIceCandidate
      // );
    })
    .catch(setError);
}

function onLocalDescription(remotePeerId, localSDP, sdpType = "") {
  // Local description was set, send it to peer

  // console.log(
  //   "Got local description: " + JSON.stringify(localSDP),
  //   "remotePeerId=" + remotePeerId
  // );
  rtc_peer_connection[remotePeerId].rtcPC
    .setLocalDescription(localSDP)
    .then(function () {
      setStatus(`Sending SDP ${sdpType}`);
      const payload = {
        sdp: rtc_peer_connection[remotePeerId].rtcPC.localDescription,
      };

      const xirsysFormatedMessage = constructXirsysFormattedMessage(
        token_host_rtc_config_from_xirsys.channel,
        user_name,
        remotePeerId,
        payload
      );

      ws_conn.send(JSON.stringify(xirsysFormatedMessage));
      // logIntoUIAreaAndConsole(
      //   `sdp_outgoing type "${sdpType}" xirsysFormatedMessage(with sdp) remotePeerId=${remotePeerId}`,
      //   xirsysFormatedMessage
      // );
    });
}

function stopLocalMediaStreamTracks() {
  local_media_stream.getTracks().forEach((track) => {
    track.stop();
    logIntoUIAreaAndConsole(`mediaStreamTrack ${track.id} has been stopped`);
    setStatus(`mediaStreamTrack ${track.id} has been stopped`);
  });
}

function closeRTCAndWSConnection() {
  if (rtc_peer_connection && rtc_peer_connection.length) {
    rtc_peer_connection.forEach((item) => item.rtcPC.close());
  }
  rtc_peer_connection = null;
  if (ws_conn) {
    ws_conn.close();
    ws_conn = null;
    logIntoUIAreaAndConsole("ws_connection_closed");
  } else {
    console.log("closeRTCAndWSConnection, ws_conn should exist but:", ws_conn);
  }

  setStatus("RTC and WS connections are closed on hangup command");
  disabledControlBtns();
}

function onHangup() {
  const videoContainerEl = document.getElementById("remote-videos-container");
  videoContainerEl.innerHTML = "";
  document.getElementById("video-main-screen").srcObject = local_media_stream;

  closeRTCAndWSConnection();
  stopLocalMediaStreamTracks();
}

function createOfferToRemotePeerId(remotePeerId) {
  rtc_peer_connection[remotePeerId].rtcPC
    .createOffer()
    .then((description) => onLocalDescription(remotePeerId, description))
    .catch(() => console.log("createOffer error with peer=", remotePeerId));
}

function blackScreen({ width = 640, height = 480 } = {}) {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  const stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
}

// Create WS and RTC
function createRTCPeerConnectionAndMediaStream(remotePeerId, initCall = false) {
  // create call / new RTC connection to connect to remote peer
  // createCall()...

  logIntoUIAreaAndConsole(
    "Creating RTCPeerConnection for remote_peer_id=",
    remotePeerId
  );
  const displayName = remotePeerId.split("_")[1];
  rtc_peer_connection[remotePeerId] = {
    displayName: displayName,
    rtcPC: new RTCPeerConnection(rtc_configuration),
  };

  rtc_peer_connection[remotePeerId].rtcPC.onicecandidate = (event) =>
    onLocalICECandidate(remotePeerId, event);
  rtc_peer_connection[remotePeerId].rtcPC.onicegatheringstatechange =
    onLocalICECandidateGatheringStateChange;

  rtc_peer_connection[remotePeerId].rtcPC.ondatachannel = onDataChannel;

  rtc_peer_connection[remotePeerId].rtcPC.ontrack = (event) =>
    onRemoteTrack(remotePeerId, event);

  rtc_peer_connection[remotePeerId].rtcPC.onnegotiationneeded = (event) =>
    onNegotiationNeeded(remotePeerId, event);

  rtc_peer_connection[remotePeerId].rtcPC.onconnectionstatechange =
    onConnectionStateChange;

  rtc_peer_connection[remotePeerId].rtcPC.onclose = (event) =>
    onRTCConnectionClose;

  // console.log("adding local media stream");
  if (local_media_stream) {
    local_media_stream.getTracks().forEach(function (track) {
      rtc_peer_connection[remotePeerId].rtcPC.addTrack(
        track,
        local_media_stream
      );
    });
    // const senders = rtc_peer_connection[remotePeerId].rtcPC.getSenders()
    // let screenShareTrack = rtc_peer_connection[remotePeerId].rtcPC.addTransceiver('video');
    //
    // const screenShareDummyStream = new MediaStream([blackScreen()])
    // rtc_peer_connection[remotePeerId].rtcPC.addTransceiver(
    //     screenShareDummyStream.getTracks()[0], {direction: "sendonly"}
    // );
    // console.log('screenShareDummyTrack',screenShareDummyStream)
  } else {
    console.log(
      `addTrack to peerId ${remotePeerId} error, local_media_stream:`,
      local_media_stream
    );
  }

  if (initCall) {
    createOfferToRemotePeerId(remotePeerId);
  }
}

function createWSConnectionToXirsysSignalling() {
  if (!!ws_conn) {
    console.log("ws_conn already exists");
    return;
  }
  if (token_host_rtc_config_from_xirsys) {
    const token = token_host_rtc_config_from_xirsys.ws_token;
    const host = token_host_rtc_config_from_xirsys.ws_host;

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
}

// ===============================================================

function prepareElementsHandlersAndButtons() {
  // Step-2. Wait user click "Join" and onClick start wn-conn and ect.
  if (document.getElementById("start-call")) {
    document.getElementById("start-call").onclick = (event) => {
      event.preventDefault();
      if (!document.getElementById("start-call").disabled) {
        setStatus("Start call!");

        logIntoUIAreaAndConsole("createWS");
        // Step-2.2 connect to WebSocket Xirsys Singalling Sever
        createWSConnectionToXirsysSignalling();

        document.getElementById("local-share-screen-btn").disabled = false;
        document.getElementById("end-call").disabled = false;
      }
    };
  }

  if (document.getElementById("end-call")) {
    document.getElementById("end-call").onclick = (event) => {
      event.preventDefault();
      onHangup();
    };
  }

  if (document.getElementById("local-share-screen-btn")) {
    document.getElementById("local-share-screen-btn").onclick = (event) => {
      event.preventDefault();
      onLocalShareScreen();
    };
  }

  // Step-3. Send WS message:
  if (document.getElementById("btn-submit-dc-message")) {
    document.getElementById("btn-submit-dc-message").onclick = (ev) => {
      ev.preventDefault();
      const dc_message = document
        .getElementById("dc-message-input")
        .value.replace('"', "");
      const payload = { testMessage: dc_message };
      const message = constructXirsysFormattedMessage(
        token_host_rtc_config_from_xirsys.channel,
        user_name,
        null,
        payload
      );

      if (ws_conn) {
        ws_conn.send(JSON.stringify(message));
        console.log("message sent: ", JSON.stringify(message));
      }
    };
  }

  if (document.getElementById("get-xirsys-users")) {
    document.getElementById("get-xirsys-users").onclick = (event) => {
      event.preventDefault();

      getAllConnectedUsersXirsys(channel_Id).then((allConnectedUsers) => {
        const connectedUsers = document.getElementById("connected-peer-ids");
        if (!allConnectedUsers.length) {
          connectedUsers.innerHTML = " (none)";
        } else {
          connectedUsers.innerHTML = allConnectedUsers.reduce(
            (total, uid) => total + uid.split("_")[1] + "; ",
            " "
          );
        }
      });
    };
  }

  if (document.getElementById("grid-streams-button")) {
    document.getElementById("grid-streams-button").onclick = (event) => {
      event.preventDefault();

      const oneMainVideo = document.getElementById("one-main-video-screen");
      const gridMainVideo = document.getElementById("grid-main-video-screen");

      if (isGridMode) {
        oneMainVideo.display = "block";
        isGridMode = false;
      }

      if (!isGridMode && rtc_peer_connection && rtc_peer_connection.length) {
        if (rtc_peer_connection.length === 1) {
          //TODO add local and remote streams to div gridMainVideo
        } else {
          //TODO add remote streams to div gridMainVideo
          // const videoContainerEl = document.getElementById("remote-videos-container");
          // const currentRemoteVideoEls = document.querySelectorAll(
          //     "#remote-videos-container > div"
          // );
          //
          // Array.from(currentRemoteVideoEls)
          //     .filter((element) => element.className.includes(remotePeerId))
          //     .forEach((element) => {
          //       if (!element) {
          //         return;
          //       }
          //       videoContainerEl.removeChild(element);
          //     });
        }
        oneMainVideo.display = "none";
        isGridMode = true;
      }
    };
  }
}

// Main process
export function webrtcStart(channelId, userName) {
  // Step-1. Check is roomId valid: Channel names must begin with a letter and can contain numbers but cannot have any spaces or special characters other than underscores, dashes and periods.
  const isRoomIdValid =
    !!channelId && XIRSYS_CHANNEL_NAME_REGEX.test(channelId);
  if (!isRoomIdValid) {
    logIntoUIAreaAndConsole("Error: roomId is not valid, roomId=", channelId);
    return;
  }
  channel_Id = channelId;

  // Step-1.2. Create uniq userName (input or localStorage)
  user_name = generateUserId(userName);
  setGeneratedUserNameToDOM(user_name);

  getLocalStream(() => {
    if (!local_media_stream) {
      console.log(
        "getLocalStream error,local_media_stream=",
        local_media_stream
      );
      return;
    }

    setLocalMediaStreamToDOM(local_media_stream, mediaStreamConstraints);
  });

  // Step-1.3. Create channel, token, host, iceServers
  createXirsysChannelAndConnect(channelId).then((result) => {
    logIntoUIAreaAndConsole("createXirsysChannelAndConnect", result);

    const isConnectionResultValid =
      result.rtc_configuration && result.ws_token && result.ws_host;
    if (!isConnectionResultValid) {
      logIntoUIAreaAndConsole(
        "createXirsysChannelAndConnect failed: missing required data"
      );
      return;
    }

    token_host_rtc_config_from_xirsys = result;
    rtc_configuration = token_host_rtc_config_from_xirsys.rtc_configuration;

    setStatus("GET xirsys credentials for future session");

    enableControlBtns();
  });

  prepareElementsHandlersAndButtons();
}
