import React, {useState } from "react";
import InputNameModal from "@components/room/InputNameModal";
import RoomView from "@components/room/RoomView";
import RoomWrap from "@components/room/room.styles";

export default function Room({ roomId }) {
  const [userName, setUserName] = useState("");

  return (
    <RoomWrap>
      {!userName && (
        <InputNameModal setUserName={setUserName} roomId={roomId} />
      )}
      {!!userName && <RoomView roomId={roomId} userName={userName} />}
    </RoomWrap>
  );
}
