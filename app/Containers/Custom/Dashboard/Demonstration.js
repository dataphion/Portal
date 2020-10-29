import React from "react";
import { Link } from "react-router-dom";
import "../../../Assets/Styles/Custom/Dashboard/Settings.scss";
import { Row, Col } from "antd";
const smtp_image = require("../../../Assets/Images/test.svg");
const sel_image = require("../../../Assets/Images/selenium.svg");

class Demonstration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  Configure = (e, type) => {
    console.log(type);
    if (type === "apidemo") {
      this.props.parentData.history.push(`${window.location.pathname}/api-demo`);
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">Demonstration</div>
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
                      <p>Check the Demonstration of API Testcase</p>
                    </div>
                  </div>
                  <div name="apidemo" onClick={(e) => this.Configure(e, "apidemo")} className="negative-button">
                    Demo
                  </div>
                </div>
              </Col>
              {/* <Col className="gutter-row" span={6}>
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
              </Col> */}
            </Row>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Demonstration;
