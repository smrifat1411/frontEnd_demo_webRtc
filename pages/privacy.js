import React from "react";
import {ThemeProvider} from "styled-components";
import theme from "@theme/blog/themeStyles";
import {GlobalStyle} from "@sections/app.style";
import Main from "@components/main";
import Navigation from "@sections/Navigation";
import Footer from "@sections/Footer-classic";

const Privacy = () => (
    <ThemeProvider theme={theme}>
        <Main title="All0e! | Privacy">
            <GlobalStyle />
            <Navigation isMainPage={false} />
            <div style={{height: '500px', padding: '250px 100px'}}>Coming soon...</div>
            <Footer />
        </Main>
    </ThemeProvider>
);

export default Privacy;