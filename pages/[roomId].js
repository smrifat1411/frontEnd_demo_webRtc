import React from "react";
import { ThemeProvider } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import theme from "@theme/blog/themeStyles";
import Main from "@components/main";
import Room from "@components/room/Room";
import { GlobalStyle } from "@sections/app.style";
import styled from "styled-components";

import logo from "@assets/images/app/logo.png";

const RoomNavigation = () => {
  return (
    <RoomNavigationWrap>
      <Link href="/" passHref>
        <a className="link-item logo">
          <div className="link-item-content">
            <img src={logo} alt="all0e logo" width={50} />
            <span>all0e!</span>
          </div>
        </a>
      </Link>
      <Link href="/user" passHref>
        <a className="link-item">
          <div className="link-item-content">
            <span>Users rooms</span>
          </div>
        </a>
      </Link>
    </RoomNavigationWrap>
  );
};

const RoomItem = () => {
  const router = useRouter();
  const roomId = router.query.roomId;

  return (
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <Main
          title={`All0e! | Room: ${roomId ? roomId.toUpperCase() : "Web RTC"} `}
        >
          <GlobalStyle />
          <RoomNavigation />
          <Room roomId={roomId} />
        </Main>
      </React.Fragment>
    </ThemeProvider>
  );
};

export default RoomItem;

const RoomNavigationWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 50px;

  .link-item {
    margin-right: 40px;
    .link-item-content {
      display: flex;
      align-items: center;
    }
  }
`;
