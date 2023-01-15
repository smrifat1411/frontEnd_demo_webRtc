import React from "react";
import { ThemeProvider } from "styled-components";
import Main from "../src/components/main";

import Navigation from "@sections/Navigation";
import BlogSinglePage from "@sections/Blog-single";
import Footer from "@sections/Footer-classic";

import { GlobalStyle } from "@sections/app.style";
import theme from "@theme/blog/themeStyles";

const Home = () => (
  <ThemeProvider theme={theme}>
    <Main title="All0e! | Blog">
      <GlobalStyle />
      <Navigation />
      <BlogSinglePage />
      <Footer />
    </Main>
  </ThemeProvider>
);

export default Home;
