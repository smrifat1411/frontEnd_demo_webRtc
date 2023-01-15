import React from "react";
import PropTypes from "prop-types";

import { Container, Row, Col } from "reusecore/Layout";
import SectionTitle from "reusecore/SectionTitle";

import aboutIcon1 from "assets/images/classic/about/icon-1.svg";
import aboutIcon2 from "assets/images/classic/about/icon-2.svg";
import aboutIcon3 from "assets/images/classic/about/icon-3.svg";

import AboutSectionWrapper from "./about.style";

const AboutClassic = () => {
  return (
    <AboutSectionWrapper id="about">
      <Container>
        <SectionTitle UniWidth="65%">
          <h2>
            Starting with <span>All0e</span> is easier than anything.
          </h2>
        </SectionTitle>
        <Row>
          <Col xs={12} sm={6} lg={4}>
            <div className="single-item">
              <div className="item-head">
                <div className="item-icon">
                  <img src={aboutIcon1} alt="appion app about icon" />
                </div>
                <h3>Call family and friends</h3>
              </div>

              <p>
                Don't need to install any desktop application. Just generate
                your own chat-room and share the link with your partners
              </p>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <div className="single-item">
              <div className="item-head">
                <div className="item-icon">
                  <img src={aboutIcon2} alt="appion app about icon" />
                </div>
                <h3>Work together</h3>
              </div>

              <p>
                Make video calls and share your screen with peer-to-peer
                communication between browsers
              </p>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <div className="single-item">
              <div className="item-head">
                <div className="item-icon">
                  <img src={aboutIcon3} alt="appion app about icon" />
                </div>
                <h3>Business calls</h3>
              </div>

              <p>
                Connect with your partner securely, without intermediary servers
                and risks of data leakage
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </AboutSectionWrapper>
  );
};

export default AboutClassic;
