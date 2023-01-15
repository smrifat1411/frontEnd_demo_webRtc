import { generateName } from "@lib/helpers/nameGenerator";
import {
  XIRSYS_CHANNEL_NAME_REGEX_CLEARIFY,
  xirsysChannelSymbolsMax,
} from "@lib/webrtc/constants";

export function generateRandomChatRoomLink() {
  const randomText = generateName();
  const today = Date.now();

  return `/${randomText}-${today}`.slice(0, xirsysChannelSymbolsMax - 1);
}

export function clearName(str = "") {
  let clearStr = "";
  const matchesArr = str.match(XIRSYS_CHANNEL_NAME_REGEX_CLEARIFY);
  if (str && matchesArr && matchesArr.length) {
    clearStr = matchesArr.join("");

    // If first symbol is not a letter - replace with 'a_'
    if (!/^[a-zA-Z]/i.test(clearStr[0])) {
      clearStr = "a_" + clearStr.slice(1);
    }
  }
  return clearStr;
}
