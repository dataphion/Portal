import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/Dashboard.scss";
import constants from "../../../constants";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import moment from "moment";
import { Progress, Empty } from "antd";

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      total_testcases_types: {
        ui: 0,
        api: 0,
      },
      total_testsuites: 0,
      row: [
        {
          name: "urvesh dungrani",
          time: "00:10:33",
          chart: 300,
          expanded: false,
        },
        {
          name: "abhishek chotaliya",
          time: "00:12:47",
          chart: 500,
          expanded: false,
        },
        {
          name: "vinit mendapara",
          time: "00:10:33",
          chart: 100,
          expanded: false,
        },
        {
          name: "daksh rathod",
          time: "00:12:47",
          chart: 700,
          expanded: false,
        },
        {
          name: "amit singh",
          time: "00:10:33",
          chart: 1200,
          expanded: false,
        },
        {
          name: "pawan dhami",
          time: "00:12:47",
          chart: 400,
          expanded: false,
        },
        {
          name: "girish gowda",
          time: "00:10:33",
          chart: 950,
          expanded: false,
        },
      ],
      loadTestcase: [],
      avg_runtimes_for_suites: [],
      heal_count: 0,
      vision_count: 0,
      time_saved: 15,
      cost_saved: 12,
      test_case_group: 0,
    };
  }

  componentDidMount() {
    this.loadTestData();
    // object repository individual counts
    this.loadTestcase();
    // avg runtime for suites
    this.getReports();
    // get healed component counts
    this.getHealedComponent();
  }

  loadTestcase = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{
          applications(where: { id: "${window.location.pathname.split("/")[2]}" }) {
            name
            testcases {
              name
              type
              testcasecomponents {
                sequence_number
                type
                objectrepository {
                  id
                  domain
                  protocol
                  tag
                  url
                  element_value
                  element_id
                  element_css
                  element_xpaths
                  browser_width
                  browser_height
                  x_cord
                  y_cord
                  x_scroll
                  y_scroll
                  element_attributes
                  highlighted_image_url
                  element_snapshot
                  page_url
                }
              }
            }
          }
        }`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        let testCaseObj = [];
        let objectrepositories = [];
        for (let obj of response.data.applications[0].testcases) {
          for (let component of obj.testcasecomponents) {
            if (component.objectrepository) {
              objectrepositories.push(component.objectrepository);
            }
          }
        }
        const grouped_domain = _.mapValues(_.groupBy(objectrepositories, "domain"));

        for (let key in grouped_domain) {
          if (key !== null && key !== "null") {
            testCaseObj.push({ url: key, count: grouped_domain[key].length });
          }
        }
        this.setState({
          loadTestcase: testCaseObj,
        });
      });
  };

  // ------------------------ average runtime for suites data ------------------------
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
        }){testsuites{id,suite_name,type,testsessionexecutions{id,total_pass,total_fail,testcaseexecutions{status,start_time,end_time}}}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
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
                    } else {
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
                const total_execution_time = moment.duration(`${total_hours}:${total_minutes}:${total_seconds}`);
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
                    },
                    {
                      name: "fail",
                      value: test_fail,
                    },
                  ],
                  expanded: false,
                });
              }
            }
          }
        }
        this.setState({
          loader: false,
          avg_runtimes_for_suites: row,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  // get ai vision count && healed components counts
  getHealedComponent = () => {
    try {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{applications(where:{
      user: { id: "${sessionStorage.getItem("id")}"}
      id: "${window.location.pathname.split("/")[2]}"
    }){
      name,
      healedcomponents{
        heal_count
        vision_count
        id
      }
      testsuites{
        suite_name
        id
      }
      testcasegroups{
        id
        name
      }
  
    }
  }`,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          this.setState({
            test_case_group: response.data.applications[0].testcasegroups.length,
            heal_count: response.data.applications[0].healedcomponents.length > 0 ? response.data.applications[0].healedcomponents[0].heal_count : 0,
            vision_count:
              response.data.applications[0].healedcomponents.length > 0 ? response.data.applications[0].healedcomponents[0].vision_count : 0,
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  loadTestData = async function () {
    const req = await fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{
          applications(
            where: {
              user: { id: "${sessionStorage.getItem("id")}" }
              id: "${window.location.pathname.split("/")[2]}"
            }
          ) {
            testcases {
              id
              type
            }
            testsuites(where:{suite_name_ne:"default"}) {
              id
            }
          }
        }`,
      }),
    });

    const res = await req.json();
    let types = {
      ui: 0,
      api: 0,
    };

    if (res.data && res.data.applications && res.data.applications.length > 0) {
      // test cases
      if (res.data.applications[0]["testcases"] && res.data.applications[0]["testcases"].length > 0) {
        res.data.applications[0]["testcases"].map((testcase) => {
          if (testcase.type === "api") {
            types.api += 1;
          } else {
            types.ui += 1;
          }
        });
      }

      // test suites
      if (res.data.applications[0]["testsuites"] && res.data.applications[0]["testsuites"].length > 0) {
        this.setState({
          total_testsuites: res.data.applications[0]["testsuites"].length,
        });
      }
    }

    this.setState({ total_testcases_types: types });
  };

  expandRow = (index) => {
    let newRow = this.state.avg_runtimes_for_suites;
    newRow[index]["expanded"] = !newRow[index]["expanded"];
    this.setState({ avg_runtimes_for_suites: newRow });
  };

  render() {
    let graph_testcase_type_data = [
      {
        name: "Api Testcases",
        value: this.state.total_testcases_types.api,
        color: "#ffe079",
      },
      {
        name: "UI Testcases",
        value: this.state.total_testcases_types.ui,
        color: "#5c69c0",
      },
    ];

    return (
      <div className="body-container animated fadeIn">
        <div className="filter-panel-container">
          <div className="breadcrumbs-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">{this.props.applicationName ? ">" : ""}</div>
              <div className="breadcrumbs-items">{this.props.applicationName ? this.props.applicationName : ""}</div>
            </div>
          </div>
        </div>
        <div className="container-fluid" style={{ padding: "30px 30px 0 30px" }}>
          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-12">
                  <div className="smart-vision-container">
                    <div className="logo-container" />
                    <div className="desc-container">
                      <div className="title">
                        SMART AI VISION WAS USED
                        <span> {this.state.vision_count} </span>
                        TIMES
                      </div>
                      <div className="description">
                        AI VISION is being used when the native approaches unable to identify the element in the page or when the element changes
                        completely.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="small-card-container time-saved">
                    <div className="time-saved-image" />
                    <div className="header">
                      <div className="top">
                        <span>{this.state.time_saved * this.state.vision_count}</span>MINUTES
                      </div>
                      <div className="bottom">TIME SAVED</div>
                    </div>
                    <div className="footer">The approximate time saved after switching your application to AI Tester</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="small-card-container cost-saved">
                    <div className="cost-saved-image" />
                    <div className="header">
                      <div className="top">
                        <span>${((this.state.time_saved * this.state.vision_count) / 60) * this.state.cost_saved}</span>
                      </div>
                      <div className="bottom">COST SAVED</div>
                    </div>
                    <div className="footer">The approximate amount saved after switching your application to AI Tester</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="row">
                <div className="col-md-12">
                  <div className="small-card-container" id="test_suites">
                    <div className="graph-header">
                      <div className="graph-top">{this.state.total_testsuites}</div>
                      <div className="graph-bottom">TOTAL TEST SUITES</div>
                    </div>
                    <div className="graph-footer">
                      <ResponsiveContainer>
                        <AreaChart height={60} data={this.state.row.reverse()} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                          <Area type="natural" dataKey="chart" stroke="none" fill={constants.GREEN} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="margin-30" />
                </div>
                <div className="col-md-12">
                  <div className="small-card-container">
                    <div className="graph-header">
                      <div className="graph-top">{this.state.test_case_group}</div>
                      <div className="graph-bottom">TOTAL GROUPS</div>
                    </div>
                    <div className="graph-footer">
                      <ResponsiveContainer>
                        <AreaChart height={60} data={this.state.row} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                          <Area type="natural" dataKey="chart" stroke="none" fill={constants.SECONDARY_COLOR} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="total-self-healed-component">
                <div className="header">
                  <div className="header-logo" />
                  <div className="count">{this.state.heal_count}</div>
                </div>
                <div className="footer">
                  <div className="footer-title">TOTAL SELF HEALED COMPONENTS</div>
                  <div className="footer-desc">Self Healing smartly tries to get the element with all possible ways</div>
                </div>
              </div>
            </div>
          </div>
          <div className="row" style={{ marginTop: "-30px" }}>
            <div className="col-md-6">
              <div className="test-case-overview-card-container">
                <div className="left-part">
                  <div className="title">TEST CASES OVERVIEW</div>
                  <div className="information">
                    <div className="information-row">
                      <div className="color recorded" />
                      <div className="count">{graph_testcase_type_data[1]["value"]}</div>
                      <div className="desc">UI Cases</div>
                    </div>
                    <div className="information-row">
                      <div className="color dot-net" />
                      <div className="count">{graph_testcase_type_data[0]["value"]}</div>
                      <div className="desc">End to End</div>
                    </div>
                  </div>
                </div>
                <PieChart width={160} height={160}>
                  <Pie data={graph_testcase_type_data} cx={75} cy={75} labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                    {graph_testcase_type_data.map((data, index) => {
                      return <Cell key={data["name"]} fill={data["color"]} />;
                    })}
                  </Pie>
                </PieChart>
              </div>
            </div>
            <div className="col-md-6">
              <div className="table-card-container">
                <div className="table-header unstable-test-suite-header">
                  <div className="title flex v-center"><div className="table-icon unstable" /> MOST UNSTABLE TEST SUITES</div>
                  {/* <div className="right-part">
                    <div className="sort-button">
                      <i className="fa fa-plus-square" />
                      Time Added
                    </div>
                  </div> */}
                </div>
                <Empty style={{ margin: "auto" }} />

                {/* {this.state.row.map((data, index) => {
                  return (
                    <div className={"table-row " + (/^-?\d*[13579]$/.test(index) ? "table-row-bg" : "")} key={index}>
                      <div className="left-part">
                        <div className="count">{index + 1}</div>
                        <div className="name">{data.name}</div>
                      </div>
                    </div>
                  );
                })} */}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="table-card-container">
                <div className="table-header running-test-session-header">
                  <div className="title flex v-center"><div className="table-icon running" /> CURRENTLY RUNNING TEST SESSIONS</div>
                  {/* <div className="right-part">
                    <div className="sort-button">
                      <i className="fa fa-plus-square" />
                      Time Added
                    </div>
                  </div> */}
                </div>
                <Empty style={{ margin: "auto" }} />
                {/* {this.state.row.map((data, index) => {
                  return (
                    <div className={"table-row " + (/^-?\d*[13579]$/.test(index) ? "table-row-bg" : "")} key={index}>
                      <div className="left-part">
                        <div className="count">{index + 1}</div>
                        <div className="name">{data.name}</div>
                      </div>
                      <div className="right-part">{data.time}</div>
                    </div>
                  );
                })} */}
              </div>
            </div>
            <div className="col-md-6">
              <div className="table-card-container">
                <div className="table-header failed-test-header">
                  <div className="title flex v-center"><div className="table-icon failed" /> RECENTLY FAILED TESTS</div>
                  {/* <div className="right-part">
                    <div className="sort-button">
                      <i className="fa fa-plus-square" />
                      Time Added
                    </div>
                  </div> */}
                </div>
                <Empty style={{ margin: "auto" }} />
                {/* {this.state.row.map((data, index) => {
                  return (
                    <div className={"table-row " + (/^-?\d*[13579]$/.test(index) ? "table-row-bg" : "")} key={index}>
                      <div className="left-part">
                        <div className="count">{index + 1}</div>
                        <div className="name">{data.name}</div>
                      </div>
                    </div>
                  );
                })} */}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="table-card-container" style={{ height: "350px" }}>
                <div className="table-header average-runtime-header">
                  <div className="title flex v-center"><div className="table-icon time" /> AVERAGE RUNTIME FOR SUITES</div>
                  {/* <div className="right-part">
                    <div className="sort-button">
                      <i className="fa fa-plus-square" />
                      Time Added
                    </div>
                  </div> */}
                </div>
                {this.state.avg_runtimes_for_suites.length > 0 ? (
                  this.state.avg_runtimes_for_suites.map((data, index) => {
                    let total_test_cases = parseInt(data.total_pass) + parseInt(data.total_fail);
                    let percentage = (parseInt(data.total_pass) / total_test_cases) * 100;
                    return (
                      <div className="dropdown-container" key={index}>
                        <div className="dropdown-row" onClick={() => this.expandRow(index)} key={index}>
                          <div className="dropdown-row-left-part">
                            <div className="name">{data.name}</div>
                          </div>
                          <div className="dropdown-row-right-part">
                            <div className="time">{data.total_execution_time}</div>
                            <div className="down-button">
                              <i style={{ transition: "all 0.3s" }} className={"fa fa-angle-down " + (data.expanded ? "expandBtn" : "")} />
                            </div>
                          </div>
                        </div>
                        <div className="dropdown-bottom-container" style={data.expanded ? { height: "200px" } : {}}>
                          <div className="dropdown-bottom-header">
                            <div className="item build">BUILD</div>
                            <div className="item status">STATUS</div>
                            <div className="item pass">PASS</div>
                            <div className="item fail">FAIL</div>
                            <div className="item ratio">RATIO</div>
                            <div className="item time-token">TIME TAKEN</div>
                          </div>
                          <div className="dropdown-bottom-row">
                            <div className="item-data build-data">
                              {/* 2.0.1 Alpha */}
                              {data.name}
                            </div>
                            <div className="item-data status-data">{data.status}</div>
                            <div className="item-data pass-data">{data.total_pass}</div>
                            <div className="item-data fail-data">{data.total_fail}</div>
                            <div className="ratio-data">
                              {/* <div
                                className="ratio-data-active"
                                style={{ width: "90%" }}
                              /> */}
                              <Progress percent={percentage} showInfo={false} strokeColor="#4AD1A1" />
                            </div>
                            <div className="item-data time-token-data">{data.total_execution_time}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Empty style={{ margin: "auto" }} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="table-card-container" style={{ height: "300px" }}>
                <div className="table-header component-record-page-header">
                  <div className="title flex v-center"><div className="table-icon components" /> COMPONENTS RECORDED PAGE WISE</div>
                  <div className="right-part">
                    <div className="filter-search-container">
                      <div className="filter-search-btn">
                        <i className="fa fa-search" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search Here"
                        name="search"
                        value={this.state.searchValue}
                        onChange={(e) => this.setState({ searchValue: e.target.value })}
                      />
                    </div>
                    {/* <div className="sort-button">
                      <i className="fa fa-plus-square" />
                      Time Added
                    </div> */}
                  </div>
                </div>
                <div className="table-row-heading">
                  <div className="text-container">COMPONENTS</div>
                  <div className="text-container">URL</div>
                </div>
                {this.state.loadTestcase.length > 0 ? (
                  this.state.loadTestcase.map((data, index) => {
                    if (data.url.toLocaleLowerCase().includes(this.state.searchValue.toLocaleLowerCase())) {
                      return (
                        <div className={"table-row " + (/^-?\d*[13579]$/.test(index) ? "table-row-bg" : "")} key={index}>
                          <div className="left-part">
                            <div className="big-count">{data.count}</div>
                            <div className="name">{data.url}</div>
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
    );
  }
}
