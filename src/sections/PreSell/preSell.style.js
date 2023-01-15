import styled from "styled-components";
import preSellBg from "assets/images/crypto/pre-sell/presell-bg.png";
const AboutSectionWrapper = styled.div`
  padding: 120px 0 100px 0;
  position: relative;
  overflow: hidden;
  background: url(${preSellBg});
  background-repeat: no-repeat;
  background-size: contain;

  .about-thumb {
    width: 100%;
    transform: translateX(-80px);
    display: inline-block;
  }
  .about-text.text-one {
    font-weight: 300;
    margin-bottom: 28px;
  }

  .about-text.text-two {
    color: ${(props) => props.theme.headingColor};
    font-weight: 400;
    margin-bottom: 80px;
  }
  .section-title {
    h2 {
      margin-bottom: 38px;
    }
  }

  .pre-sell__counter {
    display: flex;

    .counter__item + .counter__item {
      margin-left: 15px;
    }

    .counter__item {
      height: 115px;
      width: 115px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      background: ${(props) => props.theme.primaryColor};

      h4 {
        font-size: 23px;
      }
    }
  }

  .coin__sell__progessbar {
    position: relative;
    display: flex;
    width: 90%;
    height: 20px;
    border-radius: 30px;
    margin-top: 50px;
    background: ${(props) => props.theme.white};

    .coin__sold {
      position: relative;
      width: 65%;
      height: 20px;
      border-radius: 30px;
      background: rgb(71, 48, 135);
      background: linear-gradient(
        90deg,
        rgba(71, 48, 135, 1) 0%,
        rgba(115, 52, 205, 1) 100%
      );
      z-index: 1;
    }
    span {
      position: absolute;
      right: 0;
      bottom: -34px;
      line-height: 1;
    }
  }

  @media only screen and (max-width: 912px) {
    padding: 100px 0 60px 0;
    .section-title h2 {
      margin-bottom: 20px;
    }
    .about-text.text-two {
      margin-bottom: 30px;
    }

    .coin__sell__progessbar {
      width: 100%;
    }
  }
  @media only screen and (max-width: 760px) {
    padding: 60px 0 60px 0;
    .about-thumb {
      margin-bottom: 70px;
    }

    .pre-sell__counter {
      flex-wrap: wrap;
      row-gap: 15px;
      column-gap: 15px;
      .counter__item + .counter__item {
        margin: 0;
      }
    }
  }
  @media only screen and (max-width: 568px) {
    background-size: 50%;
    .section-title,
    .about-content-wrap {
      text-align: center;
    }
    .section-title {
      img {
        display: none;
      }
      h4 {
        width: 100%;
      }
    }

    .about-content-wrap {
      margin-top: 80px;
    }
  }
  @media only screen and (max-width: 480px) {
    padding: 40px 0 60px 0;

    .pre-sell__counter {
      justify-content: space-between;
      .counter__item {
        width: 48%;
      }
    }
  }
  @media only screen and (max-width: 480px) {
    padding: 40px 0 60px 0;

    .pre-sell__counter { 
      row-gap: 20px;
      .counter__item {
        width: 47%;
      }
    }
  }
`;
export default AboutSectionWrapper;
