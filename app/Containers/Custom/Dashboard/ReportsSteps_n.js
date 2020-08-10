import React from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/Header";
import Loader from "../../../Components/Loader";
import { Alert, Whisper, Tooltip } from "rsuite";
import constants from "../../../constants";
import { Context } from "../../Context";
import _ from "lodash";
import { Table, Row, Col, Divider, Progress } from "antd";
import moment from "moment";
import "../../../Assets/Styles/Custom/Dashboard/Reports.scss";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import ReportLogsModal from "../../../Components/ReportLogsModal_n";
import ReactEcharts from "echarts-for-react";
// import echarts
import echarts from "echarts";
// register theme object
echarts.registerTheme("my_theme", {
  backgroundColor: "#f4cccc",
});

export default class ReportsSteps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      allData: [],
      filteredData: [],
      LogsReportData: [],
      LogsReportModal: false,
      test_fail: 0,
      test_pass: 0,
      modal_type: "",
      case_status: "",
      expand: false,
      row_data: {},
      total_execution_time: null,
      pass_percentage: 0,
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      this.getReports();
    } else {
      this.props.history.push("/login");
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
        query: `{applications(where:
            {user:{id:"${sessionStorage.getItem("id")}"},id:"${window.location.pathname.split("/")[2]}"})
        {testsuites(where:{id:"${window.location.pathname.split("/")[5]}"}){
          id
          suite_name
          type
          testsessionexecutions(where:{id:"${
            window.location.pathname.split("/")[6]
          }"}){id,start_time,end_time,total_pass,total_fail,testcaseexecutions{id,status,flowsteps{
            id,name,status_code,action,request,response,conditions_result,source_result, description, error_log, error_view_id{id,name,url}, objectrepository{id,page_url,thumbnail_url,highlighted_image_url, url}}type,start_time,end_time,testcase{id,name}}}}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        let row = [];
        let test_pass = 0;
        let test_fail = 0;
        let total_hours = 0;
        let total_minutes = 0;
        let total_seconds = 0;
        for (let data of response.data.applications[0]["testsuites"][0]["testsessionexecutions"]) {
          for (let testcaseexecutions of data["testcaseexecutions"]) {
            if (testcaseexecutions["status"] !== "started") {
              let start_time = moment(testcaseexecutions.start_time).format("YYYY/MM/DD HH:mm:ss");
              let end_time = moment(testcaseexecutions.end_time).format("YYYY/MM/DD HH:mm:ss");
              if (testcaseexecutions["status"] === "completed") {
                test_pass += 1;
              } else if (testcaseexecutions["status"] === "failed") {
                test_fail += 1;
              }
              let ms = moment(end_time, "YYYY/MM/DD HH:mm:ss").diff(moment(start_time, "YYYY/MM/DD HH:mm:ss"));
              let d = moment.duration(ms);
              let s = Math.floor(d.asHours()) + "hr " + Math.floor(d.asMinutes()) + "min " + moment.utc(ms).format("ss") + "sec";

              // calculate total execution time
              if (testcaseexecutions.start_time && testcaseexecutions.end_time) {
                let count_start_time = moment(testcaseexecutions.start_time).format("YYYY/MM/DD HH:mm:ss");
                let count_end_time = moment(testcaseexecutions.end_time).format("YYYY/MM/DD HH:mm:ss");
                let ms = moment(count_end_time, "YYYY/MM/DD HH:mm:ss").diff(moment(count_start_time, "YYYY/MM/DD HH:mm:ss"));
                let d = moment.duration(ms);
                total_hours += Math.floor(d.asHours());
                total_minutes += Math.floor(d.asMinutes());
                total_seconds += Number(moment.utc(ms).format("ss"));
              }

              row.push({
                type: testcaseexecutions.type,
                testcase_name: testcaseexecutions.testcase ? testcaseexecutions.testcase.name : "",
                status: testcaseexecutions.status,
                duration: ms ? s : "00:00",
                start_time,
                end_time,
                Logs: testcaseexecutions["flowsteps"],
              });
            }
          }
        }
        const total_execution_time = moment.duration(`${total_hours}:${total_minutes}:${total_seconds}`);
        // calculate pass percentage
        const pass_percentage = (test_pass / (test_pass + test_fail)) * 100;

        this.setState({
          loader: false,
          allData: response.data.applications[0]["testsuites"][0],
          filteredData: row,
          test_fail: test_fail,
          pass_percentage: pass_percentage.toFixed(2),
          total_execution_time: `${total_execution_time._data.hours}hr ${total_execution_time._data.minutes}min ${total_execution_time._data.seconds}sec`,
          test_pass: test_pass,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  render() {
    // chart options
    const options = {
      title: {
        text: "",
        subtext: "",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: {
        left: "center",
        top: "top",
        data: ["passed", "failed"],
      },
      series: [
        {
          name: "Test view",
          type: "pie",
          radius: [20, 110],
          roseType: "radius",
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
            },
          },
          data: [
            { value: this.state.test_pass, name: "passed", itemStyle: { color: "#2ecc71" } },
            { value: this.state.test_fail, name: "failed", itemStyle: { color: "#82ccdd" } },
          ],
        },
      ],
    };

    // table column
    const columns = [
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        className: "table-first-column",
        render: (type) => (
          <Whisper placement="top" trigger="hover" speaker={<Tooltip>{type === "ui" ? "UI" : "API"}</Tooltip>}>
            <i className={"fa " + (type === "ui" ? "fa-desktop" : "fa-rocket")} />
          </Whisper>
        ),
      },
      {
        title: "Testcase Name",
        dataIndex: "testcase_name",
        key: "testcase_name",
        width: 80,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        className: "table-first-column",
        render: (type) => (
          <div>
            <span className={type === "completed" ? "success-cls" : "failed-cls"}>{type === "completed" ? "success" : "failed"}</span>
          </div>
        ),
      },
      {
        title: "Info",
        dataIndex: "Logs",
        key: "Logs",
        className: "table-first-column",
        render: (data, record) => (
          <Whisper placement="top" trigger="hover" speaker={<Tooltip>{record.status === "completed" ? "success" : "more info"}</Tooltip>}>
            <div>
              {record.status === "completed" ? (
                <i className="fa fa-check" style={{ color: "#2ecc71" }} />
              ) : (
                <i
                  className="fa fa-info-circle"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // this.setState({ LogsReportData: data, row_data: record, LogsReportModal: true, modal_type: record.type, case_status: record.status });
                    let logs_data = {
                      logs_report_data: data,
                      row_data: record,
                      modal_type: record.type,
                      case_status: record.status,
                      suite_name: this.state.allData.suite_name ? this.state.allData.suite_name : null,
                    };
                    this.props.history.push({
                      pathname: `/dashboard/${window.location.pathname.split("/")[2]}/reports/reportSteps/${window.location.pathname.split("/")[5]}/${
                        window.location.pathname.split("/")[6]
                      }/logs`,
                      logs_data: logs_data,
                    });
                  }}
                />
              )}
            </div>
          </Whisper>
        ),
      },
    ];
    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            <div className="main-container animated fadeIn">
              {context.state.smallSidebar ? <Header /> : <DashboardSidebar />}
              <div className="body-container">
                <div className="filter-panel-container">
                  <div className="breadcrumbs-container">
                    <i className="fa fa-map-marker" />
                    <Link to="/">APPLICATIONS</Link>
                    <div className="breadcrumbs-items"></div>
                    <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/reports`} className="breadcrumbs-items">
                      REPORT
                    </Link>
                    <div className="breadcrumbs-items">{this.state.allData.suite_name ? ">" : ""}</div>
                    <div className="breadcrumbs-items">{this.state.allData.suite_name ? this.state.allData.suite_name : ""}</div>
                  </div>
                </div>
                <div className="filter-panel-information-container">
                  <div className="filter-panel-information-text">
                    Total
                    {this.state.allData.testsessionexecutions ? ` ${this.state.allData.testsessionexecutions.length} ` : " 0 "}
                    Reports
                  </div>

                  {this.state.allData.suite_name ? (
                    <div className="filter-panel-information-uri animated zoomIn faster">
                      <div className="filter-panel-information-uri-big">{this.state.allData.suite_name}</div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <Row gutter={16} className="reports-container">
                  <Col className="gutter-row" span={4}>
                    <div className="gutter-box">
                      <h3>Total Testcases</h3>
                      <div className="report-divider" />
                      <div className="test-counts">
                        <i className="far fa-window-restore fa-lg" style={{ fontSize: 15, color: "#40739e" }}></i>
                        <span className="test-counts-val">{this.state.test_fail + this.state.test_pass}</span>
                      </div>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className="gutter-box">
                      <h3>Passed Tests</h3>
                      <div className="report-divider" />
                      <div className="test-counts">
                        <i className="fas fa-check-circle fa-lg" style={{ fontSize: 15, color: "#2ecc71" }}></i>
                        <span className="test-counts-val">{this.state.test_pass}</span>
                      </div>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className="gutter-box">
                      <h3>Failed Tests</h3>
                      <div className="report-divider" />
                      <div className="test-counts">
                        <i className="fas fa-exclamation-triangle fa-lg" style={{ fontSize: 15, color: "#ff6b6b" }}></i>
                        <span className="test-counts-val">{this.state.test_fail}</span>
                      </div>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      <h3>Total Time Taken</h3>
                      <div className="report-divider" />
                      <div className="test-counts">
                        <i className="far fa-clock fa-lg" style={{ fontSize: 15, color: "#0abde3" }}></i>
                        <span className="test-counts-val">{!!this.state.total_execution_time ? this.state.total_execution_time : "00:00"}</span>
                      </div>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className="gutter-box">
                      <h3>Pass Percentage</h3>
                      <div className="report-divider" />
                      <div className="test-counts progress-box">
                        <Progress strokeColor="#2ecc71" strokeWidth={8} percent={this.state.pass_percentage} />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16} className="reports-container">
                  <Col className="gutter-row" span={8}>
                    <div className="gutter-box">
                      <div className="chart-header">
                        <h3>Tests View</h3>
                        <div className="report-divider" />
                      </div>
                      <div className="tests-info-container">
                        <div className="chart-view">
                          <ReactEcharts
                            option={options}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                            onChartReady={this.onChartReadyCallback}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <div className="gutter-box table-view">
                      <div className="chart-header">
                        <h3>Tests Logs</h3>
                        <div className="report-divider" />
                      </div>
                      <div>
                        <Table className="" dataSource={this.state.filteredData} columns={columns} pagination={{ pageSize: 5 }} rowKey="id" />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
              <div
                onClick={context.toggelSidebar}
                style={context.state.smallSidebar ? { left: "56px" } : {}}
                className="dashboard-sidebar-select-button"
              >
                <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
              </div>
            </div>
            <ReportLogsModal
              LogsReportModal={this.state.LogsReportModal}
              modal_type={this.state.modal_type}
              case_status={this.state.case_status}
              expand={this.state.expand}
              row_data={this.state.row_data}
              onExpand={() => this.setState({ expand: !this.state.expand })}
              LogsReportData={this.state.LogsReportData}
              onHide={() => this.setState({ LogsReportModal: false, LogsReportData: [], row_data: {}, modal_type: "", expand: false })}
            />
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
