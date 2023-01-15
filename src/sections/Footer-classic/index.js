import React from "react";
import Link from "next/link";

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

import { Container, Row, Col } from "@reusecore/Layout";
import Particle from "@reusecore/Particle";

import logo from "@assets/images/logoWithName.png";

import FooterBGTwo from "@assets/images/app/footer/footer-particle-two.png";

import FooterWrapper from "./footer.style";

const FooterClassic = ({ withAnimation = true }) => {
  return (
    <FooterWrapper>
      <img src={FooterBGTwo} alt="img" className="section__particle one" />
      {!!withAnimation && <Particle />}
      <Container>
        <Row>
          <Col xs={12} sm={6} lg={3}>
            <div className="footer-widgets first">
              <Link href="/">
                <a className="footer-logo">
                  <img src={logo} alt="logo" height={140} />
                </a>
              </Link>
              <form className="subscribe-form">
                <input type="text" placeholder="Search here..." />
              </form>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            {/*<div className="footer-widgets">*/}
            {/*  <h3 className="widget-title">Download</h3>*/}
            {/*  <ul className="widget-catagory">*/}
            {/*    <li>*/}
            {/*      <Link href="#">*/}
            {/*        <a> Company </a>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <Link href="#">*/}
            {/*        <a> Android App </a>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <Link href="#">*/}
            {/*        <a> ios App </a>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <Link href="#">*/}
            {/*        <a> Desktop </a>*/}
            {/*      </Link>*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</div>*/}
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <div className="footer-widgets">
              <h3 className="widget-title">Help</h3>
              <ul className="widget-catagory">
                <li>
                  <Link href="/faq">
                    <a> FAQ </a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a> Privacy </a>
                  </Link>
                </li>
                <li>
                  <Link href="/reporting">
                    <a> Reporting </a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions">
                    <a> Terms & Conditions </a>
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <div className="footer-widgets">
              <h3 className="widget-title">Follow US</h3>
              <ul className="social">
                <li>
                  <Link href="https://www.facebook.com/webboxescom">
                    <a target="_blank" rel="noopener noreferrer">
                      <FaFacebookF />
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="https://twitter.com/webboxes">
                    <a target="_blank" rel="noopener noreferrer">
                      <FaTwitter />
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/webboxes/">
                    <a target="_blank" rel="noopener noreferrer">
                      <FaInstagram />
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/company/webboxes/mycompany/">
                    <a target="_blank" rel="noopener noreferrer">
                      <FaLinkedinIn />
                    </a>
                  </Link>
                </li>
                {/*<li>*/}
                {/*  <Link href="#">*/}
                {/*    <a>*/}
                {/*      <FaPinterestP />*/}
                {/*    </a>*/}
                {/*  </Link>*/}
                {/*</li>*/}
              </ul>
              <p className="copyright-text">
                Copyright &#169; {new Date().getFullYear()} Design By
                <Link href="https://web-boxes.com/">
                  <a target="_blank"> WebBoxes </a>
                </Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </FooterWrapper>
  );
};

export default FooterClassic;
