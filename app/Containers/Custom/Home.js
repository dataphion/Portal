import React from "react";
import "../../Assets/Styles/Custom/Home.scss";
import Header from "../../Components/Header";
import { Link } from "react-router-dom";
import constants from "../../constants";
import { Empty } from "antd";
import { Alert } from "rsuite";
import Loader from "../../Components/Loader";
import NewApplicationModal from "../../Components/NewApplicationModal";
import DeletePopupModal from "../../Components/DeletePopupModal";
import axios from "axios";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadApplications: [],
      searchValue: "",
      deleteConfirmation: false,
      applicationId: "",
      applicationName: "",
      applicationUrl: "",
      loader: false,
      applicationModal: false
    };
  }

  componentDidMount() {
    let redirect_path = sessionStorage.getItem("redirect-path");
    if (!!redirect_path) {
      this.props.history.push(redirect_path);
    } else {
      if (sessionStorage.getItem("id")) {
        this.loadApplications();
      } else {
        this.props.history.push("/login");
      }
    }
  }

  loadApplications = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"}}){id,name,url,testcases{id}}}`
      })
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          loader: false,
          loadApplications: response.data.applications
        });
      })
      .catch(error => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  saveApplication = async function(name, url) {
    this.setState({ loader: true });

    try {
      const application_req = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `mutation{createApplication(input:{data:{
            name:"${name}",
            url:"${url}",
            user:"${sessionStorage.getItem("id")}"}
          }){application{id}}}`
        })
      });
      const application_resp = await application_req.json();
      this.setState({ loader: false, applicationModal: false });
      this.loadApplications();
      Alert.success("Application created successfully");

      const createTestSuiteData = {
        suite_name: "default",
        type: "Test Runs",
        application: {
          id: application_resp.data.createApplication.application.id
        }
      };
      const createTestSuite = await axios.post(constants.testsuites, createTestSuiteData);

      const createTestsessionExecutionData = {
        total_test: 0,
        total_fail: 0,
        total_pass: 0,
        testsuite: {
          id: createTestSuite.data.id
        }
      };
      await axios.post(constants.testsessionexecutions, createTestsessionExecutionData);

      const createhealedcomponent = {
        heal_count: 0,
        vision_count: 0,
        application: {
          id: application_resp.data.createApplication.application.id
        }
      };
      await axios.post(constants.healedcomponent, createhealedcomponent);
    } catch (error) {
      Alert.error("Something went wrong");
      console.log(error);
    }
  };

  updateApplication = (name, url) => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `mutation{updateApplication(input:{where:
          {id:"${this.state.applicationId}"},
        data:{name:"${name}",url:"${url}"}}){application{id}}}`
      })
    })
      .then(response => response.json())
      .then(response => {
        this.loadApplications();
        this.setState({
          loader: false,
          applicationModal: false,
          applicationId: "",
          applicationName: "",
          applicationUrl: ""
        });
      })
      .catch(error => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  delete = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query: `mutation{deleteApplication(input:{where:{id:"${this.state.applicationId}"}}){application{id}}}`
      })
    })
      .then(response => response.json())
      .then(response => {
        this.loadApplications();
        this.setState({
          loader: false,
          deleteConfirmation: false,
          applicationId: ""
        });
      })
      .catch(error => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  render() {
    return (
      <div className="main-container animated fadeIn">
        <Header />
        <div className="body-container">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <div className="breadcrumbs-items">Projects</div>
            </div>
            <div className="filter-panel-right-part">
              <div className="filter-panel-search-container">
                <div className="filter-panel-search-btn">
                  <i className="fa fa-search" />
                </div>
                <input autoFocus type="text" placeholder="Search Here" name="search" value={this.state.searchValue} onChange={e => this.setState({ searchValue: e.target.value })} />
              </div>
              <div onClick={() => this.setState({ applicationModal: true })} className="positive-button">
                <i className="fa fa-plus" />
                Create New Project
              </div>
            </div>
          </div>
          <div className="application-title-count-container">
            <div className="application-title">Applications</div>
            <div className="application-divider" />
            <div className="application-count">
              TOTAL
              {this.state.loadApplications ? ` ${this.state.loadApplications.length} ` : " 0 "}
              Projects
            </div>
          </div>
          <div className="container-fluid" style={{ padding: "30px 30px 0 30px" }}>
            <div className="row">
              {this.state.loadApplications.length > 0 ? (
                this.state.loadApplications.map((details, index) => {
                  if (details.name.toLowerCase().includes(this.state.searchValue.toLowerCase())) {
                    return (
                      <div key={index} className="col-md-4 col-lg-3 animated zoomIn faster">
                        <div className="application-container">
                          <Link to={`dashboard/${details.id}`} className="application-container-header">
                            <div className="application-header-container-title">{details.name}</div>
                            <div className="application-header-container-url">{details.url}</div>
                            <div className="application-footer-container">
                              <div className="application-footer-container-tc-count">{`${details.testcases.length} `} TEST CASES</div>
                            </div>
                          </Link>
                          <div
                            className="application-container-edit-btn"
                            onClick={() =>
                              this.setState({
                                applicationModal: true,
                                applicationId: details.id,
                                applicationName: details.name,
                                applicationUrl: details.url
                              })
                            }
                          >
                            <i className="fa fa-pencil" />
                          </div>
                          <div
                            className="application-container-delete-btn"
                            onClick={() =>
                              this.setState({
                                deleteConfirmation: true,
                                applicationId: details.id
                              })
                            }
                          >
                            <i className="fa fa-trash" />
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
              ) : (
                <Empty style={{ margin: "auto" }} />
              )}
            </div>
          </div>
        </div>
        <NewApplicationModal
          NewApplicationModal={this.state.applicationModal}
          applicationId={this.state.applicationId}
          applicationName={this.state.applicationName}
          applicationUrl={this.state.applicationUrl}
          onHide={() =>
            this.setState({
              applicationModal: false,
              applicationId: "",
              applicationName: "",
              applicationUrl: ""
            })
          }
          saveApplication={(name, url) => this.saveApplication(name, url)}
          updateApplication={(name, url) => this.updateApplication(name, url)}
        />
        <DeletePopupModal deleteConfirmation={this.state.deleteConfirmation} onHide={() => this.setState({ deleteConfirmation: false, applicationId: "" })} delete={this.delete} />
        <Loader status={this.state.loader} />
      </div>
    );
  }
}
