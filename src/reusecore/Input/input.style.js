import styled from "styled-components";

const StyledInput = styled.input`
  display: block;
  padding: 15px;
  width: ${({ width }) => width || '100%'};
  min-height: 60px;
  font-size: 16px;
  border-radius: 5px;
  margin: ${({ margin }) => margin};
  box-shadow: none;
  transition: 450ms all;
  border: ${({ border }) => border};
  &:hover,
  &:focus {
    border-color: rgba(251, 123, 129, 1);
  }
`;

export default StyledInput;
