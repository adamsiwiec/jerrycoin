
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "./assets/vendor/nucleo/css/nucleo.css";
import "./assets/vendor/font-awesome/css/font-awesome.min.css";
import "./assets/css/argon-design-system-react.css";

import Index from "./views/Index.jsx";
import Landing from "./views/examples/Landing.jsx";
import Login from "./views/examples/Login.jsx";
import Profile from "./views/examples/Profile.jsx";
import Register from "./views/examples/Register.jsx";

import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  timeout: 5000,
  position: positions.BOTTOM_RIGHT
};

ReactDOM.render(
<Provider template={AlertTemplate} {...options}>

<Index/>
  </Provider>,
  document.getElementById("root")
);
