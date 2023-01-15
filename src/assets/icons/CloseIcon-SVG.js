export default function CloseIconSVG({
  height = 32,
  width = 32,
  fill = "gray",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      viewBox="0 0 24 24"
      fill={fill}
    >
      <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.7276 18.8007L19.0004 17.5279L13.223 11.7505L18.8007 6.17279L17.5279 4.9L11.9502 10.4777L6.27245 4.79999L4.99966 6.07277L10.6774 11.7505L4.79999 17.6279L6.07277 18.9007L11.9502 13.0233L17.7276 18.8007Z"
      />    </svg>
  );
}
