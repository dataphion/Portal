import React from "react";
import { Modal, Alert, Row, Col } from "rsuite";
import { Form, Input, Select } from "antd";
import constants from "../constants";
import { Context } from "../Containers/Context";
import axios from "axios";
import socketIOClient from "socket.io-client";
const socket = socketIOClient(constants.socket_url);
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/monokai";

const AddTestcaseModal = Form.create()(
  class extends React.Component {
    static contextType = Context;
    state = {
      addNewFeature: false,
      features: [],
      AceEditorValue: [],
      AceEditorValidation: [],
    };

    componentDidMount() {
      this.saveRecord = this.saveRecord.bind(this);
    }

    loadFeatures = () => {
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
          }){features{id, name}}}`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          this.setState({ features: response.data.applications[0].features });
        });
    };

    async saveRecord() {
      const { state } = this.context;
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }

      try {
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
            }){testcases{id, name, type}}}`,
          }),
        })
          .then((response) => response.json())
          .then(async (response) => {
            let testcases = [];
            for (let testcase of response.data.applications[0].testcases) {
              testcases.push(testcase.name.toLowerCase());
            }
            // check if test case already exist
            if (testcases.includes(form.getFieldValue("testcaseName").toLowerCase())) {
              Alert.warning("Testcase name already exist !");
              return;
            } else {
              // Post Feature
              let featureReq = "";
              if (this.state.addNewFeature) {
                const featureData = {
                  name: form.getFieldValue("newFeature"),
                  application: window.location.pathname.split("/")[2],
                };
                featureReq = await axios.post(constants.features, featureData);
              }

              if (this.props.modalTestcaseType === "ui") {
                // Extension Call
                const message = {
                  type: "record",
                  name: form.getFieldValue("testcaseName"),
                  description: form.getFieldValue("testcaseDescription"),
                  app_id: window.location.pathname.split("/")[2],
                  feature_id: this.state.addNewFeature ? featureReq.data.id : form.getFieldValue("feature"),
                  url:
                    form.getFieldValue("url").split("http://")[1] || form.getFieldValue("url").split("https://")[1]
                      ? form.getFieldValue("url")
                      : `http://${form.getFieldValue("url")}`,
                };
                this.triggerExtension(message);
                this.onHide();
              } else if (this.props.modalTestcaseType === "api") {
                const testcaseData = {
                  name: form.getFieldValue("testcaseName"),
                  description: form.getFieldValue("testcaseDescription"),
                  type: "api",
                  application: {
                    id: window.location.pathname.split("/")[2],
                  },
                  feature: {
                    // id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find(o => o.id === form.getFieldValue("feature")).id

                    id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find((o) => o.name === form.getFieldValue("feature")).id,
                  },
                };
                await axios.post(constants.testcases, testcaseData);
                this.props.loadTestcasesData();
                this.onHide();
              } else {
                if (state.connected_agent.length == 0) return Alert.warning("Desktop agent is not connected.");
                const testcaseData = {
                  name: form.getFieldValue("testcaseName"),
                  description: form.getFieldValue("testcaseDescription"),
                  type: "mobile",
                  mobile_platform: state.mobile_platform,
                  capabilities: JSON.parse(state.mobile_capabilities),
                  application: {
                    id: window.location.pathname.split("/")[2],
                  },
                  feature: {
                    id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find((o) => o.name === form.getFieldValue("feature")).id,

                    // id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find(o => o.name === form.getFieldValue("feature")).id
                  },
                  // capabilities: "capabilities"
                  // deviceType:"deviceType",
                  // connectedDevice:"connectedDevice",
                  // installedApplication:"installedApplication"
                };
                let mobile_test = await axios.post(constants.testcases, testcaseData);

                // this.props.loadTestcasesData();
                this.onHide();
                if (mobile_test.status == 200) {
                  this.props.parentData.history.push({
                    pathname: `test-cases/mobile-recorder/${mobile_test.data.id}`,
                    parentData: this.props,
                  });
                }
              }
            }
          });
      } catch (error) {
        Alert.error("Something went wrong");
        console.log(error);
      }
    }

    triggerExtension = (message) => {
      chrome.runtime.sendMessage(constants.extension_id, message, (response) => {
        if (response.status === "success") {
          this.props.parentData.history.push(`${window.location.pathname}/steps/${response.testcase_id}`);
        } else {
          Alert.error("Remote execution failed");
        }
      });
    };

    addFeature = (e) => {
      if (e === "add_new_feature") {
        this.setState({ addNewFeature: true });
      } else {
        this.setState({ addNewFeature: false });
      }
    };

    onHide = () => {
      this.props.onHide();
      this.setState({ addNewFeature: false });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      const { setMobilePlatform, setCapabilities, state } = this.context;
      return (
        <Modal show={this.props.addTestcaseModal} onHide={this.onHide} onEntered={this.loadFeatures} size="lg">
          <Modal.Header>
            <Modal.Title>{this.props.applicationName ? "Update Testcase" : "Create Testcase"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="sr-form-button-container-row" style={{ justifyContent: "center" }}>
              <div
                onClick={() => this.props.modalTestcaseSelected("ui")}
                className={"sr-form-button-container " + (this.props.modalTestcaseType === "ui" ? "sr-form-button-bg" : "")}
              >
                <div
                  className="fa fa-desktop"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "ui" ? "#fff" : "",
                  }}
                />
                <div
                  className={
                    "sr-form-button-title " + (this.props.modalTestcaseType === "ui" ? "sr-form-button-title-white" : "sr-form-button-title-black")
                  }
                >
                  UI
                </div>
              </div>
              <div
                onClick={() => this.props.modalTestcaseSelected("api")}
                className={"sr-form-button-container " + (this.props.modalTestcaseType === "api" ? "sr-form-button-bg" : "")}
              >
                <div
                  className="fa fa-rocket"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "api" ? "#fff" : "",
                  }}
                />
                <div
                  className={
                    "sr-form-button-title " + (this.props.modalTestcaseType === "api" ? "sr-form-button-title-white" : "sr-form-button-title-black")
                  }
                >
                  API
                </div>
              </div>
              <div
                onClick={() => this.props.modalTestcaseSelected("mobile")}
                className={"sr-form-button-container " + (this.props.modalTestcaseType === "mobile" ? "sr-form-button-bg" : "")}
              >
                <div
                  className="fa fa-mobile"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "mobile" ? "#fff" : "",
                  }}
                />
                <div
                  className={
                    "sr-form-button-title " +
                    (this.props.modalTestcaseType === "mobile" ? "sr-form-button-title-white" : "sr-form-button-title-black")
                  }
                >
                  Mobile
                </div>
              </div>
            </div>
            <Form layout="vertical">
              <Row>
                <Col xs={12} className="input-forms">
                  <Form.Item label="Name">
                    {getFieldDecorator("testcaseName", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<Input autoFocus />)}
                  </Form.Item>
                </Col>
                <Col xs={12} className="input-forms">
                  <Form.Item label="Description">
                    {getFieldDecorator("testcaseDescription", {
                      initialValue: "",
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col xs={12} className="input-forms">
                  <Form.Item label="Features">
                    {getFieldDecorator("feature", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: this.props.featureId ? this.props.featureId.name : this.props.featureId,
                    })(
                      <Select onChange={(e) => this.addFeature(e)}>
                        <Select.Option value="add_new_feature">Add New Feature</Select.Option>
                        {this.props.features.map((data, index) => {
                          return (
                            <Select.Option key={index} value={data.id}>
                              {data.name}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                {this.state.addNewFeature ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="New Feature">
                      {getFieldDecorator("newFeature", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: "",
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}
                {this.props.modalTestcaseType === "ui" ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="Url">
                      {getFieldDecorator("url", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.props.applicationUrl ? this.props.applicationUrl : "",
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}
                {/* {this.props.modalTestcaseType === "mobile" ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="Capabilities">
                      {getFieldDecorator("capabilities", {
                        // rules: [
                        //   {
                        //     required: true
                        //   }
                        // ]
                        // initialValue: this.props.applicationUrl ? this.props.applicationUrl : ""
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )} */}

                {this.props.modalTestcaseType === "mobile" ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="Device Type">
                      <Select value={state.mobile_platform} onChange={(e) => setMobilePlatform(e)}>
                        <Option value="IOS">IOS</Option>
                        <Option value="Android">Android</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}

                {this.props.modalTestcaseType === "mobile" ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="Device Capabilities">
                      <AceEditor
                        className="animated fadeIn"
                        mode={"json"}
                        theme="monokai"
                        onValidate={(e) => this.setState({ AceEditorValidation: e })}
                        onChange={(value) => setCapabilities(value)}
                        fontSize={14}
                        showPrintMargin={true}
                        showGutter={true}
                        highlightActiveLine={true}
                        style={{ width: "100%", height: "150px", borderRadius: "10px" }}
                        value={`${state.mobile_capabilities}`}
                        setOptions={{
                          enableBasicAutocompletion: true,
                          enableLiveAutocompletion: true,
                          enableSnippets: true,
                          showLineNumbers: true,
                          tabSize: 2,
                        }}
                      />
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.onHide} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              {this.props.applicationName ? (
                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-check" />
                  Update
                </div>
              ) : (
                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-check" />
                  Create
                </div>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default AddTestcaseModal;
