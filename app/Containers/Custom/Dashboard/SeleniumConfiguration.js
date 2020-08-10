import React, { Component } from "react";
import { Form, Input } from "antd";
import { Context } from "../../Context";
import { Link } from "react-router-dom";
import { Alert } from "rsuite";
import constants from "../../../constants";

import DashboardSidebar from "../../../Components/DashboardSidebar";
import Header from "../../../Components/Header";

const SeleniumConfiguration = Form.create()(
  class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        selenium_details: {}
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
      })
        .then(response => response.json())
        .then(response => {
          if (!!response.data.applications[0].selenium_configure) {
            let selenium_details = {
              id: response.data.applications[0].selenium_configure.id,

              host: response.data.applications[0].selenium_configure.host,
              port: response.data.applications[0].selenium_configure.port
            };

            this.setState({
              selenium_details: selenium_details
            });
          }
        });
    };

    SeleniumConfigure = async () => {
      const form = this.props.form;
      form.validateFields(err => {
        if (err) {
          return Alert.warning("Please fill required fields.");
        }
      });
      const payload = {
        host: form.getFieldValue("host"),
        port: form.getFieldValue("port"),
        application: window.location.pathname.split("/")[2],
        user: sessionStorage.getItem("id")
      };

      let url = constants.seleniumConfigure;
      let method = "POST";
      if (!(Object.entries(this.state.selenium_details).length === 0 && this.state.selenium_details.constructor === Object)) {
        url = `${constants.seleniumConfigure}/${this.state.selenium_details.id}`;
        method = "PUT";
      }

      let seleniumAdress = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      await seleniumAdress.json();
      if (seleniumAdress.ok) {
        // this.loadConfiguration();
        Alert.success("selenium details saved successfully");
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;

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
                      <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/settings`} className="breadcrumbs-items">
                        Settings
                      </Link>
                      <div className="breadcrumbs-items">></div>
                      <div className="breadcrumbs-items"> Selenium Configuration</div>
                    </div>
                  </div>
                  <div className="details-container">
                    <Form layout="vertical">
                      <div className="form-row-flex">
                        <Form.Item label="Host">
                          {getFieldDecorator("host", {
                            rules: [{ required: true }],
                            initialValue: Object.entries(this.state.selenium_details).length === 0 && this.state.selenium_details.constructor === Object ? "" : this.state.selenium_details.host
                          })(<Input placeholder="Eg. localhost" />)}
                        </Form.Item>

                        <Form.Item label="Port">
                          {getFieldDecorator("port", {
                            rules: [{ required: true }],
                            initialValue: Object.entries(this.state.selenium_details).length === 0 && this.state.selenium_details.constructor === Object ? "" : this.state.selenium_details.port
                          })(<Input placeholder="Eg. 4444" />)}
                        </Form.Item>
                      </div>
                      <div className="form-row-flex button-container">
                        {Object.entries(this.state.selenium_details).length === 0 && this.state.selenium_details.constructor === Object ? (
                          <div onClick={() => this.SeleniumConfigure()} className="positive-button save-btn">
                            <i className="fa fa-save" />
                            Save
                          </div>
                        ) : (
                          <div onClick={() => this.SeleniumConfigure()} className="positive-button save-btn">
                            <i className="fa fa-save" />
                            Update
                          </div>
                        )}
                      </div>
                    </Form>
                  </div>
                </div>

                <div onClick={context.toggelSidebar} style={context.state.smallSidebar ? { left: "56px" } : {}} className="dashboard-sidebar-select-button">
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

export default SeleniumConfiguration;
