import React from "react";
import constants from "../constants";
import axios from "axios";
import socketIOClient from "socket.io-client";
const socket = socketIOClient(constants.socket_url);
export const Context = React.createContext();
export class Provider extends React.Component {
  state = {
    smallSidebar: false,
    selected_step: {},
    selected_step_screenshot: {},
    selected_step_sendkey: "",
    mobile_platform: "",
    mobile_capabilities: [],
    connected_agent: [],
  };

  async componentDidMount() {
    if (!sessionStorage.getItem("publicIP")) {
      const deviceIp = await axios.get("https://api.ipify.org/?format=json");
      sessionStorage.setItem("publicIP", deviceIp.data.ip);
    }
    const connected_agent = this.state.connected_agent;
    let delete_agent;
    socket.on(`connected_desktop_agent_${sessionStorage.getItem("publicIP")}`, (data) => {
      clearTimeout(delete_agent);
      if (connected_agent.length == 0) {
        connected_agent.push({ os: data.os, ip: data.ip, status: data.status });
      }
      this.setState({ connected_agent }, () => {
        delete_agent = setTimeout(() => this.setState({ connected_agent: [] }), 4000);
      });
    });
  }

  setStepData = (selected_step) => {
    this.setState({ selected_step });
  };

  setStepScreenshot = (selected_step_screenshot) => {
    this.setState({ selected_step_screenshot });
  };

  toggel = () => {
    this.setState({ smallSidebar: !this.state.smallSidebar });
  };

  setStepSendkey = (selected_step_sendkey) => {
    this.setState({ selected_step_sendkey });
  };

  setMobilePlatform = (mobile_platform) => {
    this.setState({ mobile_platform });
    if (mobile_platform == "IOS") {
      this.setState({
        mobile_capabilities: `{
  "platformName":"IOS",
  "platformVersion":"<- Go to Setting > General > About ->",
  "deviceName":"<- Go to Setting > General > About ->",
  "app":"/path/to/your.app",
  "automationName":"XCUITest",
  "newCommandTimeout":100000
}`,
      });
    } else if (mobile_platform == "Android") {
      this.setState({
        mobile_capabilities: `{
  "platformName":"Android",
  "platformVersion":"<- Go to Setting > About Phone ->",
  "deviceName":"<- Go to Setting > About Phone ->",
  "appPackage":"<- APP PACKAGE NAME ->",
  "appActivity":"<- APP ACTIVITY NAME ->",
  "automationName":"UiAutomator2",
  "newCommandTimeout":100000
}`,
      });
    }
  };

  setCapabilities = (mobile_capabilities) => {
    this.setState({ mobile_capabilities });
  };

  setAgent = (connected_agent) => {
    this.setState({ connected_agent });
  };

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          toggelSidebar: this.toggel,
          setStepData: this.setStepData,
          setStepScreenshot: this.setStepScreenshot,
          setStepSendkey: this.setStepSendkey,
          setMobilePlatform: this.setMobilePlatform,
          setCapabilities: this.setCapabilities,
          setAgent: this.setAgent,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}
