import { setError } from "@lib/webrtc/utils/html-helpers";

export function msToTime(s) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;
  const hrs = (s - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(ms, 3);
}

export function getDateWithTime(date) {
  return `${date.toDateString()} ${msToTime(date.getTime())}`;
}

export function generateUnixTimestamp() {
  return window.Date.now();
}

export function generateUserId(userName) {
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
  return `user_${userName}_${generateUnixTimestamp()}.${randomNumber}`;
}

export function constructXirsysFormattedMessage(
  channel,
  from_user_name_peer_id,
  to_peer_id,
  payload
) {
  return {
    t: "u",
    m: {
      f: `${channel}/${from_user_name_peer_id}`,
      t: to_peer_id,
      o: "message",
    },
    p: JSON.stringify(payload),
  };
}

export function handleIncomingError(error) {
  setError("ERROR: " + error);
}
