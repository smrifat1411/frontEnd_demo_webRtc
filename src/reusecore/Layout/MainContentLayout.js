import React from "react";
import { Container } from "@reusecore/Layout";

const MainContentLayout = ({ children }) => {
  return (
    <div style={{ margin: "200px 0 100px" }}>
      <Container>{children}</Container>
    </div>
  );
};

export default MainContentLayout;
