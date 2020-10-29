import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/Reports.scss";
import Loader from "../../../Components/Loader";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Alert, Whisper, Tooltip as Rtooltip } from "rsuite";
import { Empty, Col, Row } from "antd";
import { Link } from "react-router-dom";
import constants from "../../../constants";
import moment from "moment";
export default class Reports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      loader: false,
      SelectedReportsBtn: "allRuns",
      row: [],
    };
  }

  componentDidMount() {
    try {
      if (sessionStorage.getItem("id")) {
        sessionStorage.removeItem("redirect-path");
        window.scrollTo(0, 0);
        this.getReports();
      } else {
        sessionStorage.setItem("redirect-path", window.location.pathname);
        this.props.history.push("/login");
      }
    } catch (error) {
      console.log(error);
    }
  }

  getReports = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{applications(where:{
          user: { id: "${sessionStorage.getItem("id")}" }
          id: "${window.location.pathname.split("/")[2]}"
        }){testsuites{id,suite_name,type,testsessionexecutions{id,total_pass,total_fail,start_time, end_time, testcaseexecutions{status,start_time,end_time}}}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("response ---->", response);
        let row = [];
        for (let main_data of response.data.applications) {
          if (main_data["testsuites"].length > 0) {
            for (let rowdata of main_data["testsuites"]) {
              let test_pass = 0,
                test_fail = 0,
                total_hours = 0,
                total_minutes = 0,
                total_seconds = 0;
              if (rowdata["testsessionexecutions"].length > 0 && rowdata["suite_name"] !== "default") {
                for (const tsdata of rowdata.testsessionexecutions) {
                  for (const tcdata of tsdata.testcaseexecutions) {
                    if (tcdata.status === "completed") {
                      test_pass += 1;
                    } else if ("failed") {
                      test_fail += 1;
                    }
                    if (tcdata.start_time && tcdata.end_time) {
                      let start_time = moment(tcdata.start_time).format("YYYY/MM/DD HH:mm:ss"),
                        end_time = moment(tcdata.end_time).format("YYYY/MM/DD HH:mm:ss"),
                        ms = moment(end_time, "YYYY/MM/DD HH:mm:ss").diff(moment(start_time, "YYYY/MM/DD HH:mm:ss")),
                        d = moment.duration(ms);
                      total_hours += Math.floor(d.asHours());
                      total_minutes += Math.floor(d.asMinutes());
                      total_seconds += Number(moment.utc(ms).format("ss"));
                    }
                  }
                }

                // test cases per runs
                let testcases = [];
                for (const testcase of rowdata.testsessionexecutions) {
                  let t_hours = 0,
                    t_minutes = 0,
                    t_seconds = 0;
                  for (const t of testcase.testcaseexecutions) {
                    let s_time = moment(t.start_time).format("YYYY/MM/DD HH:mm:ss"),
                      e_time = moment(t.end_time).format("YYYY/MM/DD HH:mm:ss"),
                      ms = moment(e_time, "YYYY/MM/DD HH:mm:ss").diff(moment(s_time, "YYYY/MM/DD HH:mm:ss")),
                      d = moment.duration(ms);
                    t_hours += Math.floor(d.asHours());
                    t_minutes += Math.floor(d.asMinutes());
                    t_seconds += Number(moment.utc(ms).format("ss"));
                  }

                  let duration = moment.duration(`${t_hours}:${t_minutes}:${t_seconds}`);

                  var gmtDateTime = moment.utc(testcase.start_time, "DD-MM-YY HH:mm:ss");
                  // convert utc to local
                  var local = gmtDateTime.local().format("DD-MM-YY HH:mm:ss");
                  print("ist time ===", local);
                  testcases.push({
                    id: testcase.id,
                    start_time: local,
                    total_pass: testcase.total_pass,
                    total_fail: testcase.total_fail,
                    execution_time: `${duration._data.hours}hr ${duration._data.minutes}min ${duration._data.seconds}sec`,
                    user: "user",
                  });
                }
                // let lastelement = rowdata["testsessionexecutions"].length - 1 ? rowdata["testsessionexecutions"].length - 1 : 0;
                // let last_five_result = _.takeRight(rowdata["testsessionexecutions"], 5);
                // if (rowdata["testsessionexecutions"][lastelement]["testcaseexecutions"].length > 0) { down part earlier it was inside if condition}
                const total_execution_time = moment.duration(`${total_hours}:${total_minutes}:${total_seconds}`);
                // testcases.sort(function(a, b) {
                //   let first = moment(b.start_time).format("DD-MM-YY HH:mm:ss");
                //   let second = moment(a.start_time).format("DD-MM-YY HH:mm:ss");
                //   return new Date(first) - new Date(second);
                // });
                row.push({
                  id: rowdata["id"],
                  name: rowdata["suite_name"],
                  type: rowdata["type"],
                  total_execution_time: `${total_execution_time._data.hours}hr ${total_execution_time._data.minutes}min ${total_execution_time._data.seconds}sec`,
                  total_pass: test_pass,
                  total_fail: test_fail,
                  chart_data: [
                    {
                      name: "pass",
                      value: test_pass,
                      // value: rowdata["testsessionexecutions"][lastelement]["total_pass"] ? parseInt(rowdata["testsessionexecutions"][lastelement]["total_pass"]) : 0
                    },
                    {
                      name: "fail",
                      value: test_fail,
                      // value: rowdata["testsessionexecutions"][lastelement]["total_fail"] ? parseInt(rowdata["testsessionexecutions"][lastelement]["total_fail"]) : 0
                    },
                  ],
                  testcases: testcases,
                  // last_five_result,
                  // total_pass: rowdata["testsessionexecutions"][lastelement]["total_pass"] ? rowdata["testsessionexecutions"][lastelement]["total_pass"] : null,
                  // total_fail: rowdata["testsessionexecutions"][lastelement]["total_fail"] ? rowdata["testsessionexecutions"][lastelement]["total_fail"] : null,
                  expanded: false,
                });
              }
            }
          }
        }
        this.setState({
          loader: false,
          row,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  // SelectedReportsBtn = Selected => {
  //   let SelectedReportsBtn = this.state.SelectedReportsBtn;
  //   if (Selected === "allRuns") {
  //     SelectedReportsBtn = "allRuns";
  //   } else if (Selected === "inProgress") {
  //     SelectedReportsBtn = "inProgress";
  //   } else if (Selected === "scheduled") {
  //     SelectedReportsBtn = "scheduled";
  //   } else if (Selected === "finished") {
  //     SelectedReportsBtn = "finished";
  //   }
  //   this.setState({ SelectedReportsBtn: SelectedReportsBtn });
  // };

  expandRow = (index) => {
    let newState = this.state.row;
    newState[index]["expanded"] = !newState[index]["expanded"];
    this.setState({ row: newState });
  };

  viewCompleteReport = (testsuite_id, testsessionexecution_id) => {
    this.props.parentData.history.push({
      pathname: `reports/reportSteps/${testsuite_id}/${testsessionexecution_id}`,
      parentData: this.props,
    });
  };

  renderSuiteType = (type) => {
    if (type == "Unit testing" || type == "Load testing" || type == "Reliability testing") {
      return <div className="executed-result-types-button executed-result-types-button-1">{type}</div>;
    } else if (type == "Integration testing" || type == "Stress testing" || type == "Usability testing") {
      return <div className="executed-result-types-button executed-result-types-button-2">{type}</div>;
    } else if (type == "Smoke testing" || type == "Security testing" || type == "Compliance testing") {
      return <div className="executed-result-types-button executed-result-types-button-3">{type}</div>;
    } else if (type == "Interface testing" || type == "Compatibility testing" || type == "Localization testing") {
      return <div className="executed-result-types-button executed-result-types-button-4">{type}</div>;
    } else if (type == "Regression testing" || type == "Install testing") {
      return <div className="executed-result-types-button executed-result-types-button-5">{type}</div>;
    } else if (type == "Beta/Acceptance testing" || type == "Recovery testing") {
      return <div className="executed-result-types-button executed-result-types-button-6">{type}</div>;
    }
  };

  render() {
    console.log("testcases ---->", this.state.testcase);
    const COLORS = ["#1dd1a1", "#ff6b6b"];
    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">REPORTS</div>
            </div>
            <div className="filter-panel-right-part" />
          </div>
          <div className="testcases-body">
            <div className="right-part">
              <div className="testcase-filter">
                <div className="testcase-title">All Reports</div>
                {/* <div className="testcase-buttons-menu">
                  <div
                    onClick={() => this.SelectedReportsBtn("allRuns")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedReportsBtn === "allRuns" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    All Runs
                  </div>
                  <div
                    onClick={() => this.SelectedReportsBtn("inProgress")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedReportsBtn === "inProgress" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    In Progress
                  </div>
                  <div
                    onClick={() => this.SelectedReportsBtn("scheduled")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedReportsBtn === "scheduled" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Scheduled
                  </div>
                  <div
                    onClick={() => this.SelectedReportsBtn("finished")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedReportsBtn === "finished" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Finished
                  </div>
                </div> */}
                <div className="testcase-filter-panel-search-container">
                  <div className="testcase-filter-panel-search-btn">
                    <i className="fa fa-search" />
                  </div>
                  <input autoFocus type="text" placeholder="Search reports here" name="search" value={this.state.searchText} onChange={(e) => this.setState({ searchText: e.target.value })} />
                </div>
              </div>
              <div className="testcases-table">
                <div className="row">
                  {this.state.row.length > 0 ? (
                    this.state.row.map((data, index) => {
                      if (data.name.toLowerCase().includes(this.state.searchText.toLowerCase())) {
                        return (
                          <div className="col-md-12 animated fadeIn test-suite-row" key={index}>
                            <div className="executed-result-container">
                              <div
                                className="executed-result-container-body"
                                onClick={() => {
                                  // this.viewCompleteReport(data.id);
                                  this.expandRow(index);
                                }}
                              >
                                <div className="executed-result-container-left">
                                  <PieChart width={30} height={30}>
                                    <Pie data={data.chart_data} cx={10} cy={10} outerRadius={15} dataKey="value">
                                      <Tooltip />
                                      {data.chart_data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                  <div className="executed-result-title-desc-container">
                                    <div className="executed-result-title">{data.name}</div>
                                    {/* <div className="executed-result-desc">Segment Name</div> */}
                                  </div>
                                </div>
                                <div className="right-side-extexuted-container">
                                  <div className="executed-result-container-right">
                                    {this.renderSuiteType(data.type)}
                                    <div className="executed-result-divider" />
                                    <div className="executed-result-status">
                                      <Whisper placement="top" trigger="hover" speaker={<Rtooltip>Pass Testcases</Rtooltip>}>
                                        <div className="executed-result-status-green">{data.total_pass}</div>
                                      </Whisper>
                                      <Whisper placement="top" trigger="hover" speaker={<Rtooltip>Fail Testcases</Rtooltip>}>
                                        <div className="executed-result-status-red">{data.total_fail}</div>
                                      </Whisper>
                                    </div>
                                    {/* <div className="executed-result-divider" />
                                  <div className="executed-result-environment-container">
                                    <div className="executed-result-environment-title">Environment</div>
                                    <div className="executed-result-environment-status">Development</div>
                                  </div> */}
                                    <div className="executed-result-divider" />
                                    <div className="executed-result-execution-container">
                                      <div className="executed-result-execution-title">Total Execution Time</div>
                                      <div className="executed-result-execution-time">{data.total_execution_time || "00:00"}</div>
                                    </div>
                                    <div className="executed-result-divider-last" />
                                  </div>
                                </div>
                                <div className="executed-result-last-container">
                                  {/* <div className="executed-result-last-play-btn">
                                    <i className="fa fa-play-circle" />
                                  </div> */}
                                  <div className="executed-result-last-expand">
                                    <Whisper placement="top" trigger="hover" speaker={<Rtooltip>View Details</Rtooltip>}>
                                      <i className={data.expanded ? "fa fa-angle-right fa-lg rotate-icon" : "fa fa-angle-right fa-lg rotate-back"} />
                                    </Whisper>
                                    {/* <i style={{ transition: "all 0.3s" }} className={"fa fa-angle-down " + (data.expanded === true ? "expandBtn" : "")} /> */}
                                  </div>
                                </div>
                              </div>
                              {data.expanded ? (
                                <div className={"executed-result-footer " + (data.expanded === true ? "expandRow row-spec" : "")}>
                                  <Row className="testsuite-row">
                                    <Col className="executed-result-footer-field-container" span={5}>
                                      <div className="executed-result-footer-field-title">START TIME</div>
                                      {/* <div className="executed-result-footer-field-value padding">dasdasd</div> */}
                                    </Col>
                                    <Col className="executed-result-footer-field-container" span={5}>
                                      <div className="executed-result-footer-field-title">PASS</div>
                                      {/* <div className="executed-result-footer-field-value padding">{data.start_time}</div> */}
                                    </Col>
                                    <Col className="executed-result-footer-field-container" span={5}>
                                      <div className="executed-result-footer-field-title">FAILED</div>
                                      {/* <div className="executed-result-footer-field-value padding">{data.start_time}</div> */}
                                    </Col>
                                    <Col className="executed-result-footer-field-container" span={5}>
                                      <div className="executed-result-footer-field-title">EXECUTION TIME</div>
                                      {/* <div className="executed-result-footer-field-value padding">{data.end_time}</div> */}
                                    </Col>
                                    <Col className="executed-result-footer-field-container" span={4}>
                                      <div className="executed-result-footer-field-title">INITIATED BY</div>
                                      {/* <div className="executed-result-footer-field-value padding">USER</div> */}
                                    </Col>
                                  </Row>
                                  <div className="tests-container">
                                    {data.testcases.map((test, i) => {
                                      return (
                                        <Row className="testsuite-row testcas-m" key={i} onClick={() => this.viewCompleteReport(data.id, test.id)}>
                                          <Col className="executed-result-footer-field-container" span={5}>
                                            {/* <div className="executed-result-footer-field-title">START TIME</div> */}
                                            <div className="executed-result-footer-field-value padding">{test.start_time}</div>
                                          </Col>
                                          <Col className="executed-result-footer-field-container" span={5}>
                                            {/* <div className="executed-result-footer-field-title">PASS</div> */}
                                            <div className="executed-result-footer-field-value padding">{test.total_pass}</div>
                                          </Col>
                                          <Col className="executed-result-footer-field-container" span={5}>
                                            {/* <div className="executed-result-footer-field-title">FAILED</div> */}
                                            <div className="executed-result-footer-field-value padding">{test.total_fail}</div>
                                          </Col>
                                          <Col className="executed-result-footer-field-container" span={5}>
                                            {/* <div className="executed-result-footer-field-title">EXECUTION TIME</div> */}
                                            <div className="executed-result-footer-field-value padding">{test.execution_time}</div>
                                          </Col>
                                          <Col className="executed-result-footer-field-container" span={4}>
                                            {/* <div className="executed-result-footer-field-title">INITIATED BY</div> */}
                                            <div className="executed-result-footer-field-value padding">USER</div>
                                          </Col>
                                        </Row>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
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
          </div>
        </div>
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
