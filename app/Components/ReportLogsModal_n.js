import React from "react";
import { Modal } from "rsuite";
import constants from "../constants";
import JSONTree from "react-json-tree";
import { Collapse, Row, Col } from "antd";
const { Panel } = Collapse;
import Lightbox from "react-image-lightbox";

export default class ReportLogsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      highlighted_image_type: "",
      highlighted_image_url: "",
      showLogs: false
      // expand: false
    };
  }

  render() {
    return (
      <Modal full show={this.props.LogsReportModal} onHide={this.props.onHide}>
        <Modal.Header closeButton={false} className="modal-fixed-header">
          <div className="modal-container-with-button">
            <div className="meta-data-modal-header-title">Logs</div>
            <div className="sr-form-footer-btn-container">
              {this.props.row_data.type === "ui" ? (
                <div onClick={() => this.setState({ showLogs: !this.state.showLogs })} className="negative-button show-logs">
                  {this.state.showLogs ? "Error Log" : "All steps"}
                </div>
              ) : (
                ""
              )}
              <div onClick={this.props.onHide} className="negative-button">
                <i className="fa fa-close" /> Hide
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {this.props.LogsReportData.length > 0 ? (
            <div className="show-testcase-status">
              <div>
                <div className="testcase-info">
                  <div className="url-info">
                    <span className="label-header">Launched url</span>
                    <span className="url-value">{this.props.LogsReportData[0].objectrepository.url}</span>
                  </div>
                  <div className="url-info">
                    <span className="label-header">Status</span>
                    <span className={this.props.case_status !== "completed" ? "url-value failed-text" : "url-value success-text"}>{this.props.case_status !== "completed" ? "Failed" : "Success"}</span>
                  </div>
                </div>
                {this.props.modal_type === "ui" && !this.state.showLogs ? (
                  <div className="error-log-container">
                    <div className="error-info">
                      <div className="info-row">
                        <span className="info-header">Type </span>
                        <span className="info-i"> {this.props.row_data.type.toUpperCase()}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">Test case </span>
                        <span className="info-i"> {!!this.props.row_data.testcase_name ? this.props.row_data.testcase_name : "----"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">URL </span>
                        <span className="info-i">
                          {" "}
                          {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.url
                            ? this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.url
                            : "----"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">action </span>
                        <span className="info-i">
                          {" "}
                          {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].action ? this.props.LogsReportData[this.props.LogsReportData.length - 1].action : "----"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">Description </span>
                        <span className="info-i">
                          {" "}
                          {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].description ? this.props.LogsReportData[this.props.LogsReportData.length - 1].description : "----"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">Duration </span>
                        <span className="info-i"> {!!this.props.row_data.duration ? this.props.row_data.duration : "----"}</span>
                      </div>

                      <div className="info-row">
                        <span className="info-header">Failed Step </span>
                        <span className="info-i"> {this.props.LogsReportData.length}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-header">Error </span>
                        <span className="info-i failed-text">
                          {" "}
                          {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].error_log ? this.props.LogsReportData[this.props.LogsReportData.length - 1].error_log : "----"}
                        </span>
                      </div>
                    </div>
                    <div className="error-step-image">
                      <div className="img-container">
                        <img
                          className="img report-img"
                          width="100%"
                          height="100%"
                          // src={
                          //   !!this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url
                          //     ? `${constants.image_host}${this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url}`
                          //     : require("../Assets/Images/blank.png")
                          // }
                          src={
                            !!this.props.LogsReportData[this.props.LogsReportData.length - 1].error_view_id
                              ? `${constants.error_image_host}${this.props.LogsReportData[this.props.LogsReportData.length - 1].error_view_id.url}`
                              : require("../Assets/Images/blank.png")
                          }
                        ></img>
                      </div>
                    </div>
                  </div>
                ) : this.props.modal_type === "api" ? (
                  <div>
                    <JSONTree hideRoot="true" data={this.props.LogsReportData} />
                  </div>
                ) : (
                  <div>
                    <div className="steps-header-row">
                      <Row className="steps-header">
                        <Col span={8}>STEPS</Col>
                        <Col span={8}>ACTION</Col>
                        <Col span={8}>STATUS</Col>
                      </Row>
                      {this.props.LogsReportData.map((data, index) => {
                        if (this.props.case_status !== "completed") {
                          if (this.props.LogsReportData.length === index + 1) {
                            return (
                              <Row className={index % 2 === 0 ? "steps-col odd-col failed-border" : "steps-col even-col failed-border"} onClick={this.props.onExpand}>
                                <Col className="cell-text" span={8}>
                                  STEP : {index + 1}
                                </Col>
                                <Col className="cell-text" span={8}>
                                  {data.action}
                                </Col>
                                <Col span={8}>
                                  {/* <i className="fa fa-close fa-lg rotate-icon" style={{ color: "#e74c3c" }} /> */}
                                  <i className={this.props.expand ? "fa fa-angle-right fa-2x rotate-icon" : "fa fa-close fa-lg rotate-back"} style={{ color: "#e74c3c" }}></i>
                                </Col>
                              </Row>
                            );
                          } else {
                            return (
                              <Row className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"}>
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
                            <Row className={index % 2 === 0 ? "steps-col odd-col" : "steps-col even-col"}>
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

                      {this.props.expand ? (
                        <div>
                          <div className="collapse-box">
                            <div className="step-info">
                              <div className="info-row">
                                <span className="info-header">action </span>
                                <span className="info-i">
                                  {" "}
                                  {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].action ? this.props.LogsReportData[this.props.LogsReportData.length - 1].action : "----"}
                                </span>
                              </div>
                              <div className="info-row">
                                <span className="info-header">Description </span>
                                <span className="info-i">
                                  {" "}
                                  {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].description ? this.props.LogsReportData[this.props.LogsReportData.length - 1].description : "----"}
                                </span>
                              </div>
                              <div className="info-row">
                                <span className="info-header">URL </span>
                                <span className="info-i">
                                  {" "}
                                  {!!this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.url
                                    ? this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.url
                                    : "----"}
                                </span>
                              </div>
                              <div className="info-row">
                                <span className="info-header">Status </span>
                                <span className="info-i failed-text"> Failed</span>
                              </div>
                            </div>
                            <div
                              className="img-container"
                              // onClick={() => {
                              //   if (!!this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url) {
                              //     this.setState({
                              //       isOpen: true,
                              //       highlighted_image_url: `${constants.image_host}${this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url}`,
                              //       highlighted_image_type: "Highlighted image"
                              //     });
                              //   }
                              // }}
                            >
                              <img
                                className="img report-img"
                                width="35%"
                                height="100%"
                                // src={
                                //   !!this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url
                                //     ? `${constants.image_host}${this.props.LogsReportData[this.props.LogsReportData.length - 1].objectrepository.highlighted_image_url}`
                                //     : require("../Assets/Images/blank.png")
                                // }
                                src={
                                  !!this.props.LogsReportData[this.props.LogsReportData.length - 1].error_view_id
                                    ? `${constants.error_image_host}${this.props.LogsReportData[this.props.LogsReportData.length - 1].error_view_id.url}`
                                    : require("../Assets/Images/blank.png")
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
        </Modal.Body>
      </Modal>
    );
  }
}
