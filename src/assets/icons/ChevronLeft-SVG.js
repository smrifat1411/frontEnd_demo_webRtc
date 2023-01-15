export default function ChevronLeftSVG({
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
      <path d="M28.05 36 16 23.95 28.05 11.9l2.15 2.15-9.9 9.9 9.9 9.9Z"/>
    </svg>
  );
}
