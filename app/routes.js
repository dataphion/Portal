import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "./Containers/Custom/Home";
import Register from "./Containers/Custom/Register";
import Login from "./Containers/Custom/Login";
import RegisterSuccess from "./Containers/Custom/RegisterSuccess";
import Feedback from "./Containers/Custom/Feedback";
import Profile from "./Containers/Custom/Profile";
import Maindash from "./Containers/Custom/Maindash";
import TestcaseSteps from "./Containers/Custom/Dashboard/TestcaseSteps";
import MobileTestcaseSteps from "./Containers/Custom/Dashboard/MobileTestcaseSteps";
import TestcaseApi from "./Containers/Custom/Dashboard/TestcaseApi";
import ReportsSteps from "./Containers/Custom/Dashboard/ReportsSteps_n";
import DataSourcesQuerys from "./Containers/Custom/Dashboard/DataSourcesQuerys";
import AddTestsuites from "./Containers/Custom/Dashboard/AddTestsuites";
import ReportsErrorLog from "./Containers/Custom/Dashboard/ReportsErrorLog";
import EmailConfiguration from "./Containers/Custom/Dashboard/EmailConfiguration";
import SeleniumConfiguration from "./Containers/Custom/Dashboard/SeleniumConfiguration";
import MobileRecorder from "./Containers/Custom/Dashboard/mobileRecorder";

export default (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
    <Route exact path="/register-successful" component={RegisterSuccess} />
    <Route exact path="/feedback" component={Feedback} />
    <Route exact path="/profile" component={Profile} />
    <Route exact path="/dashboard/:id" component={Maindash} />
    <Route exact path="/dashboard/:id/:id" component={Maindash} />
    <Route exact path="/dashboard/:id/:id/steps/:id" component={TestcaseSteps} />
    <Route exact path="/dashboard/:id/:id/mobile-recorder/:id" component={MobileRecorder} />
    <Route exact path="/dashboard/:id/:id/mobile_steps/:id" component={MobileTestcaseSteps} />
    <Route exact path="/dashboard/:id/reports/reportSteps/:id/:id" component={ReportsSteps} />
    <Route exact path="/dashboard/:id/reports/reportSteps/:id/:id/logs" component={ReportsErrorLog} />
    <Route exact path="/dashboard/:id/settings/configuration" component={EmailConfiguration} />
    <Route exact path="/dashboard/:id/settings/selenium-configuration" component={SeleniumConfiguration} />
    <Route exact path="/dashboard/:id/:id/layout/:id" component={TestcaseApi} />
    <Route exact path="/dashboard/:id/:id/query/:id" component={DataSourcesQuerys} />
    <Route exact path="/dashboard/:id/:id/add-testsuite" component={AddTestsuites} />
    <Route exact path="/dashboard/:id/:id/update/:id" component={AddTestsuites} />
    <Redirect to="/login" />
  </Switch>
);
