import React from "react";
import { ThemeProvider } from "styled-components";
import theme from "@theme/blog/themeStyles";
import { GlobalStyle } from "@sections/app.style";
import Main from "@components/main";
import Navigation from "@sections/Navigation";
import Footer from "@sections/Footer-classic";
import UserContent from "@components/user/UserContent";

const User = () => (
  <ThemeProvider theme={theme}>
    <Main title="All0e! | User">
      <GlobalStyle />
      <Navigation isMainPage={false} />
        <UserContent/>
      <Footer />
    </Main>
  </ThemeProvider>
);

export default User;
