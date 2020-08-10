import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../../Assets/Styles/Custom/Dashboard/Settings.scss";
import { Row, Col } from "antd";
const smtp_image = require("../../../Assets/Images/mail.svg");
const sel_image = require("../../../Assets/Images/selenium.svg");
export default class Reports extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  Configure = () => {

    this.props.parentData.history.push(`${window.location.pathname}/configuration`);
  };

  SeleniumConfigure = () => {
    this.props.parentData.history.push(`${window.location.pathname}/selenium-configuration`);
  };

  render() {
    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items"></div>
              <div className="breadcrumbs-items">SETTINGS</div>
            </div>
            <div className="filter-panel-right-part" />
          </div>
          <div className="testcases-body settings-container">
            <Row gutter={16} style={{ width: "100%" }}>
              <Col className="gutter-row" span={6}>
                <div className="setting-card" style={{ minHeight: "320px" }}>
                  <div className="setting-card-top">
                    <img src={smtp_image} alt="smtp image" height="120px" width="120px" />
                    <div className="text-view">
                      <p>Configure SMTP server and send mails, add email accounts and manage</p>
                    </div>
                  </div>
                  <div onClick={() => this.Configure()} className="negative-button">
                    Configure
                  </div>
                </div>
              </Col>
              <Col className="gutter-row" span={6}>
                <div className="setting-card" style={{ minHeight: "320px" }}>
                  <div className="setting-card-top">
                    <img src={sel_image} alt="smtp image" height="120px" width="120px" />
                    <div className="text-view">
                      <p>Configure Your Selenium server</p>
                    </div>
                  </div>
                  <div onClick={() => this.SeleniumConfigure()} className="negative-button">
                    Configure
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
