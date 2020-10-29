import React, { Component } from "react";
import { Form } from "antd";
import { Context } from "../../Context";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import Header from "../../../Components/Header";
import { Link } from "react-router-dom";
import { Row, Col } from "rsuite";

const ApiDemo = Form.create()(
  class extends React.Component {
    constructor(props) {
      console.log("api demo");
      super(props);
      this.state = {};
    }

    render() {
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
                      <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/demo`} className="breadcrumbs-items">
                        Demonstration
                      </Link>
                      <div className="breadcrumbs-items">></div>
                      <div className="breadcrumbs-items">API Testcase</div>
                    </div>
                  </div>

                  <div className="details-container" style={{ backgroundColor: "#f8fafb" }}>
                    <Row>
                      <Col>
                        <div className="swagger-sample-container">
                          <span className="row-title">Download sample Swagger File</span>
                          <div className="positive-button">Download</div>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div className="swagger-sample-container">
                          <span className="row-title">Download sample Collection File</span>
                          <div className="positive-button">Download</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </Context.Consumer>
      );
    }
  }
);

export default ApiDemo;

// export default class ApiDemo extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }

//   render() {
//     return <div>api demo</div>;
//   }
// }
