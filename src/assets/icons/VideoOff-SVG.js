export default function VideoOffSVG({
  height = 32,
  width = 32,
  fill = "black",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      viewBox="0 0 48 48"
      fill={fill}
    >
      <path d="m44 34.25-8-8v5.55l-3-3V11H15.2l-3-3H33q1.2 0 2.1.9.9.9.9 2.1v10.75l8-8Zm-1.6 12.4L1.95 6.2l2.1-2.1L44.5 44.55ZM24.2 20Zm-4.35 4.1ZM7.95 8l3 3H7v26h26v-3.95l3 3V37q0 1.2-.9 2.1-.9.9-2.1.9H7q-1.2 0-2.1-.9Q4 38.2 4 37V11q0-1.2.9-2.1Q5.8 8 7 8Z" />
    </svg>
  );
}
