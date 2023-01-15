import React, { useState } from "react";
import styled from "styled-components";
import Input from "@reusecore/Input";
import Button from "@reusecore/Button";
import Particle from "@reusecore/Particle";
import FooterBGTwo from "@assets/images/app/footer/footer-particle-two.png";
import { clearName } from "@lib/helpers/helpers";
import { generateName } from "@lib/helpers/nameGenerator";
import { nameSymbolsMax, USER_NAME_REGEX } from "@lib/webrtc/constants";

export default function InputNameModal({
  setUserName,
  roomId,
  withAnimation = true,
}) {
  const [userNameInput, setUserNameInput] = useState("");

  const onChangeInput = (e) => {
    e.preventDefault();
    let clearValue = e.target.value.trim();
    clearValue = clearName(clearValue);
    setUserNameInput(clearValue);
  };

  const onSubmit = () => {
    let name = userNameInput.slice(0, nameSymbolsMax - 1);
    const isValid = userNameInput && USER_NAME_REGEX.test(userNameInput);
    if (!isValid) {
      name = generateName();
    }
    setUserName(name);
  };

  const onKeyPressInput = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <InputNameModalWrap>
      <img src={FooterBGTwo} alt="img" className="section__particle one" />
      {!!withAnimation && <Particle />}
      <div className="content">
        <h2 className="title">To join room</h2>
        <p className="room-name">{roomId}</p>
        <label htmlFor="user-name-input" className="input-label">
          input your name
        </label>
        <div className="input-wrap">
          <Input
            type="text"
            value={userNameInput}
            onChange={onChangeInput}
            onKeyPress={onKeyPressInput}
            placeholder="Alex"
            maxLength={nameSymbolsMax}
            minLength={2}
          />
        </div>
        <div style={{ textAlign: "end" }}>
          <Button type="submit" onClick={onSubmit}>
            Join room
          </Button>
        </div>
      </div>
    </InputNameModalWrap>
  );
}

const InputNameModalWrap = styled.div`
  background-color: whitesmoke;

  height: 89vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .section__particle {
    position: absolute;
    z-index: 1;
    &.one {
      bottom: 0;
      right: -80%;
    }
  }

  .content {
    position: absolute;
    z-index: 2;
    min-width: 330px;
  }

  .title {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }

  .room-name {
    margin-left: 125px;
    color: darkgreen;
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 60px;
  }

  .input-label {
    color: #1d316c;
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .input-wrap {
    margin-bottom: 20px;
  }
`;
