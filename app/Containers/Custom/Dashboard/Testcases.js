import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/Testcases.scss";
import { Link } from "react-router-dom";
import AddTestcaseModal from "../../../Components/AddTestcaseModal";
import ManageFeaturesModal from "../../../Components/ManageFeaturesModal";
import constants from "../../../constants";
import axios from "axios";
import { Context } from "../../Context";
import Loader from "../../../Components/Loader";
import { Table } from "antd";
import { Alert, Tooltip, Whisper } from "rsuite";
import DeletePopupModal from "../../../Components/DeletePopupModal";

export default class Testcases extends React.Component {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {
      all_features: [],
      raw_response: {},
      searchText: "",
      testcasesData: {},
      endpointsCount: 0,
      features: [],
      featureId: "",
      addSwaggerModal: false,
      addTestcaseModal: false,
      manageFeaturesModal: false,
      loader: false,
      selectedTestcases: "all",
      modalTestcaseType: "ui",
      caseId: "", // for delete
      deleteConfirmation: false, // for delete
    };
  }
  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      window.scrollTo(0, 0);
      this.loadTestcasesData();
      this.loadEndpointpacks();
    } else {
      this.props.history.push("/login");
    }
  }

  loadTestcasesData = () => {
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
          id:"${window.location.pathname.split("/")[2]}"})
          {testcases{id,name,type,description,conflict
            feature{id,name},
              testcasecomponents{
                id,
                objectrepository{id,url}}}}

                features {
                  id
                  name
                  testcases {
                    id
                    application {
                      id
                    }
                  }
                }
              
              }`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        const testcasesData = {};
        const all_features = [];

        this.setState({ features: [], featureId: "" });
        for (const feature of response.data.features) {
          all_features.push({
            name: feature.name,
            id: feature.id,
            total: feature.testcases.length,
          });
        }

        for (const data of response.data.applications[0].testcases) {
          if (data.feature) {
            testcasesData[data.feature.id] = {
              feature_name: data.feature.name,
              testcases: {
                ui: [],
                api: [],
                mobile: [],
                all: [],
              },
            };
          }
        }

        if (Object.keys(testcasesData).length > 0) {
          if (!this.state.featureId) {
            this.setState({
              raw_response: response.data.applications[0].testcases,
              featureId: Object.keys(testcasesData)[0],
            });
          }
        }
        if (response.data.applications[0].testcases.length !== 0) {
          for (const data of response.data.applications[0].testcases) {
            // get open_url
            let sorted_testcasecomponents = [];
            if (data.testcasecomponents.length !== 0) {
              sorted_testcasecomponents = data.testcasecomponents.sort((a, b) =>
                Number(a.id) > Number(b.id) ? 1 : Number(b.id) > Number(a.id) ? -1 : 0
              );
            }

            if (data.feature) {
              if (data.type === "ui") {
                testcasesData[data.feature.id].testcases.ui.push({
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  // url: data.testcasecomponents.length !== 0 ? (data.testcasecomponents[0].objectrepository ? data.testcasecomponents[0].objectrepository.url : "----------") : "----------",
                  url: sorted_testcasecomponents.length !== 0 ? sorted_testcasecomponents[0].objectrepository.url : "----------",
                  type: data.type,
                  conflict: data.conflict,
                });
              } else if (data.type === "api") {
                testcasesData[data.feature.id].testcases.api.push({
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  url: "----------",
                  type: data.type,
                  conflict: data.conflict,
                });
              } else if (data.type === "mobile") {
                testcasesData[data.feature.id].testcases.mobile.push({
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  url: "----------",
                  type: data.type,
                  conflict: data.conflict,
                });
              }

              testcasesData[data.feature.id].testcases.all.push({
                id: data.id,
                name: data.name,
                description: data.description,
                url:
                  data.testcasecomponents.length !== 0
                    ? data.testcasecomponents[0].objectrepository
                      ? data.testcasecomponents[0].objectrepository.url
                      : "----------"
                    : "----------",
                // url: sorted_testcasecomponents.length !== 0 ? sorted_testcasecomponents[0].objectrepository.url : "----------",
                type: data.type,
                conflict: data.conflict,
              });
            }
          }
        }

        this.setState(
          {
            loader: false,
            deleteConfirmation: false,
            testcasesData,
            all_features,
          },
          () => {
            for (const key in this.state.testcasesData) {
              this.state.features.push({
                id: key,
                name: this.state.testcasesData[key].feature_name,
              });
            }
          }
        );
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  loadEndpointpacks = () => {
    axios
      .get(constants.endpointpacks + `/count?application.id=${window.location.pathname.split("/")[2]}`)
      .then((response) => {
        this.setState({ endpointsCount: response.data });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  selectedTestcasesAction = (Selected) => {
    let selectedTestcases = this.state.selectedTestcases;
    if (Selected === "all") {
      selectedTestcases = "all";
    } else if (Selected === "ui") {
      selectedTestcases = "ui";
    } else if (Selected === "mobile") {
      selectedTestcases = "mobile";
    } else if (Selected === "api") {
      selectedTestcases = "api";
    }
    this.setState({ selectedTestcases: selectedTestcases });
  };

  loadFeatures = () => {
    const features = [];
    for (const key in this.state.testcasesData) {
      features.push({
        id: key,
        name: this.state.testcasesData[key].feature_name,
        count: this.state.testcasesData[key].testcases.all.length,
      });
    }
    return features.map((data, index) => {
      return (
        <div
          className="feature-item-container animated zoomIn faster"
          key={index}
          onClick={() => this.setState({ featureId: data.id })}
          style={this.state.featureId === data.id ? { backgroundImage: "linear-gradient(90deg, #6D15B9, #8152EA)" } : {}}
        >
          <div className="item-name" style={this.state.featureId === data.id ? { color: "#ffffff" } : {}}>
            {data.name}
          </div>
          <div className="item-count" style={this.state.featureId === data.id ? { background: "#ffffff" } : {}}>
            {data.count}
          </div>
        </div>
      );
    });
  };

  delete = () => {
    this.setState({ loader: true });
    fetch(`${constants.testcases}/${this.state.caseId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((response) => {
        this.loadTestcasesData();
        this.setState({
          loader: false,
          deleteConfirmation: false,
          caseId: "",
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  // based on the type, redirect to page
  redirectPage = (type, id) => {
    if (type === "ui") {
      this.props.parentData.history.push({
        pathname: `test-cases/steps/${id}`,
        parentData: this.props,
      });
    } else if (type === "api") {
      this.props.parentData.history.push({
        pathname: `test-cases/layout/${id}`,
        parentData: this.props,
      });
    } else {
      const { state } = this.context;
      if (state.connected_agent.length == 0) return Alert.warning("Desktop agent is not connected.");
      this.props.parentData.history.push({
        pathname: `test-cases/mobile-recorder/${id}`,
        parentData: this.props,
      });
    }
  };

  render() {
    let filteredData = [];
    if (this.state.testcasesData[this.state.featureId]) {
      const tableData = this.state.testcasesData[this.state.featureId].testcases[this.state.selectedTestcases];
      if (this.state.searchText.trim().length > 0) {
        for (const data of tableData) {
          if (data.name.includes(this.state.searchText)) {
            filteredData.push(data);
          }
        }
      } else {
        filteredData = tableData;
      }
    }
    const columns = [
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        className: "table-first-column",
        render: (type, data) => (
          <Whisper
            placement="top"
            trigger="hover"
            speaker={
              <Tooltip>
                {type === "ui" ? "UI" : type === "api" ? (data.conflict ? "Conflicted API" : "API") : type === "mobile" ? "MOBILE" : "Unknown"}
              </Tooltip>
            }
          >
            <i
              className={"fa " + (type === "ui" ? "fa-desktop" : type === "api" ? (data.conflict ? "fa-rocket conflict" : "fa-rocket") : "fa-mobile")}
            />
          </Whisper>
        ),
      },
      {
        sorter: true,
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        sorter: true,
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => a.description.localeCompare(b.description),
      },
      {
        sorter: true,
        title: "Url",
        dataIndex: "url",
        key: "url",
        sorter: (a, b) => a.url.localeCompare(b.url),
      },
      {
        title: "Action",
        dataIndex: "id",
        key: "x",
        render: (id, data) => (
          <div className="table-action-btn-container">
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>{["ui", "mobile"].includes(data.type) ? "Show Steps" : "Layout"}</Tooltip>}>
              <div className="table-action-btn" onClick={() => this.redirectPage(data.type, id)}>
                <i className={"fa " + (["ui", "mobile"].includes(data.type) ? "fa-eye" : "fa-pie-chart")} />
              </div>
            </Whisper>
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>}>
              <div
                className="table-action-btn"
                onClick={() => {
                  this.setState({ caseId: id, deleteConfirmation: true });
                }}
              >
                <i className="fa fa-trash" />
              </div>
            </Whisper>
          </div>
        ),
      },
    ];
    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">{this.props.applicationName ? ">" : ""}</div>
              <div className="breadcrumbs-items">{this.props.applicationName ? this.props.applicationName : ""}</div>
            </div>
            <div className="filter-panel-right-part">
              <div onClick={() => this.setState({ manageFeaturesModal: true })} className="negative-button">
                <i className="fa fa-gear" />
                Manage
              </div>
              <div onClick={() => this.setState({ addTestcaseModal: true })} className="positive-button">
                <i className="fa fa-plus" />
                Add New
              </div>
            </div>
          </div>
          <div className="testcases-body">
            <div className="left-part">
              <div className="testcase-title">
                Features
                {/* <i
                  onClick={() => this.setState({ manageFeaturesModal: true })}
                  className="fa fa-gear"
                /> */}
              </div>
              <div className="testcases-side-panel">{this.loadFeatures()}</div>
            </div>
            <div className="right-part">
              <div className="testcase-filter">
                <div className="testcase-buttons-menu">
                  <div
                    onClick={() => this.selectedTestcasesAction("all")}
                    className={"testcase-buttons-menu-items " + (this.state.selectedTestcases === "all" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    ALL Testcases
                  </div>
                  <div
                    onClick={() => this.selectedTestcasesAction("ui")}
                    className={"testcase-buttons-menu-items " + (this.state.selectedTestcases === "ui" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    UI
                  </div>
                  <div
                    onClick={() => this.selectedTestcasesAction("api")}
                    className={"testcase-buttons-menu-items " + (this.state.selectedTestcases === "api" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    API
                  </div>
                  <div
                    onClick={() => this.selectedTestcasesAction("mobile")}
                    className={
                      "testcase-buttons-menu-items " + (this.state.selectedTestcases === "mobile" ? "testcase-buttons-menu-items-active" : "")
                    }
                  >
                    Mobile
                  </div>
                </div>
                <div className="testcase-filter-panel-search-container">
                  <div className="testcase-filter-panel-search-btn">
                    <i className="fa fa-search" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search testcases here"
                    name="search"
                    value={this.state.searchText}
                    onChange={(e) => this.setState({ searchText: e.target.value })}
                  />
                </div>
              </div>
              <div className="testcases-table">
                <Table
                  className="testcases-table"
                  dataSource={filteredData}
                  columns={columns}
                  pagination={{
                    pageSize: document.getElementsByClassName("ant-table-wrapper")[0]
                      ? Math.ceil(document.getElementsByClassName("ant-table-wrapper")[0].offsetHeight / 40 - 4)
                      : 10,
                  }}
                  rowKey="id"
                />
              </div>
            </div>
          </div>
        </div>
        <AddTestcaseModal
          loadTestcasesData={this.loadTestcasesData}
          modalTestcaseType={this.state.modalTestcaseType}
          modalTestcaseSelected={(e) => this.setState({ modalTestcaseType: e })}
          addTestcaseModal={this.state.addTestcaseModal}
          features={this.state.features}
          featureId={this.state.features.find((o) => o.id === this.state.featureId)}
          parentData={this.props.parentData}
          onHide={() => this.setState({ addTestcaseModal: false, modalTestcaseType: "ui" })}
        />
        <ManageFeaturesModal
          features={this.state.all_features}
          loadAgain={(e) => this.loadTestcasesData()}
          manageFeaturesModal={this.state.manageFeaturesModal}
          raw_data={this.state.raw_response}
          onHide={() => this.setState({ manageFeaturesModal: false })}
        />
        <DeletePopupModal
          deleteConfirmation={this.state.deleteConfirmation}
          onHide={() => this.setState({ deleteConfirmation: false, caseId: "" })}
          delete={this.delete}
        />
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
