import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Container, Row, Col } from "reusecore/Layout";
import SectionTitle from "reusecore/SectionTitle";
import Button from "reusecore/Button";
import VintageBox from "reusecore/VintageBox";

import AboutSectionWrapper from "./preSell.style";

const About = () => {
  const [Days, setDay] = useState(0);
  const [Hours, setHours] = useState(0);
  const [Minutes, setMinutes] = useState(0);
  const [Seconds, setSeconds] = useState(0);

  useEffect(() => {
    const countDownDate = new Date("Jan 5, 2022 15:37:25").getTime();
    setInterval(() => {
      // Get today's date and time
      const now = new Date().getTime();
      // Find the distance between now and the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setDay(days);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);
  }, [Days, Hours, Minutes, Seconds]);

  return (
    <AboutSectionWrapper id="about">
      <Container fullWidthSM>
        <Row Vcenter={true}>
          <Col xs={12} sm={6}>
            <div className="pre-sell__box">
              <div className="pre-sell__counter">
                <div className="counter__item">
                  <h4>{Days}</h4>
                  <span>Days</span>
                </div>
                <div className="counter__item">
                  <h4>{Hours}</h4> <span>Hours</span>
                </div>
                <div className="counter__item">
                  <h4>{Minutes} </h4> <span>Minutes</span>
                </div>
                <div className="counter__item">
                  <h4>{Seconds}</h4> <span>Seconds</span>
                </div>
              </div>

              <div className="coin__sell__progessbar">
                <div className="coin__sold">
                  <span>$11,931</span>
                </div>
                <span>$5,097</span>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} className="about-content-wrap">
            <SectionTitle
              className="section-title"
              leftAlign={true}
              UniWidth="100%"
            >
              <h4> Pre Sell </h4>
              <h2>
                <span> Equity Blockchain</span> The New Coin Pre Sell Campaign.
              </h2>
            </SectionTitle>
            <p className="about-text text-one">
              One differences leaders, management-science so, best treat. Still
              problems upper and anger devoting out. With hiding their boss
              phase drops. A strenuous in ticket get write it by proposal.
            </p>
            {/* <p className="about-text text-two">
              Thought. Road, clearly, and software the shreds sisters contract,
              luxury and fully here
            </p> */}
            <VintageBox right={true} vintageTwo={true} position="relative">
              <Button>Buy Token With 30% off</Button>
            </VintageBox>
          </Col>
        </Row>
      </Container>
    </AboutSectionWrapper>
  );
};

export default About;
