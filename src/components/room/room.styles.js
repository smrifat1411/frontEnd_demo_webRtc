import styled from "styled-components";

export const CallActionsPanelWrap = styled.div`
  position: absolute;
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(211, 211, 211, 0.55);
  z-index: 15;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;

  > button:not(:last-child) {
    margin-right: 15px;
    margin-bottom: 0;
  }

  .local-media-control {
    margin-right: 15px;

    > input {
      display: none;
    }

    > label {
      display: block;
      background-color: white;
      padding: 5px;
      border-radius: 8px;
      cursor: pointer;

      svg {
        fill: red;
      }
    }

    > input:checked + label {
      svg {
        fill: #1ec26a;
      }
    }
  }
`;

export const SessionLogsWrap = styled.div`
  display: ${({ isShown }) => (isShown ? "block" : "none")};

  .status {
    border-top: 1px solid gray;
    padding: 10px 0;
    height: 200px;
  }
`;

export const SendMessageBoxWrap = styled.div`
  display: ${({ isShown }) => (isShown ? "block" : "none")};
`;

export const VideoSelectWrap = styled.div`
  .video {
    display: block;
    border: 2px solid grey;
    background-color: #ececec;
  }

  .videoLabel {
    position: absolute;
    color: rgb(169, 250, 169);
    padding: 2px 5px;
    border-radius: 10px;
    background-color: rgba(253, 253, 253, 0.3);
    bottom: 10px;
    right: -15px;
    transform: translateX(-100%);
    z-index: 10;
  }

  .video-container-local {
    position: relative;
  }

  #remote-videos-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;
  }

  .video-container-remote {
    position: relative;
    padding: 10px;
    width: 45%;
  }
`;

const RoomWrap = styled.div`
  width: 100%;
  line-height: 1.25;
  font-size: 14px;

  > * {
    overflow: auto;
  }

  > script {
    display: none;
  }

  .main-wrap {
    height: 85vh;
    position: relative;
    display: flex;
    flex-direction: row;
    border: 1px solid lightgray;
  }
  
  .main-content{
    height: 100%;
    width: 100%;
  }
  
  .video-main-screen{
    height: 100%;
    position: relative;
    background-color: #1EC26A;
    
    .videoLabel {
      position: absolute;
      color: rgb(169, 250, 169);
      font-weight: 600;
      font-size: 22px;
      padding: 2px 5px;
      border-radius: 10px;
      background-color: rgba(253, 253, 253, 0.3);
      top: 5%;
      left: 50%;
      transform: translate(-50%,-50%);
      z-index: 20;
    }
  }

  .left-modal-box {
    position: absolute;
    z-index: 10;
    left: 0;
    width: 350px;
    height: 100%;
    border-right: 1px solid grey;
    background-color: rgba(169, 250, 169, 0.95);
    padding: 20px;
    display: none;

    &.show {
      display: block;
    }

    .close-button-wrap {
      width: 100%;
      text-align: right;

      .close-button {
        border: none;
        background-color: transparent;
      }
    }
  }

  .right-modal-box {
    position: absolute;
    z-index: 9;
    width: 250px;
    height: 100%;
    border-right: 1px solid grey;
    background-color: rgba(169, 250, 169, 0.7);
    padding: 20px;
    right: -250px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &.show {
      right: 0;

      .open-close-button > svg {
        transform: rotate(180deg);
      }
    }

    .content-wrap {
      position: relative;
    }

    .open-close-button-wrap {
      position: absolute;
      left: -70px;
      top: 600px;

      .open-close-button {
        border-radius: 10px;
        padding: 0;
        background-color: lightgray;
      }
    }
  }

  .fullScreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 98vh;
  }

  .main-info {
    color: darkblue;
    font-style: italic;
  }

  .mb-15 {
    margin-bottom: 15px;
  }

  .action-button {
    color: white;
    padding: 5px;
    border-radius: 8px;
    border-color: lightgray;
    cursor: pointer;
  }

  .action-button:disabled {
    background-color: lightgray;

    svg {
      fill: darkgray;
    }
  }

  .get-users {
    background-color: orange;
  }

  .start-call-button {
    min-width: 60px;
    background-color: darkgreen;
  }

  .end-call-button {
    background-color: darkred;
  }

  .share-screen {
    background-color: blue;
  }
`;

export default RoomWrap;
