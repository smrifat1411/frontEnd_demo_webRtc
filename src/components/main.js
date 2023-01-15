import React from "react";
import Head from "next/head";
import FavIcon from "@assets/images/favicon.png";

export default function Main({ children, title = "this is the dummy title" }) {
  return (
    <React.Fragment>
      <Head>
        <title>{title}</title>
        <link rel="shortcut icon" type="image/x-icon" href={FavIcon} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="All0e" content="Video meetings" />
        <meta name="theme-color" content="#ec5555" />
        <link
          href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700,800&display=swap%7cSource+Sans+Pro&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Head>
      <main>{children}</main>
    </React.Fragment>
  );
}
