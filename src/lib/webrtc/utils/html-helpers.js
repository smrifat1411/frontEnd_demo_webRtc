import { getDateWithTime } from "@lib/webrtc/utils/js-tools";

// ===============================================================
// 1. UI-display functions

export function logIntoUIAreaAndConsole(text, data = "") {
  // const logEl = document.getElementById("logs");
  // const node = document.createElement("p");
  // node.className = "log";
  // node.innerHTML = `${getDateWithTime(new Date())} - ${text}: ${JSON.stringify(
  //   data
  // )}`;
  // logEl.appendChild(node);

  console.log(getDateWithTime(new Date()), `${text} `, data);
}

export function setStatus(text) {
  // console.log(text);
  let span = document.getElementById("status");
  // Don't set the status if it already contains an error
  if (span && !span.classList.contains("error")) {
    span.textContent = text;
  }
}

export function setError(text) {
  // console.error(text);
  let span = document.getElementById("status");
  if (!span) {
    return;
  }
  span.textContent = text;
  span.classList.add("error");
}

export function updateLayout() {
  //TODO maybe add some styles
}

export function createLocalScreenSharingVideoElement(
  src,
  label,
  isLocalScreen,
  onCloseSharingStream
) {
  const screenSharingContainer = document.getElementById(
    "screen-sharing-container"
  );

  //add sharing-screen stream to video element to html
  const vidElement = document.createElement("video");
  vidElement.setAttribute("autoplay", "");
  vidElement.setAttribute("id", `screen-sharing-video`);
  vidElement.setAttribute("height", `300px`);
  vidElement.setAttribute("width", `500px`);
  vidElement.setAttribute("class", `video`);
  vidElement.setAttribute("muted", ``);
  vidElement.innerHTML = "No video";
  vidElement.srcObject = src;
  vidElement.onclick = (event) => {
    event.preventDefault();

    const elClassName = vidElement.className;
    if (elClassName.includes("fullScreen")) {
      vidElement.className = elClassName.replace("fullScreen", "");
    } else {
      vidElement.className = elClassName + " fullScreen";
    }
  };

  const vidLabel = document.createElement("div");
  vidLabel.appendChild(document.createTextNode(label));
  vidLabel.setAttribute("class", "screen-sharing-label");

  const vidContainer = document.createElement("div");
  vidContainer.setAttribute("id", "screen-sharing-wrap");
  vidContainer.setAttribute("class", "screen-sharing-wrap");
  vidContainer.appendChild(vidElement);
  vidContainer.appendChild(vidLabel);

  if (isLocalScreen) {
    const controlBtn = document.createElement("button");
    controlBtn.innerHTML = "Stop sharing";
    controlBtn.setAttribute("id", "stop-screen-sharing-btn");
    controlBtn.setAttribute("type", "button");
    controlBtn.setAttribute("class", "stop-screen-sharing-btn");
    controlBtn.onclick = onCloseSharingStream;

    vidContainer.appendChild(controlBtn);
  }

  screenSharingContainer.appendChild(vidContainer);
}

export function addRemoteVideoEl(stream, remotePeerId, displayName) {
  const trackId = stream.id;

  const existedEl = document.getElementById(
    `video-stream-remote_${remotePeerId}_${trackId}`
  );
  if (existedEl) {
    return;
  }

  const vidElement = document.createElement("video");
  vidElement.setAttribute("autoplay", "");
  vidElement.setAttribute(
    "id",
    `video-stream-remote_${remotePeerId}_${trackId}`
  );
  vidElement.setAttribute("height", `150px`);
  vidElement.setAttribute("width", `200px`);
  vidElement.setAttribute("class", `video`);
  vidElement.setAttribute("controls", ``);
  vidElement.setAttribute("playsinline", ``);
  vidElement.innerHTML = "No video";
  vidElement.srcObject = stream;

  const vidLabel = document.createElement("div");
  vidLabel.appendChild(document.createTextNode(displayName));
  vidLabel.setAttribute("class", "videoLabel");

  const vidContainer = document.createElement("div");
  vidContainer.setAttribute(
    "class",
    "video-container-remote video-container-remote_" + remotePeerId
  );
  vidContainer.appendChild(vidElement);
  vidContainer.appendChild(vidLabel);

  document.getElementById("remote-videos-container").appendChild(vidContainer);
  document.getElementById("video-main-screen").srcObject = stream;

  updateLayout();
}

export function setLocalMediaStreamToDOM(
  local_media_stream,
  mediaStreamConstraints
) {
  const videoTrack = local_media_stream.getVideoTracks()[0];
  const audioTrack = local_media_stream.getAudioTracks()[0];

  const videoControlBtn = document.getElementById("local-video-control");
  const audioControlBtn = document.getElementById("local-audio-control");
  const videoElLocalStream = document.getElementById("video-stream-local");
  const videoElMainStream = document.getElementById("video-main-screen");
  videoControlBtn.disabled = false;
  audioControlBtn.disabled = false;
  videoControlBtn.checked = !!mediaStreamConstraints.video;
  audioControlBtn.checked = !!mediaStreamConstraints.audio;

  videoControlBtn.onclick = () => {
    const isVideoEnabled = !!videoTrack.enabled;
    videoTrack.enabled = !isVideoEnabled;
    videoControlBtn.checked = !isVideoEnabled;
  };
  audioControlBtn.onclick = () => {
    const isAudioEnabled = !!audioTrack.enabled;
    audioTrack.enabled = !isAudioEnabled;
    audioControlBtn.checked = !isAudioEnabled;
  };

  videoElLocalStream.srcObject = local_media_stream;
  videoElMainStream.srcObject = local_media_stream;
}

export function setGeneratedUserNameToDOM(user_name) {
  if (document.getElementById("user-id-with-timestamp")) {
    document.getElementById("user-id-with-timestamp").innerHTML = user_name;
  }
}

export function removeStreamFromDOM(remotePeerId, local_media_stream) {
  document.getElementById("video-main-screen").srcObject = local_media_stream;

  // remove video elements for remotePeerId
  const videoContainerEl = document.getElementById("remote-videos-container");
  const currentRemoteVideoEls = document.querySelectorAll(
    "#remote-videos-container > div"
  );

  Array.from(currentRemoteVideoEls)
    .filter((element) => element.className.includes(remotePeerId))
    .forEach((element) => {
      if (!element) {
        return;
      }
      videoContainerEl.removeChild(element);
    });
}

export function disabledControlBtns() {
  document.getElementById("start-call").disabled = true;
  document.getElementById("end-call").disabled = true;
  document.getElementById("local-share-screen-btn").disabled = true;
}

export function enableControlBtns() {
  if (document.getElementById("start-call")) {
    document.getElementById("start-call").disabled = false;
  }
  if (document.getElementById("get-xirsys-users")) {
    document.getElementById("get-xirsys-users").disabled = false;
  }
}
