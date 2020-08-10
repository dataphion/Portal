import React from "react";
import "../Assets/Styles/Custom/Header.scss";
import { Link } from "react-router-dom";
import { Whisper, Tooltip, Alert } from "rsuite";
import constants from "../constants";

export default class DashboardSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: [],
      profileContainer: false,
      activeMenu: ""
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
    } else if (window.location.pathname.split("/")[3] === "settings") {
      this.setState({ activeMenu: "settings" });
    }
  }

  Tooltip = tooltip => {
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
        <div className="dashboard-sidebar-container animated fadeIn fast">
          <div className="dashboard-header-logo-container flex between">
            <Link to="/" className="dashboard-header-logo" />
            <div className="dashboard-header-name-version-container">
              <div className="dashboard-header-version">v 1.0</div>
            </div>
          </div>
          <div className="dashboard-sidebar-menu">
            <Link
              to={`/${pathname[1]}/${pathname[2]}`}
              onClick={() => this.setState({ activeMenu: "dashboard" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "dashboard" ? { color: 'white', color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-tachometer" />
              Dashboard
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/test-suites`}
              onClick={() => this.setState({ activeMenu: "testSuites" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "testSuites" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-th-large" />
              Test Suites
            </Link>
            <Link
              id="testcases-sidebar"
              to={`/${pathname[1]}/${pathname[2]}/test-cases`}
              onClick={() => this.setState({ activeMenu: "testCases" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "testCases" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-cubes" />
              Test Cases
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/object-repository`}
              onClick={() => this.setState({ activeMenu: "objectRepository" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "objectRepository" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-folder-open" />
              Object Repository
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/data-sources`}
              onClick={() => this.setState({ activeMenu: "dataSources" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "dataSources" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-database" />
              Data Platforms
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/reports`}
              onClick={() => this.setState({ activeMenu: "reports" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "reports" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-pie-chart" />
              Reports
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/api-specs`}
              onClick={() => this.setState({ activeMenu: "apiSpecs" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "apiSpecs" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-rocket" />
              Api Specs
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/native-agents`}
              onClick={() => this.setState({ activeMenu: "nativeAgents" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "nativeAgents" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-mobile" />
              Native Agents
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/manage-environments`}
              onClick={() => this.setState({ activeMenu: "manageEnvironments" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "manageEnvironments" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-tasks" />
              Manage Environments
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/relation-graph`}
              onClick={() => this.setState({ activeMenu: "relation-graph" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "relation-graph" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fas fa-sitemap" />
              Relation Graph
            </Link>
            <Link
              to={`/${pathname[1]}/${pathname[2]}/settings`}
              onClick={() => this.setState({ activeMenu: "settings" })}
              className="dashboard-sidebar-menu-item"
              style={this.state.activeMenu === "settings" ? { color: 'white', background: `linear-gradient(90deg, ${constants.HIGHLIGHT_COLOR}, ${constants.HIGHLIGHT_END_COLOR})` } : {}}
            >
              <i className="fa fa-sliders" />
              Settings
            </Link>
          </div>
          <div className="dashboard-sidebar-profile-container">
            <div
              className="header-profile-container"
              onMouseEnter={() => this.setState({ profileContainer: true })}
              onClick={() =>
                this.setState({
                  profileContainer: !this.state.profileContainer
                })
              }
            >
              <img src={sessionStorage.getItem("profile") ? sessionStorage.getItem("profile") : require("../Assets/Images/user.svg")} width="100%" height="100%" />
            </div>
            <div className="dashboard-sidebar-profile-name">{`Hi, ${sessionStorage.getItem("username")}`}</div>
            <Link to="/profile" className="dashboard-sidebar-profile-btn">
              <i className="fa fa-gear" />
            </Link>
          </div>
          <div
            onMouseLeave={e => this.setState({ profileContainer: false })}
            className={"hover-header-profile-container animated fadeIn " + (this.state.profileContainer ? " hidden-hover-header-profile-container" : "")}
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
                <img src={sessionStorage.getItem("profile") ? sessionStorage.getItem("profile") : require("../Assets/Images/user.svg")} width="100%" height="100%" />
              </div>
            </div>
          </div>
        </div>
        <Whisper placement="left" trigger="hover" speaker={this.Tooltip("Report & Issue")}>
          <Link to="/feedback" className="sidenav-bug-container">
            <i className="fa fa-bug" />
          </Link>
        </Whisper>
      </React.Fragment>
    );
  }
}
