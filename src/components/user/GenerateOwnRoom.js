import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

import SectionTitle from "@reusecore/SectionTitle";
import VintageBox from "@reusecore/VintageBox";
import Button from "@reusecore/Button";
import Input from "@reusecore/Input";

import { clearName, generateRandomChatRoomLink } from "@lib/helpers/helpers";
import { xirsysChannelSymbolsMax } from "@lib/webrtc/constants";

const GenerateOwnRoom = () => {
  const router = useRouter();

  const initRoomName = "my-chat-room";
  const [inputName, setInputName] = useState("");

  const onChange = ({ target }) => {
    const { value } = target;
    setInputName(value);
  };

  const onGenerateRoom = () => {
    let clearValue = inputName.trim();
    clearValue = clearName(clearValue);
    if (!clearValue) {
      clearValue = generateRandomChatRoomLink();
    }else{
      clearValue = `/${clearValue}`
    }
    clearValue = clearValue.slice(0, xirsysChannelSymbolsMax - 1)
    router.push(clearValue);
  };

  const onGenerateRandomRoom = () => {
    const href = generateRandomChatRoomLink();
    if (!href) {
      console.log("Try again");
      return;
    }
    router.push(href);
  };

  return (
    <GenerateOwnRoomWrap>
      <SectionTitle
        className="section-title-block"
        leftAlign={true}
        UniWidth="100%"
        mb={50}
      >
        <h2>
          <span>Generate your room</span>
        </h2>
      </SectionTitle>

      <div className="input-container">
        <Input
          value={inputName}
          onChange={onChange}
          placeholder={initRoomName}
          margin={"10px 0"}
          border={"1px solid gray"}
          width={"70%"}
        />
        <Button onClick={onGenerateRoom} className="button">
          Generate own room
        </Button>
      </div>

      <VintageBox right={true} vintageOne={true}>
        <Button secondary onClick={onGenerateRandomRoom}>
          or generate random room
        </Button>
      </VintageBox>
    </GenerateOwnRoomWrap>
  );
};

export default GenerateOwnRoom;

const GenerateOwnRoomWrap = styled.div`
  margin-bottom: 100px;

  .input-container {
    margin-bottom: 50px;
    display: flex;
    align-items: center;

    .button {
      padding: 20px;
    }
  }
`;
