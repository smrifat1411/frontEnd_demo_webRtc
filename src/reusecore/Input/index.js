import React from "react";
import StyledInput from "@reusecore/Input/input.style";

const Input = ({
  margin = "0",
  border = "1px solid transparent",
  width,
  ...props
}) => {
  return (
    <StyledInput margin={margin} border={border} width={width} {...props} />
  );
};

export default Input;
