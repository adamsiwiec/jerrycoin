
import React from "react";
import ReactDOM from "react-dom";
import { Helmet } from 'react-helmet';

import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/vendor/font-awesome/css/font-awesome.min.css";
import "./assets/css/argon-design-system-react.css";

import Index from "./views/Index.jsx";

import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  timeout: 1500,
  position: positions.BOTTOM_RIGHT
};

ReactDOM.render(
<Provider template={AlertTemplate} {...options}>
<Helmet>
          <title>JerryCoin</title>
        </Helmet>
<Index/>
  </Provider>,
  document.getElementById("root")
);
