import React from "react";
import { useRouter } from "next/router";

import { Container, Row, Col } from "@reusecore/Layout";
import SectionTitle from "@reusecore/SectionTitle";
import Button from "@reusecore/Button";
import VintageBox from "@reusecore/VintageBox";

import { FaPlay } from "react-icons/fa";

import AppScreenImage from "@assets/images/classic/banner/video-chat-apps-example.png";
import AppScreenThumb1 from "@assets/images/classic/banner/banner-photo-3.png";
import AppScreenThumb2 from "@assets/images/classic/banner/banner-photo-2.png";

import BannerSectionWrapper from "./banner.style";
import { generateRandomChatRoomLink } from "@lib/helpers/helpers";

const BannerClassic = () => {
  const router = useRouter();

  const onGenerateRoom = () => {
    const href = generateRandomChatRoomLink();
    if (!href) {
      console.log("Try again");
      return;
    }
    router.push(href);
  };

  return (
    <BannerSectionWrapper id="banner">
      <Container>
        <Row Vcenter={true}>
          <Col sm={12} sm={7}>
            <SectionTitle
              className="section-title"
              leftAlign={true}
              UniWidth="100%"
            >
              <h4>
                <span> Free </span> access to meetings with up to 100
                participants at the same time
              </h4>
              <h1>
                <span>All0e</span>
                <div>high-quality secure videoconferencing server</div>
              </h1>
            </SectionTitle>
            <p>
              Make video call easy and secure with simplest peer-to-peer
              communicator All0e. Easy collaboration, low latency delivery, and
              secured multi-user voice and video calls. WebRTC (Web Real Time
              Communication) used by All0e - currently the biggest driver behind
              telecom innovation.
            </p>

            <VintageBox right={true} vintageOne={true}>
              <Button className="banner-btn one" onClick={onGenerateRoom}>
                Generate room
              </Button>
              <Button className="banner-btn two" secondary>
                <FaPlay className="icon-left" /> Watch guide
              </Button>
            </VintageBox>
          </Col>

          <Col sm={12} sm={5}>
            <div className="app-screen-image-wrapper">
              <img src={AppScreenImage} alt="appion app screen" />
              <div className="thumb one">
                <img src={AppScreenThumb1} alt="appion app screen" />
              </div>
              <div className="thumb two">
                <img src={AppScreenThumb2} alt="appion app screen" />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </BannerSectionWrapper>
  );
};

export default BannerClassic;
