import React, { useState, useEffect } from "react";
import { webrtcStart } from "@lib/webrtc/webrtc";

import {
  CallActionsPanelWrap,
  SendMessageBoxWrap,
  SessionLogsWrap,
  VideoSelectWrap,
} from "@components/room/room.styles";

import EndCallSVG from "@assets/icons/EndCall-SVG";
import ChatIconSVG from "@assets/icons/ChatIcon-SVG";
import LogsIconSVG from "@assets/icons/LogsIcon-SVG";
import VideoOnSVG from "@assets/icons/VideoOn-SVG";
import AudioOnSVG from "@assets/icons/AudioOn-SVG";
import CloseIconSVG from "@assets/icons/CloseIcon-SVG";
import ChevronLeftSVG from "@assets/icons/ChevronLeft-SVG";
import TilesIconSVG from "@assets/icons/TilesIcon-SVG";

const modes = {
  showLogs: "showLogs",
  messageBox: "messageBox",
  videoSelect: "videoSelect",
};

const leftPanelModes = [modes.showLogs, modes.messageBox];
const rightPanelModes = [modes.videoSelect];

export default function RoomView({ roomId, userName }) {
  const [leftPanelMode, setLeftPanelMode] = useState("");
  const [rightPanelMode, setRightPanelMode] = useState(rightPanelModes[0]);

  useEffect(() => {
    if (roomId && userName) {
      webrtcStart(roomId, userName);
    }
  }, [roomId, userName]);

  const onClickSetLeftMode = (modeName) => {
    setLeftPanelMode(leftPanelMode === modeName ? "" : modeName);
  };
  const onClickSetRightMode = (modeName) => {
    setRightPanelMode(rightPanelMode === modeName ? "" : modeName);
  };

  const SessionLogs = ({ isShown }) => {
    return (
      <SessionLogsWrap isShown={isShown}>
        <h2>Call session</h2>

        <div className="mb-15">
          CHANNEL ID:{" "}
          <span
            id="ws-channel-id"
            style={{
              color: "grey",
              textAlign: "center",
              width: "100%",
            }}
          >
            {roomId || "unknown"}
          </span>
        </div>

        <div>
          {/* Step-1 */}
          <div>
            <div>
              Current user name:{" "}
              <span id="su_name" className="main-info su_name">
                {userName || "unknown"}
              </span>
            </div>
            <div className="mb-15">
              user id -
              <span id="user-id-with-timestamp" className="main-info su_name">
                {" "}
                ?{" "}
              </span>
            </div>
          </div>

          <hr />

          {/* Step-2 */}

          <div>
            <button
              type="button"
              id="get-xirsys-users"
              disabled={true}
              className="get-users action-button"
            >
              Get connected users
            </button>

            <div>
              Connected users (PEER IDs):
              <span
                id="connected-peer-ids"
                style={{
                  color: "grey",
                  textAlign: "center",
                  width: "100%",
                }}
              />
            </div>

            <hr />

            <p>Call actions</p>
            <div>
              <button
                className="share-screen action-button"
                id="local-share-screen-btn"
                disabled={true}
              >
                Share screen
              </button>
            </div>
          </div>

          {/* Step-3 */}
        </div>

        <div className="status">
          Status:{" "}
          <span id="status" className="main-info">
            unknown
          </span>
        </div>
      </SessionLogsWrap>
    );
  };

  const SendMessageBox = ({ isShown }) => {
    return (
      <SendMessageBoxWrap isShown={isShown}>
        <h2>Step-3</h2>
        <p>Send ws message:</p>
        <div>
          {/*<label htmlFor="dc-message-input">message</label>*/}
          <input
            id="dc-message-input"
            type="textarea"
            defaultValue="hi"
          />
          <button type="submit" id="btn-submit-dc-message">
            Send ws-message
          </button>
        </div>
      </SendMessageBoxWrap>
    );
  };

  const CallActionsPanel = () => {
    return (
      <CallActionsPanelWrap>
        <button
          className="start-call-button action-button"
          id="start-call"
          disabled={true}
        >
          Join
        </button>
        <div className="local-media-control">
          <input
            type="checkbox"
            id="local-video-control"
            name="local-video-on-off"
            className="local-media-control"
            checked
            disabled
          />
          <label htmlFor="local-video-control">
            <VideoOnSVG />
          </label>
        </div>
        <div className="local-media-control">
          <input
            type="checkbox"
            id="local-audio-control"
            name="local-audio-on-off"
            checked
            disabled
          />
          <label htmlFor="local-audio-control">
            <AudioOnSVG />
          </label>
        </div>
        <button
          className="end-call-button action-button"
          id="end-call"
          disabled={true}
        >
          <EndCallSVG />
        </button>
        <button
          className="action-button"
          type="button"
          onClick={() => onClickSetLeftMode(modes.showLogs)}
        >
          <LogsIconSVG />
          {/*<span style={{ fontSize: "28px" }}>⌘</span>*/}
        </button>
        <button
          className="action-button"
          type="button"
          onClick={() => onClickSetLeftMode(modes.messageBox)}
        >
          <ChatIconSVG />
          {/*<span style={{ fontSize: "30px" }}>✉</span>*/}
        </button>
          <button
              id='grid-streams-button'
              className="action-button"
              type="button"
          >
              <TilesIconSVG />
          </button>
      </CallActionsPanelWrap>
    );
  };

  const VideoSelect = () => {
    return (
      <VideoSelectWrap>
        <div className="video-container-local">
          <div className="videoLabel">You</div>
          <video
            height="150px"
            width="200px"
            className="video"
            id="video-stream-local"
            autoPlay
            controls
            playsInline
            muted
          >
            Your browser doesn't support video
          </video>
        </div>
        <div id="remote-videos-container">
          {/*<div id="video-stream-remote-wrap" className="video-container-remote ">*/}
          {/*  <video*/}
          {/*      height="100%"*/}
          {/*      width="100%"*/}
          {/*      className="video"*/}
          {/*      id="video-stream-remote"*/}
          {/*      autoPlay*/}
          {/*  >*/}
          {/*    No video*/}
          {/*  </video>*/}
          {/*  <div className="videoLabel">Name</div>*/}
          {/*</div>*/}
        </div>
        <div id="screen-sharing-container" />
      </VideoSelectWrap>
    );
  };

  const MainVideo = ()=>{
      return (
          <div className="video-main-screen" id='one-main-video-screen'>
              <div className="videoLabel">You</div>
              <video
                  height="100%"
                  width="100%"
                  className="video"
                  id="video-main-screen"
                  autoPlay
                  controls
                  playsInline
                  muted
              >
                  Your browser doesn't support video
              </video>
          </div>
      )
  }

  return (
    <div className="main-wrap">
      <div
        className={`left-modal-box ${
          leftPanelModes.includes(leftPanelMode) ? "show" : ""
        }`}
      >
        <div className="close-button-wrap">
          <button
            className="close-button"
            type="button"
            onClick={() => onClickSetLeftMode("")}
          >
            <CloseIconSVG />
          </button>
        </div>
        {SessionLogs({ isShown: leftPanelMode === modes.showLogs })}
        {SendMessageBox({ isShown: leftPanelMode === modes.messageBox })}
      </div>

      <div className="main-content">
          <div id='grid-main-video-screen'/>
          {MainVideo()}
      </div>
      {CallActionsPanel()}

      <div
        className={`right-modal-box ${
          rightPanelModes.includes(rightPanelMode) ? "show" : ""
        }`}
      >
        <div className="content-wrap">
          {VideoSelect()}
          <div className="open-close-button-wrap">
            <button
              className="open-close-button"
              type="button"
              onClick={() =>
                onClickSetRightMode(!rightPanelMode ? rightPanelModes[0] : "")
              }
            >
              <ChevronLeftSVG />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
