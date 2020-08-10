import React from "react";
import "../../Assets/Styles/Custom/Maindash.scss";
import Header from "../../Components/Header";
import DashboardSidebar from "../../Components/DashboardSidebar";
import Loader from "../../Components/Loader";
import constants from "../../constants";
import Dashboard from "../Custom/Dashboard/Dashboard";
import Testsuites from "../Custom/Dashboard/Testsuites";
import Testcases from "../Custom/Dashboard/Testcases";
import DataSources from "../Custom/Dashboard/DataSources";
import ObjectRepository from "../Custom/Dashboard/ObjectRepository";
import Reports from "../Custom/Dashboard/Reports";
import ApiSpecs from "../Custom/Dashboard/ApiSpecs";
import ManageEnvironments from "../Custom/Dashboard/ManageEnvironments";
import NativeAgents from "../Custom/Dashboard/NativeAgents";
import RelationGraph from "../Custom/Dashboard/RelationGraph";
import Settings from "../Custom/Dashboard/Settings";
import { Alert } from "rsuite";
import { Context } from "../Context";

export default class Maindash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      applicationName: "",
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      this.loadApplicationName();
    } else {
      this.props.history.push("/login");
    }
  }

  loadApplicationName = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{applications(where:
          {user:{id:"${sessionStorage.getItem("id")}"},
          id:"${this.props.location.pathname.split("/")[2]}"}){name}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          loader: false,
          applicationName: response.data.applications[0].name,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  loadSidebarComponent = () => {
    if (!window.location.pathname.split("/")[3]) {
      return <Dashboard applicationName={this.state.applicationName} />;
    } else if (window.location.pathname.split("/")[3] === "test-suites") {
      return <Testsuites applicationName={this.state.applicationName} parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "test-cases") {
      return <Testcases applicationName={this.state.applicationName} parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "object-repository") {
      return <ObjectRepository />;
    } else if (window.location.pathname.split("/")[3] === "data-sources") {
      return <DataSources applicationName={this.state.applicationName} parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "reports") {
      return <Reports parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "api-specs") {
      return <ApiSpecs parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "manage-environments") {
      return <ManageEnvironments parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "native-agents") {
      return <NativeAgents parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "relation-graph") {
      return <RelationGraph parentData={this.props} />;
    } else if (window.location.pathname.split("/")[3] === "settings") {
      return <Settings parentData={this.props} />;
    }
  };

  render() {
    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            <div className="main-container animated fadeIn">
              {context.state.smallSidebar ? <Header /> : <DashboardSidebar />}
              {this.loadSidebarComponent()}
              <div
                onClick={context.toggelSidebar}
                style={context.state.smallSidebar ? { left: "56px" } : {}}
                className="dashboard-sidebar-select-button"
              >
                <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
              </div>
            </div>
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
