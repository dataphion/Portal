import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../Context";
import Header from "../../../Components/Header";
import constants from "../../../constants";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import JSONTree from "react-json-tree";
import { Collapse, Row, Col } from "antd";
import Lightbox from "react-image-lightbox";

export default class ReportsErrorLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogs: false,
      expand: false,
      isOpen: false,
      highlighted_image_type: "",
      highlighted_image_url: "",
      expand_api: false
    };
  }

  componentWillMount() {
    if (!this.props.location.logs_data) {
      this.props.history.push(`/dashboard/${window.location.pathname.split("/")[2]}/reports/reportSteps/${window.location.pathname.split("/")[5]}/${window.location.pathname.split("/")[6]}`);
    }
  }

  render() {
    const { row_data, logs_report_data, modal_type, case_status, suite_name } = this.props.location.logs_data;

    return (
      <Context.Consumer>
        {context => (
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
                    <div className="breadcrumbs-items">{!!suite_name ? ">" : ""}</div>
                    <Link
                      to={`/dashboard/${window.location.pathname.split("/")[2]}/reports/reportSteps/${window.location.pathname.split("/")[5]}/${window.location.pathname.split("/")[6]}`}
                      className="breadcrumbs-items"
                    >
                      {!!suite_name ? suite_name : ""}
                    </Link>
                    <div className="breadcrumbs-items">></div>
                    <div className="breadcrumbs-items">Logs</div>
                  </div>
                </div>
                <div className="filter-panel-information-container">
                  <div>
                    <div className="filter-panel-information-text">
                      Status <span className={row_data.status === "failed" ? "failed-clss" : "success-cls"}>{`${row_data.status.charAt(0).toUpperCase() + row_data.status.slice(1)}`}</span>
                    </div>
                    <div className="filter-panel-information-text">
                      Testcase Type <span className="testcase-type">{row_data.type.toUpperCase()}</span>
                    </div>
                  </div>
                  {row_data.testcase_name ? (
                    <div className="filter-panel-information-uri animated zoomIn faster">
                      <div className="filter-panel-information-uri-big">{row_data.testcase_name}</div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div>
                  <div>
                    {logs_report_data.length > 0 ? (
                      <div className="show-testcase-status">
                        <div>
                          {modal_type === "ui" ? (
                            <div className="header-box">
                              <div className="testcase-info">
                                <div className="url-info">
                                  <span className="label-header">Launched url</span>
                                  <span className="url-value">{logs_report_data[0].objectrepository.url}</span>
                                </div>
                                {/* <div className="url-info">
                                  <span className="label-header">Status</span>
                                  <span className={case_status !== "completed" ? "url-value failed-text" : "url-value success-text"}>{case_status !== "completed" ? "Failed" : "Success"}</span>
                                </div> */}
                              </div>
                              {/* <div className="url-info"> */}
                              {row_data.type === "ui" ? (
                                <div onClick={() => this.setState({ showLogs: !this.state.showLogs })} className="negative-button show-logs">
                                  {this.state.showLogs ? "Show error" : "All steps"}
                                </div>
                              ) : (
                                ""
                              )}
                              {/* </div> */}
                            </div>
                          ) : (
                            ""
                          )}

                          {modal_type === "ui" && !this.state.showLogs ? (
                            <div className="error-log-container">
                              <div className="error-info">
                                <div className="info-row">
                                  <span className="info-header">Type </span>
                                  <span className="info-i"> {row_data.type.toUpperCase()}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">Test case </span>
                                  <span className="info-i"> {!!row_data.testcase_name ? row_data.testcase_name : "----"}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">URL </span>
                                  <span className="info-i">
                                    {" "}
                                    {!!logs_report_data[logs_report_data.length - 1].objectrepository.url ? logs_report_data[logs_report_data.length - 1].objectrepository.url : "----"}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">action </span>
                                  <span className="info-i"> {!!logs_report_data[logs_report_data.length - 1].action ? logs_report_data[logs_report_data.length - 1].action : "----"}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">Description </span>
                                  <span className="info-i"> {!!logs_report_data[logs_report_data.length - 1].description ? logs_report_data[logs_report_data.length - 1].description : "----"}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">Duration </span>
                                  <span className="info-i"> {!!row_data.duration ? row_data.duration : "----"}</span>
                                </div>

                                <div className="info-row">
                                  <span className="info-header">Failed Step </span>
                                  <span className="info-i"> {logs_report_data.length}</span>
                                </div>
                                <div className="info-row">
                                  <span className="info-header">Error </span>
                                  <span className="info-i failed-text">
                                    {" "}
                                    {!!logs_report_data[logs_report_data.length - 1].error_log ? logs_report_data[logs_report_data.length - 1].error_log : "----"}
                                  </span>
                                </div>
                              </div>
                              <div className="error-step-image">
                                <div className="img-container">
                                  <img
                                    className="img report-img"
                                    width="100%"
                                    height="100%"
                                    src={
                                      !!logs_report_data[logs_report_data.length - 1].error_view_id
                                        ? `${constants.error_image_host}${logs_report_data[logs_report_data.length - 1].error_view_id[0].url}`
                                        : require("../../../Assets/Images/blank.png")
                                    }
                                  ></img>
                                </div>
                              </div>
                            </div>
                          ) : modal_type === "api" ? (
                            <div>
                              {/* <JSONTree hideRoot="true" data={logs_report_data} /> */}
                              <div className="steps-header-row">
                                <Row className="steps-header">
                                  <Col span={6}>STEPS</Col>
                                  <Col span={6}>URL</Col>
                                  <Col span={6}>METHOD</Col>
                                  {/* <Col span={6}>PARAMS</Col> */}
                                  {/* <Col span={6}>HEADERS</Col> */}
                                  <Col span={6}>STATUS</Col>
                                </Row>
                                {logs_report_data.map((data, index) => {
                                  if (case_status !== "completed") {
                                    if (logs_report_data.length === index + 1) {
                                      return (
                                        <Row
                                          key={index}
                                          className={index % 2 === 0 ? "steps-col odd-col failed-border" : "steps-col even-col failed-border"}
                                          onClick={() => this.setState({ expand_api: !this.state.expand_api })}
                                        >
                                          <Col className="cell-text" span={6}>
                                            STEP : {index + 1}
                                          </Col>
                                          <Col className="cell-text" span={6}>
                                            {!!data.request ? data.request.url : "---"}
                                          </Col>
                                          <Col className="cell-text" span={6}>
                                            {!!data.request ? data.request.method : "---"}
                                          </Col>
                                          <Col span={6}>
                                            <i className={this.state.expand_api ? "fa fa-angle-right fa-2x rotate-icon" : "fa fa-close fa-lg rotate-back"} style={{ color: "#e74c3c" }}></i>
                                          </Col>
                                        </Row>
                                      );
                                    } else {
                                      return (
                                        <Row key={index} className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"}>
                                          <Col className="cell-text" span={6}>
                                            STEP : {index + 1}
                                          </Col>
                                          <Col className="cell-text" span={6}>
                                            {!!data.request ? data.request.url : "---"}
                                          </Col>
                                          <Col className="cell-text" span={6}>
                                            {!!data.request ? data.request.method : "---"}
                                          </Col>
                                          <Col span={6}>
                                            <i className="fa fa-check fa-lg" style={{ color: "#2ecc71" }} />
                                          </Col>
                                        </Row>
                                      );
                                    }
                                  } else {
                                    return (
                                      <Row className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"} key={index}>
                                        <Col className="cell-text" span={6}>
                                          STEP : {index + 1}
                                        </Col>
                                        <Col className="cell-text" span={6}>
                                          {!!data.request ? data.request.url : "---"}
                                        </Col>
                                        <Col className="cell-text" span={6}>
                                          {!!data.request ? data.request.method : "---"}
                                        </Col>
                                        <Col span={6}>
                                          <i className="fa fa-check fa-lg" style={{ color: "#2ecc71" }} />
                                        </Col>
                                      </Row>
                                    );
                                  }
                                })}

                                {this.state.expand_api ? (
                                  <div>
                                    <div className="collapse-box">
                                      <div className="step-info">
                                        <div className="info-row">
                                          <span className="info-header api-h">Type </span>
                                          <span className="info-i"> {modal_type}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Testcase name </span>
                                          <span className="info-i"> {!!row_data.testcase_name ? row_data.testcase_name : "----"}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Status code </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].status_code ? logs_report_data[logs_report_data.length - 1].status_code : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">URL </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].request ? logs_report_data[logs_report_data.length - 1].request.url : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Method </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].request ? logs_report_data[logs_report_data.length - 1].request.method : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Headers </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].request ? logs_report_data[logs_report_data.length - 1].request.headers : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Duration </span>
                                          <span className="info-i"> {!!row_data.duration ? row_data.duration : "----"}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Failed Step </span>
                                          <span className="info-i"> {logs_report_data.length}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header api-h">Status </span>
                                          <span className="info-i failed-text"> Failed</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  ""
                                )}

                                {this.state.expand ? (
                                  <div>
                                    <div className="collapse-box">
                                      <div className="step-info">
                                        <div className="info-row">
                                          <span className="info-header">action </span>
                                          <span className="info-i"> {!!logs_report_data[logs_report_data.length - 1].action ? logs_report_data[logs_report_data.length - 1].action : "----"}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">Description </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].description ? logs_report_data[logs_report_data.length - 1].description : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">URL </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].objectrepository.url ? logs_report_data[logs_report_data.length - 1].objectrepository.url : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">Status </span>
                                          <span className="info-i failed-text"> Failed</span>
                                        </div>
                                      </div>
                                      <div className="img-container">
                                        <img
                                          onClick={() => {
                                            if (!!logs_report_data[logs_report_data.length - 1].error_view_id) {
                                              this.setState({
                                                isOpen: true,
                                                highlighted_image_url: `${constants.error_image_host}${logs_report_data[logs_report_data.length - 1].error_view_id[0].url}`,
                                                highlighted_image_type: "Highlighted image"
                                              });
                                            }
                                          }}
                                          className="img report-img"
                                          width="35%"
                                          height="100%"
                                          src={
                                            !!logs_report_data[logs_report_data.length - 1].error_view_id
                                              ? `${constants.error_image_host}${logs_report_data[logs_report_data.length - 1].error_view_id[0].url}`
                                              : require("../../../Assets/Images/blank.png")
                                          }
                                        ></img>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="steps-header-row">
                                <Row className="steps-header">
                                  <Col span={8}>STEPS</Col>
                                  <Col span={8}>ACTION</Col>
                                  <Col span={8}>STATUS</Col>
                                </Row>
                                {logs_report_data.map((data, index) => {
                                  if (case_status !== "completed") {
                                    if (logs_report_data.length === index + 1) {
                                      return (
                                        <Row
                                          key={index}
                                          className={index % 2 === 0 ? "steps-col odd-col failed-border" : "steps-col even-col failed-border"}
                                          onClick={() => this.setState({ expand: !this.state.expand })}
                                        >
                                          <Col className="cell-text" span={8}>
                                            STEP : {index + 1}
                                          </Col>
                                          <Col className="cell-text" span={8}>
                                            {data.action}
                                          </Col>
                                          <Col span={8}>
                                            <i className={this.state.expand ? "fa fa-angle-right fa-2x rotate-icon" : "fa fa-close fa-lg rotate-back"} style={{ color: "#e74c3c" }}></i>
                                          </Col>
                                        </Row>
                                      );
                                    } else {
                                      return (
                                        <Row key={index} className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"}>
                                          <Col className="cell-text" span={8}>
                                            STEP : {index + 1}
                                          </Col>
                                          <Col className="cell-text" span={8}>
                                            {data.action}
                                          </Col>
                                          <Col span={8}>
                                            <i className="fa fa-check fa-lg" style={{ color: "#2ecc71" }} />
                                          </Col>
                                        </Row>
                                      );
                                    }
                                  } else {
                                    return (
                                      <Row key={index} className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"}>
                                        <Col className="cell-text" span={8}>
                                          STEP : {index + 1}
                                        </Col>
                                        <Col className="cell-text" span={8}>
                                          {data.action}
                                        </Col>
                                        <Col span={8}>
                                          <i className="fa fa-check fa-lg" style={{ color: "#2ecc71" }} />
                                        </Col>
                                      </Row>
                                    );
                                  }
                                })}

                                {this.state.expand ? (
                                  <div>
                                    <div className="collapse-box">
                                      <div className="step-info">
                                        <div className="info-row">
                                          <span className="info-header">action </span>
                                          <span className="info-i"> {!!logs_report_data[logs_report_data.length - 1].action ? logs_report_data[logs_report_data.length - 1].action : "----"}</span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">Description </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].description ? logs_report_data[logs_report_data.length - 1].description : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">URL </span>
                                          <span className="info-i">
                                            {" "}
                                            {!!logs_report_data[logs_report_data.length - 1].objectrepository.url ? logs_report_data[logs_report_data.length - 1].objectrepository.url : "----"}
                                          </span>
                                        </div>
                                        <div className="info-row">
                                          <span className="info-header">Status </span>
                                          <span className="info-i failed-text"> Failed</span>
                                        </div>
                                      </div>
                                      <div className="img-container">
                                        <img
                                          onClick={() => {
                                            if (!!logs_report_data[logs_report_data.length - 1].error_view_id) {
                                              this.setState({
                                                isOpen: true,
                                                highlighted_image_url: `${constants.error_image_host}${logs_report_data[logs_report_data.length - 1].error_view_id[0].url}`,
                                                highlighted_image_type: "Highlighted image"
                                              });
                                            }
                                          }}
                                          className="img report-img"
                                          width="35%"
                                          height="100%"
                                          src={
                                            !!logs_report_data[logs_report_data.length - 1].error_view_id
                                              ? `${constants.error_image_host}${logs_report_data[logs_report_data.length - 1].error_view_id[0].url}`
                                              : require("../../../Assets/Images/blank.png")
                                          }
                                        ></img>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div onClick={context.toggelSidebar} style={context.state.smallSidebar ? { left: "56px" } : {}} className="dashboard-sidebar-select-button">
                <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
              </div>
              {this.state.isOpen ? (
                <Lightbox
                  mainSrc={this.state.highlighted_image_url}
                  imageTitle={this.state.highlighted_image_type}
                  onCloseRequest={() =>
                    this.setState({
                      highlighted_image_url: "",
                      isOpen: false
                    })
                  }
                />
              ) : (
                ""
              )}
            </div>
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
