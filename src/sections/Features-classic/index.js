import React from "react";

import { Container, Row, Col } from "reusecore/Layout";
import SectionTitle from "reusecore/SectionTitle";

import Icon1 from "assets/images/classic/features/01.svg";
import Icon2 from "assets/images/classic/features/02.svg";
import Icon3 from "assets/images/classic/features/03.svg";
import Icon4 from "assets/images/classic/features/04.svg";
import Icon5 from "assets/images/classic/features/05.svg";
import Icon6 from "assets/images/classic/features/06.svg";

import FeturesSectionWrapper from "./fetures.style";

const FeaturesClassic = () => {
  return (
    <FeturesSectionWrapper id="features">
      <Container>
        <SectionTitle UniWidth="65%">
          <h2>
            <span>Some of the best features </span> you find in one source.
          </h2>
        </SectionTitle>
        <Row>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon1} alt="prime app features icon" />
              </div>
              <h3>Free and casual</h3>
              <p>
                Unlimited free meetings access to meetings with up to 100
                participants at the same time
              </p>
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon2} alt="prime app features icon" />
              </div>
              <h3>Browser-based meetings</h3>
              <p>No downloads, no logins, no hassle. For desktop and mobile.</p>
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon3} alt="prime app features icon" />
              </div>
              <h3>Comfortable teamwork</h3>
              <p>Multiple participants can share their screen simultaneously</p>
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon4} alt="prime app features icon" />
              </div>
              <h3>Easy access</h3>
              <p>Simply share your room link to start a meeting in seconds.</p>
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon5} alt="prime app features icon" />
              </div>
              <h3>Join in one click</h3>
              <p>
                Tap or click the meeting link from any device to get started.
              </p>
            </div>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <div className="fetures-block">
              <div className="features-icon">
                <img src={Icon6} alt="prime app features icon" />
              </div>
              <h3>Knock to enter</h3>
              <p>
                Rooms are locked by default. Hosts choose who enters the room.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </FeturesSectionWrapper>
  );
};

export default FeaturesClassic;
