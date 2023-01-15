import React from "react";
import { ThemeProvider } from "styled-components";

import Main from "../src/components/main";

import Navigation from "@sections/Navigation";
import BlogPage from "@sections/Blog-grid";
import Footer from "@sections/Footer-classic";

import { GlobalStyle } from "@sections/app.style";
import theme from "@theme/blog/themeStyles";

const Home = () => (
  <ThemeProvider theme={theme}>
    <Main title="All0e! | Blogs">
      <GlobalStyle />
      <Navigation />
      <BlogPage />
      <Footer />
    </Main>
  </ThemeProvider>
);

export default Home;
