import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/Testcases.scss";
import { Link } from "react-router-dom";
import constants from "../../../constants";
import axios from "axios";
import Loader from "../../../Components/Loader";
import { Table, Form } from "antd";
import { Alert, Tooltip, Whisper, Modal } from "rsuite";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import SuiteNotify from "../../../Components/SuiteNotify";

const Testsuites = Form.create()(
  class Testsuites extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        existingTypes: {
          "Test Runs": { count: 0 },
          "Unit testing": { count: 0 },
          "Integration testing": { count: 0 },
          "Smoke testing": { count: 0 },
          "Interface testing": { count: 0 },
          "Regression testing": { count: 0 },
          "Beta/Acceptance testing": { count: 0 },
          "Load testing": { count: 0 },
          "Stress testing": { count: 0 },
          "Security testing": { count: 0 },
          "Compatibility testing": { count: 0 },
          "Install testing": { count: 0 },
          "Recovery testing": { count: 0 },
          "Reliability testing": { count: 0 },
          "Usability testing": { count: 0 },
          "Compliance testing": { count: 0 },
          "Localization testing": { count: 0 }
        },
        suiteId: "", // for delete
        deleteConfirmation: false, // for delete
        searchText: "",
        test_suite_type: "Unit testing",
        testsuites: [],
        loader: false,
        visible: false,
        select_env_err: false,
        select_browser_err: false,
        selected_environment: "",
        current_suit_id: "",
        Environments_list: [],
        selected_browser: "",
        Browser_list: [
          {
            id: "chrome",
            name: "Google Chrome "
          },
          {
            id: "firefox",
            name: "Firefox "
          },
          {
            id: "MicrosoftEdge",
            name: "Microsoft Edge"
          }
        ]
      };
      this.myRef = React.createRef();
    }

    componentDidMount() {
      if (sessionStorage.getItem("id")) {
        window.scrollTo(0, 0);
        this.loadTestSuiteData();
        this.getEnvironments();
      } else {
        this.props.history.push("/login");
      }
    }

    getEnvironments = async () => {
      const environment = await axios.get(`${constants.application}/${window.location.pathname.split("/")[2]}`);
      let list = [];
      if (environment["status"] === 200) {
        for (let env of environment["data"]["environments"]) {
          list.push({ id: env["id"], environment: env["type"] });
        }
        if (list.length > 0) {
          this.setState({ Environments_list: list });
        }
      }
    };

    // Configure = () => {

    //   this.props.parentData.history.push(`${window.location.pathname}/configuration`);
    // };

    loadTestSuiteData = () => {
      this.setState({ loader: true });
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `{
          applications(
            where: {
              user: { id: "${sessionStorage.getItem("id")}"}
              id: "${window.location.pathname.split("/")[2]}"
            }
          ) {
            testsuites {
              id
              type
              suite_name
              sequence
            }
          }
        }`
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.data && response.data.applications && response.data.applications[0]) {
            if (response.data.applications[0]["testsuites"] && response.data.applications[0]["testsuites"].length > 0) {
              // update the counts
              let exisiting = this.state.existingTypes;
              response.data.applications[0]["testsuites"].map(suite => {
                if (suite.sequence) {
                  exisiting[suite.type]["count"] += 1;
                }
              });

              // state update
              this.setState({
                existingTypes: exisiting,
                deleteConfirmation: false,
                testsuites: response.data.applications[0]["testsuites"]
              });
            }
          }
          this.setState({ loader: false });
        })
        .catch(error => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    runSuite = async () => {
      // get selenium details
      const get_selenium_details = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `{
          applications(
            where: {
              user: { id: "${sessionStorage.getItem("id")}"},
              id: "${window.location.pathname.split("/")[2]}"
            }
          ) {
            selenium_configure{
              id,
              host,
              port
            }
          }
        }`
        })
      });

      const selenium_address = await get_selenium_details.json();

      const apiExecuteBody = {
        testsuiteid: this.state.current_suit_id,
        environment_id: this.state.selected_environment,
        browser: this.state.selected_browser,
        protractor_host: `http://${selenium_address.data.applications[0].selenium_configure.host}:${selenium_address.data.applications[0].selenium_configure.port}/wd/hub`
      };

      axios
        .post(constants.apiexecutehost, apiExecuteBody)
        .then(response => {
          // check if any suites already running
          let running_suites = JSON.parse(sessionStorage.getItem("jobs_id"));
          if (!!running_suites) {
            running_suites.push({ job_id: response.data.job_id });
            sessionStorage.setItem("jobs_id", JSON.stringify(running_suites));
          } else {
            let jobs = [{ job_id: response.data.job_id }];
            sessionStorage.setItem("jobs_id", JSON.stringify(jobs));
          }

          Alert.success("Suite Run started.");
          this.myRef.current.Polling();
        })
        .catch(function(error) {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    selectEnvironment = id => {
      this.setState({ visible: true, current_suit_id: id });
    };

    renderTypes = () => {
      const types = [];
      for (const key in this.state.existingTypes) {
        types.push({
          id: key,
          name: key,
          count: this.state.existingTypes[key]["count"]
        });
      }

      return types.map((data, index) => {
        return (
          <div
            className="feature-item-container animated zoomIn faster"
            key={index}
            onClick={() => this.setState({ test_suite_type: data.id })}
            style={this.state.test_suite_type === data.id ? { backgroundImage: "linear-gradient(90deg, #6D15B9, #8152EA)" } : {}}
          >
            <div className="item-name" style={this.state.test_suite_type === data.id ? { color: "#ffffff" } : {}}>
              {data.name}
            </div>
            <div className="item-count" style={this.state.test_suite_type === data.id ? { background: "#ffffff" } : {}}>
              {data.count}
            </div>
          </div>
        );
      });
    };

    delete = () => {
      this.setState({ loader: true });
      fetch(`${constants.testsuites}/${this.state.suiteId}`, {
        method: "DELETE"
      })
        .then(response => response.json())
        .then(response => {
          this.loadTestSuiteData();
          this.setState({
            loader: false,
            deleteConfirmation: false,
            suiteId: ""
          });
        })
        .catch(error => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    handleSave = () => {
      if (this.state.selected_environment === "") {
        this.setState({ select_env_err: true });
        // this.props.form.validateFields((err, values) => { });
        Alert.warning("please select environment!");
        return;
      }
      if (this.state.selected_browser === "") {
        this.setState({ select_browser_err: true });
        // this.props.form.validateFields((err, values) => { });
        Alert.warning("please select browser!");
        return;
      }
      this.setState({ visible: false, selected_environment: "", selected_browser: "" });
      this.runSuite();
      // this.PostXMLorJSON("graphRun")
    };

    handleModalCancel = () => {
      this.setState({ visible: false, selected_environment: "", selected_browser: "" });
    };

    handleChange = e => {
      this.setState({ selected_environment: e.target.value, select_env_err: false });
    };

    SelectBrowser = e => {
      this.setState({ selected_browser: e.target.value, select_browser_err: false });
    };

    setEnvironment = () => {
      const { getFieldDecorator } = this.props.form;

      return (
        <Modal title="Basic Modal" show={this.state.visible} onHide={this.handleModalCancel} className="config-modal">
          <Modal.Header>
            <Modal.Title>Select Environment</Modal.Title>
          </Modal.Header>
          <Modal.Body className="source-from">
            <Form layout="vertical" style={{ display: "flex" }}>
              <Form.Item label="Environment">
                {getFieldDecorator("environment", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your environment!"
                    }
                  ]
                })(
                  <select className={this.state.select_env_err ? "select-env-err select-env" : "select-env"} onChange={this.handleChange}>
                    <option value="">Select Environment</option>

                    {this.state.Environments_list.map((data, index) => {
                      return (
                        <option key={index} value={data["id"]}>
                          {data["environment"]}
                        </option>
                      );
                    })}
                  </select>
                )}
              </Form.Item>
              <Form.Item label="Select Browser">
                {getFieldDecorator("select_browser", {
                  rules: [
                    {
                      required: true,
                      message: "Please select your browser!"
                    }
                  ]
                })(
                  <select className={this.state.select_browser_err ? "select-env-err select-env" : "select-env"} onChange={this.SelectBrowser}>
                    <option value="">Select Browser</option>

                    {this.state.Browser_list.map((data, index) => {
                      return (
                        <option key={index} value={data["id"]}>
                          {data["name"]}
                        </option>
                      );
                    })}
                  </select>
                )}
              </Form.Item>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleModalCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={this.handleSave} className="positive-button">
                <i className="fa fa-check" />
                Run
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    };

    render() {
      let filteredData = [];
      if (this.state.testsuites.length > 0) {
        this.state.testsuites.map(suite => {
          if (suite.type === this.state.test_suite_type && suite.sequence) {
            if (this.state.searchText.trim() === "") {
              suite["count"] = suite.sequence.length;
              filteredData.push(suite);
            } else {
              if (suite.suite_name.toLowerCase().includes(this.state.searchText.toLowerCase())) {
                suite["count"] = suite.sequence.length;
                filteredData.push(suite);
              }
            }
          }
        });
      }

      const columns = [
        {
          sorter: true,
          title: "Name",
          dataIndex: "suite_name",
          key: "suite_name",
          sorter: (a, b) => a.suite_name.localeCompare(b.suite_name)
        },
        {
          title: "Number of Testcases",
          dataIndex: "count",
          key: "count"
        },
        {
          title: "Action",
          dataIndex: "id",
          key: "x",
          render: id => (
            <div className="table-action-btn-container">
              <Whisper placement="top" trigger="hover" speaker={<Tooltip>Run Testsuite</Tooltip>}>
                <div
                  className="table-action-btn"
                  // onClick={() => this.runSuite(id)}
                  onClick={() => this.selectEnvironment(id)}
                >
                  <i className="fa fa-play" />
                </div>
              </Whisper>

              <Whisper placement="top" trigger="hover" speaker={<Tooltip>Edit</Tooltip>}>
                <div
                  className="table-action-btn"
                  onClick={() =>
                    this.props.parentData.history.push({
                      pathname: `test-suites/update/${id}`,
                      parentData: this.props
                    })
                  }
                >
                  <i className="fa fa-pencil" />
                </div>
              </Whisper>

              <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>}>
                <div
                  className="table-action-btn"
                  onClick={() => {
                    this.setState({ suiteId: id, deleteConfirmation: true });
                  }}
                >
                  <i className="fa fa-trash" />
                </div>
              </Whisper>
            </div>
          )
        }
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
                {/* <div onClick={() => this.Configure()} className="negative-button email-setting">
                  <i className="fas fa-users-cog" />
                  Settings
                </div> */}
                <div onClick={() => document.getElementById("testcases-sidebar").click()} className="negative-button">
                  <i className="fa fa-gear" />
                  Manage Testcase
                </div>
                <div className="filter-panel-right-part">
                  <div
                    onClick={() =>
                      this.props.parentData.history.push({
                        pathname: `test-suites/add-testsuite`,
                        parentData: this.props
                      })
                    }
                    className="positive-button"
                  >
                    <i className="fa fa-plus" />
                    Add New
                  </div>
                </div>
              </div>
            </div>
            <div className="testcases-body">
              <div className="left-part">
                <div className="testcase-title">Suite Types</div>
                <div className="testcases-side-panel">{this.renderTypes()}</div>
              </div>
              <div className="right-part">
                <div className="testcase-filter">
                  <div />

                  <div className="testcase-filter-panel-search-container">
                    <div className="testcase-filter-panel-search-btn">
                      <i className="fa fa-search" />
                    </div>
                    <input autoFocus type="text" placeholder="Search testsuites here" name="search" value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
                  </div>
                </div>
                <div className="testcases-table">
                  <Table
                    className="testcases-table"
                    dataSource={filteredData}
                    columns={columns}
                    pagination={{
                      pageSize: document.getElementsByClassName("ant-table-wrapper")[0] ? Math.ceil(document.getElementsByClassName("ant-table-wrapper")[0].offsetHeight / 40 - 3) : 10
                    }}
                    rowKey="id"
                  />
                </div>
              </div>
            </div>
          </div>
          <DeletePopupModal deleteConfirmation={this.state.deleteConfirmation} onHide={() => this.setState({ deleteConfirmation: false, suiteId: "" })} delete={this.delete} />
          {this.setEnvironment()}
          <Loader status={this.state.loader} />
          <SuiteNotify ref={this.myRef}></SuiteNotify>
        </React.Fragment>
      );
    }
  }
);

export default Testsuites;
