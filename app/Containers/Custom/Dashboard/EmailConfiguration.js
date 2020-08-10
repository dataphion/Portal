import React, { Component } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/Header";
import Loader from "../../../Components/Loader";
import { Alert, Whisper, Tooltip } from "rsuite";
import constants from "../../../constants";
import { Context } from "../../Context";
import _ from "lodash";
import { Table, Row, Col, Divider, Progress, Form, Input } from "antd";
import moment from "moment";
import "../../../Assets/Styles/Custom/Dashboard/Reports.scss";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";

const EmailConfiguration = Form.create()(
  class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        tags: [],
        recipientsEmailErr: false,
        smtpDetails: {},
      };
    }

    componentWillMount() {
      this.loadConfiguration();
    }

    loadConfiguration = () => {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{
          applications(
            where: {
              user: { id: "${sessionStorage.getItem("id")}"},
              id: "${window.location.pathname.split("/")[2]}"
            }
          ) {
            smtpdetail{
              id,
              hostname,
              port,
              username,
              password,
              recipients
            }
          }
        }`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (!!response.data.applications[0].smtpdetail) {
            let smtpDetails = {
              id: response.data.applications[0].smtpdetail.id,
              hostname: response.data.applications[0].smtpdetail.hostname,
              port: response.data.applications[0].smtpdetail.port,
              username: response.data.applications[0].smtpdetail.username,
              password: response.data.applications[0].smtpdetail.password,
            };

            this.setState({ smtpDetails: smtpDetails, tags: response.data.applications[0].smtpdetail.recipients.split(",") });
          }
        });
    };

    handleChange = (tags) => {
      this.setState({ tags, recipientsEmailErr: false });
    };

    saveSmtp = async () => {
      // this.setState({ loader: true });
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (this.state.tags.length < 1) {
          this.setState({ recipientsEmailErr: true });
          return Alert.warning("Please fill required fields.");
        }
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }

      const payload = {
        hostname: form.getFieldValue("hostname"),
        port: form.getFieldValue("port"),
        username: form.getFieldValue("username"),
        password: form.getFieldValue("password"),
        recipients: this.state.tags.join(),
        application: window.location.pathname.split("/")[2],
        user: sessionStorage.getItem("id"),
      };

      let url = constants.smtpdetails;
      let method = "POST";
      if (!(Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object)) {
        url = `${constants.smtpdetails}/${this.state.smtpDetails.id}`;
        method = "PUT";
      }
      let smtp = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      await smtp.json();
      if (smtp.ok) {
        this.loadConfiguration();
        Alert.success("SMTP details saved successfully");
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;
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
                      <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/settings`} className="breadcrumbs-items">
                        Settings
                      </Link>
                      <div className="breadcrumbs-items">></div>
                      <div className="breadcrumbs-items">Configuration</div>
                    </div>
                  </div>
                  <div className="details-container">
                    <Form layout="vertical">
                      <div className="form-row-flex">
                        <Form.Item label="Hostname">
                          {getFieldDecorator("hostname", {
                            rules: [{ required: true }],
                            initialValue:
                              Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object
                                ? ""
                                : this.state.smtpDetails.hostname,
                          })(<Input placeholder="Eg. my.smtp.host" />)}
                        </Form.Item>

                        <Form.Item label="Port">
                          {getFieldDecorator("port", {
                            rules: [{ required: true }],
                            initialValue:
                              Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object
                                ? ""
                                : this.state.smtpDetails.port,
                          })(<Input placeholder="Eg. 465" />)}
                        </Form.Item>
                      </div>
                      <div className="form-row-flex">
                        <Form.Item label="Username">
                          {getFieldDecorator("username", {
                            rules: [{ required: true }],
                            initialValue:
                              Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object
                                ? ""
                                : this.state.smtpDetails.username,
                          })(<Input placeholder="Eg. user@gmail.com" />)}
                        </Form.Item>

                        <Form.Item label="Password">
                          {getFieldDecorator("password", {
                            rules: [{ required: true }],
                            initialValue:
                              Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object
                                ? ""
                                : this.state.smtpDetails.password,
                          })(<Input type="password" placeholder="password" />)}
                        </Form.Item>
                      </div>
                      <div className="form-row-flex input-tag-container">
                        {/* <Form.Item label="Recipients">
                          {getFieldDecorator("recipient", {
                            rules: [{ required: true }]
                            // initialValue: this.state.existing_response.suite_name ? this.state.existing_response.suite_name : ""
                          })(<Input placeholder="Eg. user@gmail.com" />)}
                        </Form.Item> */}
                        <div className="recipients-label">
                          <span style={{ color: "red", fontSize: "13px", fontWeight: 600, marginTop: "-2px" }}>*</span>Recipients
                        </div>
                        <TagsInput
                          placeholder="add recipients emails"
                          className={this.state.recipientsEmailErr ? "tags-input recipients-err" : "tags-input"}
                          value={this.state.tags}
                          onChange={this.handleChange}
                        />
                      </div>
                      <div className="form-row-flex button-container">
                        {Object.entries(this.state.smtpDetails).length === 0 && this.state.smtpDetails.constructor === Object ? (
                          <div onClick={() => this.saveSmtp()} className="positive-button save-btn">
                            <i className="fa fa-save" />
                            Save
                          </div>
                        ) : (
                          <div onClick={() => this.saveSmtp()} className="positive-button save-btn">
                            <i className="fa fa-save" />
                            Update
                          </div>
                        )}
                      </div>
                    </Form>
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
            </React.Fragment>
          )}
        </Context.Consumer>
      );
    }
  }
);

export default EmailConfiguration;
