import React, { Fragment } from 'react';

const App =  ({ Component, pageProps }) => {
  return (
    <Fragment> 
      <Component {...pageProps} />
    </Fragment>
  );
};


export default App;
