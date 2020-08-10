import React from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/Header";
import Loader from "../../../Components/Loader";
import { Alert, Whisper, Tooltip } from "rsuite";
import constants from "../../../constants";
import { Context } from "../../Context";
import _ from "lodash";
import { Table } from "antd";
import moment from "moment";
import "../../../Assets/Styles/Custom/Dashboard/Reports.scss";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import ReportLogsModal from "../../../Components/ReportLogsModal";
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
          testsessionexecutions{id,start_time,end_time,total_pass,total_fail,testcaseexecutions{id,status,flowsteps{
            id,name,status_code,action,request,response,conditions_result,source_result, description, objectrepository{id,page_url,thumbnail_url,highlighted_image_url, url}}type,start_time,end_time,testcase{id,name}}}}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        let row = [];
        let test_pass = 0;
        let test_fail = 0;
        for (let data of response.data.applications[0]["testsuites"][0]["testsessionexecutions"]) {
          for (let testcaseexecutions of data["testcaseexecutions"]) {
            let start_time = moment(testcaseexecutions.start_time).format("YYYY/MM/DD HH:mm:ss");
            let end_time = moment(testcaseexecutions.end_time).format("YYYY/MM/DD HH:mm:ss");
            if (testcaseexecutions["status"] === "completed") {
              test_pass += 1;
            } else {
              test_fail += 1;
            }
            let ms = moment(end_time, "YYYY/MM/DD HH:mm:ss").diff(moment(start_time, "YYYY/MM/DD HH:mm:ss"));
            let d = moment.duration(ms);
            let s = Math.floor(d.asHours()) + "hr " + Math.floor(d.asMinutes()) + "min " + moment.utc(ms).format("ss") + "sec";
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
        this.setState({
          loader: false,
          allData: response.data.applications[0]["testsuites"][0],
          filteredData: row,
          test_fail: test_fail,
          test_pass: test_pass,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  render() {
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
      // {
      //   title: "Testcase Name",
      //   dataIndex: "testcase_name",
      //   key: "testcase_name"
      // },
      {
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
      },
      {
        title: "Start time",
        dataIndex: "start_time",
        key: "start_time",
      },
      {
        title: "End time",
        dataIndex: "end_time",
        key: "end_time",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        className: "table-first-column",
        render: (type) => (
          <Whisper placement="top" trigger="hover" speaker={<Tooltip>{type === "completed" ? "PASS" : "FAIL"}</Tooltip>}>
            <i
              className={"fa " + (type === "completed" ? "fa-check" : "fa-times")}
              style={type === "completed" ? { color: "#1dd1a1" } : { color: "#ff6b6b" }}
            />
          </Whisper>
        ),
      },
      {
        title: "Logs",
        dataIndex: "Logs",
        key: "Logs",
        className: "table-first-column",
        render: (data, record) => (
          <Whisper placement="top" trigger="hover" speaker={<Tooltip>Logs</Tooltip>}>
            <i
              className="fa fa-file-text report-logs-container"
              onClick={() => {
                this.setState({ LogsReportData: data, LogsReportModal: true, modal_type: record.type, case_status: record.status });
              }}
            />
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
                    <div className="breadcrumbs-items">></div>
                    <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/reports`} className="breadcrumbs-items">
                      REPORT
                    </Link>
                    <div className="breadcrumbs-items">{this.state.allData.suite_name ? ">" : ""}</div>
                    <div className="breadcrumbs-items">{this.state.allData.suite_name ? this.state.allData.suite_name : ""}</div>
                  </div>
                  <div className="filter-panel-right-part">
                    <div className="status-button status-negative">
                      <i className="fa fa-close" />
                      {this.state.test_fail} FAIL
                    </div>
                    <div className="status-button status-pass">
                      <i className="fa fa-check" />
                      {this.state.test_pass} PASS
                    </div>
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

                <div className="testcases-body">
                  <Table
                    className="testcases-table table-width-reports"
                    dataSource={this.state.filteredData}
                    columns={columns}
                    pagination={{
                      pageSize: document.getElementsByClassName("ant-table-wrapper")[0]
                        ? Math.ceil(document.getElementsByClassName("ant-table-wrapper")[0].offsetHeight / 40 - 3)
                        : 10,
                    }}
                    rowKey="id"
                  />
                </div>
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
              onExpand={() => this.setState({ expand: !this.state.expand })}
              LogsReportData={this.state.LogsReportData}
              onHide={() => this.setState({ LogsReportModal: false, LogsReportData: [], modal_type: "", expand: false })}
            />
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
