import React, { useState } from "react";

import { FaEnvelope } from "react-icons/fa";

import { Container } from "@reusecore/Layout";
import SectionTitle from "@reusecore/SectionTitle";
import Input from "@reusecore/Input";
import ContactWrapper from "@sections/Contact/contact.style";

const Contact = () => {
  const [input, setInput] = useState("");

  return (
    <ContactWrapper id="contact">
      <SectionTitle className="section-title" UniWidth="55%">
        <h4>Contact Us</h4>
        <h2>
          Contact us <span>for collaboration</span> or <span>any comments</span>{" "}
          you would like to share.
        </h2>
      </SectionTitle>
      <Container>
        <div className="contactform">
          <div className='input-wrap'>
            <Input
                type="text"
                placeholder="Enter your massage"
                value={input}
                onChange={({ target }) => setInput(target.value)}
            />
          </div>
          <div className="button">
            <a
              href={`mailto:hi@web-boxes.com?subject=Questions/request to all0e.com&body=${encodeURIComponent(
                input
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div style={{ display: "flex", "alignItems": "center" }}>
                <div style={{ "margin-right": "8px" }}>Send Now</div>
                <FaEnvelope />
              </div>
            </a>
          </div>
        </div>
      </Container>
    </ContactWrapper>
  );
};

export default Contact;
