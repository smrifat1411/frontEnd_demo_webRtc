import styled from "styled-components";

const ContactWrapper = styled.div`
  padding: 100px 0 200px 0;
  overflow: hidden;
  align-items: center;
  .contactform {
    text-align: center;
    text-align: center;
    background: #fbfbfb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100px;
    border-radius: 10px;
  }
  .input-wrap{
    width: 80%;
  }
  .button {
    padding: 10px 20px;
    border-radius: 5px;
    transition: 450ms all;
    background: #ffebec;
    color: #fb7b81;
    font-size: 16px;
    height: 58px;
    &:hover {
      background: #fb7b81;
      color: #fff;
    }
  }
  .section-title {
    h2 {
      margin-bottom: 55px;
    }
  }
  @media only screen and (max-width: 912px) {
    padding: 0px 0 80px 0;
    form {
      padding: 50px;
      .input-wrap {
        width: 70%;
      }
    }
  }
  @media only screen and (max-width: 568px) {
    form {
      padding: 30px;
      display: block;
      .input-wrap {
        width: 100%;
        margin-bottom: 30px;
      }
    }
  }
  @media only screen and (max-width: 480px) {
    form {
      padding: 30px 15px;
      .input-wrap {
        width: 100%;
      }
    }
  }
`;

export default ContactWrapper;
