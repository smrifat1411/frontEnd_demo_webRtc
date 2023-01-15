export const streaming_protocol_version = 0;

export const xirsysChannelSymbolsMax = 29;
export const nameSymbolsMax = 20;
export const XIRSYS_CHANNEL_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_.]{1,29}$/i;
export const USER_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_.]{2,20}$/i;
export const XIRSYS_CHANNEL_NAME_REGEX_CLEARIFY = /[a-zA-Z0-9-_.]/gi;

export const xirsysUrl = "https://global.xirsys.net";
export const xirsysAuthString = process.env.NEXT_PUBLIC_XIRSYS_AUTH_STRING;
export const xirsysTokenExpireTime = 86400;

export const WS_CONNECTION_STATES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
};

export const screenStreamDisplayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
};
