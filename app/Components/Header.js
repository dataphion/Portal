import React from "react";
import "../Assets/Styles/Custom/Header.scss";
import { Link } from "react-router-dom";
import { Sidenav, Whisper, Tooltip, Alert } from "rsuite";
import constants from "../constants";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: [],
      profileContainer: false,
      activeMenu: "",
    };
  }

  componentDidMount() {
    if (!window.location.pathname.split("/")[3]) {
      this.setState({ activeMenu: "dashboard" });
    } else if (window.location.pathname.split("/")[3] === "test-suites") {
      this.setState({ activeMenu: "testSuites" });
    } else if (window.location.pathname.split("/")[3] === "test-cases") {
      this.setState({ activeMenu: "testCases" });
    } else if (window.location.pathname.split("/")[3] === "object-repository") {
      this.setState({ activeMenu: "objectRepository" });
    } else if (window.location.pathname.split("/")[3] === "data-sources") {
      this.setState({ activeMenu: "dataSources" });
    } else if (window.location.pathname.split("/")[3] === "reports") {
      this.setState({ activeMenu: "reports" });
    } else if (window.location.pathname.split("/")[3] === "api-specs") {
      this.setState({ activeMenu: "apiSpecs" });
    } else if (window.location.pathname.split("/")[3] === "manage-environments") {
      this.setState({ activeMenu: "manageEnvironments" });
    } else if (window.location.pathname.split("/")[3] === "native-agents") {
      this.setState({ activeMenu: "nativeAgents" });
    } else if (window.location.pathname.split("/")[3] === "relation-graph") {
      this.setState({ activeMenu: "relation-graph" });
    }
  }

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  logout = () => {
    sessionStorage.clear();
    Alert.success("Logout successfully, Goodbye!", 5000);
  };

  render() {
    const pathname = window.location.pathname.split("/");
    return (
      <React.Fragment>
        <Sidenav appearance="inverse" expanded={false} className="animated fadeIn fast">
          <Sidenav.Body>
            <div className="logo-container">
              <Link to="/" className="sidebar-logo" />
              <div className="header-version">v 1.0</div>
            </div>
            {window.location.pathname.split("/")[1] === "dashboard" ? (
              <div className="header-sidebar-menu">
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Dashboard")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}`}
                    onClick={() => this.setState({ activeMenu: "dashboard" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "dashboard" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-tachometer" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Test Suites")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/test-suites`}
                    onClick={() => this.setState({ activeMenu: "testSuites" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "testSuites" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-th-large" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Test Cases")}>
                  <Link
                    id="testcases-sidebar"
                    to={`/${pathname[1]}/${pathname[2]}/test-cases`}
                    onClick={() => this.setState({ activeMenu: "testCases" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "testCases" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-cubes" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Object Repository")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/object-repository`}
                    onClick={() => this.setState({ activeMenu: "objectRepository" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "objectRepository" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-folder-open" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Data Platforms")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/data-sources`}
                    onClick={() => this.setState({ activeMenu: "dataSources" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "dataSources" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-database" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Reports")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/reports`}
                    onClick={() => this.setState({ activeMenu: "reports" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "reports" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-pie-chart" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Api Specs")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/api-specs`}
                    onClick={() => this.setState({ activeMenu: "apiSpecs" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "apiSpecs" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-rocket" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Native Agent")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/native-agents`}
                    onClick={() => this.setState({ activeMenu: "nativeAgents" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "nativeAgents" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-mobile" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Manage Environments")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/manage-environments`}
                    onClick={() => this.setState({ activeMenu: "manageEnvironments" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "manageEnvironments" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fa fa-tasks" />
                  </Link>
                </Whisper>
                <Whisper placement="right" trigger="hover" speaker={this.Tooltip("Relation Graph")}>
                  <Link
                    to={`/${pathname[1]}/${pathname[2]}/relation-graph`}
                    onClick={() => this.setState({ activeMenu: "relation-graph" })}
                    className="header-sidebar-menu-item"
                    style={this.state.activeMenu === "relation-graph" ? { background: `${constants.HIGHLIGHT_COLOR}` } : {opacity: 0.75}}
                  >
                    <i className="fas fa-sitemap" />
                  </Link>
                </Whisper>
              </div>
            ) : (
              ""
            )}
            <div
              className="header-profile-container"
              onMouseEnter={() => this.setState({ profileContainer: true })}
              onClick={() =>
                this.setState({
                  profileContainer: !this.state.profileContainer,
                })
              }
            >
              <img
                src={
                  sessionStorage.getItem("profile")
                    ? sessionStorage.getItem("profile")
                    : require("../Assets/Images/user.svg")
                }
                width="100%"
                height="100%"
              />
            </div>
            <div
              onMouseLeave={() => this.setState({ profileContainer: false })}
              className={
                "hover-header-profile-container animated fadeIn " + (this.state.profileContainer ? " hidden-hover-header-profile-container" : "")
              }
            >
              <div className="hover-header-profile-body">
                <Link to="/profile" className="hover-header-profile-body-row">
                  My Profile
                </Link>
                <Link to="/login" onClick={() => this.logout()} className="hover-header-profile-body-row">
                  Logout
                </Link>
              </div>
              <div className="header-border" />
              <div className="hover-header-profile-header">
                <div className="hover-header-profile-header-name">{`Hi, ${sessionStorage.getItem("username")}`}</div>
                <div className="hover-header-profile-header-profile">
                  <img
                    src={
                      sessionStorage.getItem("profile")
                        ? sessionStorage.getItem("profile")
                        : "http://www.haverhill-ps.org/wp-content/uploads/sites/12/2013/11/user.png"
                    }
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </Sidenav.Body>
        </Sidenav>
        <Whisper placement="left" trigger="hover" speaker={this.Tooltip("Report & Issue")}>
          <Link to="/feedback" className="sidenav-bug-container">
            <i className="fa fa-bug" />
          </Link>
        </Whisper>
      </React.Fragment>
    );
  }
}
