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
      collection_upload: false,
      selected_collection: "none",
    };

    componentDidMount() {
      console.log("call apis");
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
                  url: form.getFieldValue("url").split("http://")[1] || form.getFieldValue("url").split("https://")[1] ? form.getFieldValue("url") : `http://${form.getFieldValue("url")}`,
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
                    // id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find((o) => o.id === form.getFieldValue("feature")).id,

                    id: this.state.addNewFeature ? featureReq.data.id : this.props.features.find((o) => o.name === form.getFieldValue("feature")).id,
                  },
                };
                let createTestcase = await axios.post(constants.testcases, testcaseData);
                console.log(createTestcase);
                // let testcaseId = await createTestcase.json();
                if (this.state.selected_collection !== "none") {
                  console.log(createTestcase.data.id);

                  //create flow
                  let endpoints = [];
                  let graph_json = {};
                  let graph_xml = "";

                  let store_xml_data = [
                    `<mxGraphModel>
                  <root><mxCell id="0" />
                  <mxCell id="1" parent="0" />`,
                  ];

                  console.log(this.props.endpointpacks_data);
                  let selected_endpointpacks = null;
                  for (const endpoints of this.props.endpointpacks_data) {
                    if (endpoints.id === this.state.selected_collection) {
                      console.log("id found");
                      selected_endpointpacks = endpoints;
                      break;
                    }
                  }
                  console.log("selected ebdpoints", selected_endpointpacks);
                  let tag_ids = 2;
                  let current_source = 2;
                  let current_target = 3;
                  let graph_json_captutre = 2;
                  let mx_graph_vertical = 40;
                  let BodySelectedMenu = "None";
                  for (let i = 0; i < selected_endpointpacks.endpoints.length; i++) {
                    const ep = selected_endpointpacks.endpoints[i];
                    let graph_h = "";
                    let headers_count = 1;
                    let headers_length = Object.keys(ep.headers).length;
                    for (const h in ep.headers) {
                      // console.log(text[h]);
                      graph_h = graph_h + `{&quot;HeadersKey&quot;:&quot;${h}&quot;,&quot;HeadersValue&quot;:&quot;${ep.headers[h]}&quot;}`;

                      if (headers_count !== headers_length) {
                        graph_h = graph_h + ",";
                      }
                      headers_count++;
                    }
                    let graph_raw_data = "";
                    if (ep.requestbody) {
                      BodySelectedMenu = "JSON";
                      let raw_data = JSON.stringify(ep.requestbody);
                      raw_data = raw_data.replace(/\"/g, "\\&quot;");
                      raw_data = `&quot;${raw_data}&quot;`;
                      console.log("raw_data", raw_data);
                      graph_raw_data = raw_data;
                      // formatting body data for mx-graph
                      // let raw_data = "&quot{"
                      // for (const raw in ep.requestbody) {
                      //   raw_data = raw_data + `\&quot;${raw}\&quot;:`
                      //   let NestedObj = true
                      //   // while( NestedObj){
                      //   findNestedData=(values)=>{
                      //     if(typeof values === Object){
                      //       raw_data = raw_data+`{\&quot;${key}\&quot;:`
                      //       for (const key in values) {
                      //       if(typeof key === Object){
                      //         this.findNestedData(key)
                      //       }else{
                      //       raw_data = raw_data+`\&quot;${key}\&quot;`
                      //       }
                      //       }
                      //     }

                      //   }
                      //   this.findNestedData(ep.requestbody[raw])

                      //   // }

                      // }
                    }
                    console.log("modified data --->", graph_raw_data);
                    endpoints.push(ep.id);
                    if (i < 2) {
                      store_xml_data.push(
                        `<TaskObject EndpointPackId="${selected_endpointpacks.id}" EndpointId="${ep.id}" Uri="${ep.endpoint}" custom_api="false" Method="${ep.method}" Title="req ${i}" Type="api" Description="desc" PathParametersAdd="[]" QueryParametersAdd="[]" AuthorizationUsername="" AuthorizationPassword="" HeadersAdd="[${graph_h}]" BodySelectedMenu="${BodySelectedMenu}" BodyFormDataAdd="[]" AceEditorValue="${graph_raw_data}" id="${tag_ids}">
                  <mxCell style="rounded=1;fillColor=#cccccc;strokeColor=none;" parent="1" vertex="1">
                     <mxGeometry x="450" y="${mx_graph_vertical}" width="229" height="67" as="geometry" />
                  </mxCell>
               </TaskObject>`
                      );
                      mx_graph_vertical = mx_graph_vertical + 100;
                      tag_ids = tag_ids + 1;
                      if (i == 1) {
                        store_xml_data.push(
                          `<mxCell id="${tag_ids}" value="Edge" style="edgeStyle=orthogonalEdgeStyle;strokeColor=#cccccc;strokeWidth=3;rounded=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" parent="1" source="${current_source}" target="${current_target}" edge="1">
                          <mxGeometry relative="1" as="geometry" />
                       </mxCell>`
                        );
                        tag_ids = tag_ids + 1;
                      }
                    } else {
                      store_xml_data.push(
                        `<TaskObject EndpointPackId="${selected_endpointpacks.id}" EndpointId="${ep.id}" Uri="${ep.endpoint}" custom_api="false" Method="${ep.method}" Title="req ${i}" Type="api" Description="desc" PathParametersAdd="[]" QueryParametersAdd="[]" AuthorizationUsername="" AuthorizationPassword="" HeadersAdd="[${graph_h}]" BodySelectedMenu="${BodySelectedMenu}" BodyFormDataAdd="[]" AceEditorValue="${graph_raw_data}" id="${tag_ids}">
                  <mxCell style="rounded=1;fillColor=#cccccc;strokeColor=none;" parent="1" vertex="1">
                     <mxGeometry x="450" y="${mx_graph_vertical}" width="229" height="67" as="geometry" />
                  </mxCell>
               </TaskObject>`
                      );
                      tag_ids = tag_ids + 1;
                      mx_graph_vertical = mx_graph_vertical + 100;

                      store_xml_data.push(
                        `<mxCell id="${tag_ids}" value="Edge" style="edgeStyle=orthogonalEdgeStyle;strokeColor=#cccccc;strokeWidth=3;rounded=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;" parent="1" source="${current_target}" target="${
                          current_target + 2
                        }" edge="1">
                        <mxGeometry relative="1" as="geometry" />
                     </mxCell>`
                      );
                      current_target = current_target + 2;
                      tag_ids = tag_ids + 1;
                    }
                    if (selected_endpointpacks.endpoints.length - 1 === i) {
                      store_xml_data.push(`   </root>
                      </mxGraphModel>`);
                    }

                    console.log(tag_ids);
                  }

                  // create graph_json_data
                  let inc_val = 2;
                  for (let i = 0; i < selected_endpointpacks.endpoints.length; i++) {
                    let ele = selected_endpointpacks.endpoints[i];
                    console.log("elements", ele);
                    if (inc_val < 4) {
                      // children

                      let child = [];
                      if (selected_endpointpacks.endpoints.length - 1 !== i) {
                        let c = inc_val === 2 ? inc_val + 1 : inc_val + 2;
                        child.push(c.toString());
                      }
                      // parent
                      let parent = [];
                      if (i !== 0) {
                        let p = inc_val - 1;
                        parent.push(p.toString());
                      }
                      graph_json[inc_val] = {
                        children: child,
                        parent: parent,
                        id: inc_val.toString(),
                        properties: {
                          AceEditorValue: ele.requestbody,
                          AuthorizationPassword: "",
                          AuthorizationUsername: "",
                          BodyFormDataAdd: {},
                          BodySelectedMenu: BodySelectedMenu,
                          Description: "desc",
                          EndpointId: ele.id,
                          EndpointPackId: selected_endpointpacks.id,
                          HeadersAdd: ele.headers,
                          Method: ele.method,
                          PathParametersAdd: {},
                          QueryParametersAdd: {},
                          Title: `req ${i}`,
                          Type: "api",
                          Uri: ele.endpoint,
                          custom_api: false,
                        },
                      };

                      inc_val = inc_val === 2 ? inc_val + 1 : inc_val + 2;
                    } else {
                      let child = [];
                      if (selected_endpointpacks.endpoints.length - 1 !== i) {
                        let c = inc_val + 2;
                        child.push(c.toString());
                      }
                      // parent
                      let parent = [];
                      let p = inc_val - 2;
                      parent.push(p.toString());
                      graph_json[inc_val] = {
                        children: child,
                        parent: parent,
                        id: inc_val.toString(),
                        AceEditorValue: ele.requestbody,
                        AuthorizationPassword: "",
                        AuthorizationUsername: "",
                        BodyFormDataAdd: {},
                        BodySelectedMenu: BodySelectedMenu,
                        Description: "desc",
                        EndpointId: ele.id,
                        EndpointPackId: selected_endpointpacks.id,
                        HeadersAdd: ele.parameters,
                        Method: ele.method,
                        PathParametersAdd: {},
                        QueryParametersAdd: {},
                        Title: `req ${i}`,
                        Type: "api",
                        Uri: ele.endpoint,
                        custom_api: false,
                      };
                      inc_val = inc_val + 2;
                    }
                  }
                  graph_xml = store_xml_data.join("");
                  let request_body = {
                    endpoints: endpoints,
                    graph_json: graph_json,
                    graph_xml: graph_xml,
                    testcase: createTestcase.data.id,
                  };
                  console.log("request_body --- >", request_body);

                  let create_flow = await axios.post(constants.flows, request_body);
                  // console.log(create_flow);
                }

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

    UploadCollection = (e) => {
      console.log(e);
      this.setState({ selected_collection: e });
    };

    onHide = () => {
      this.props.onHide();
      this.setState({ addNewFeature: false });
    };

    render() {
      console.log(this.props);
      const { getFieldDecorator } = this.props.form;
      const { setMobilePlatform, setCapabilities, state } = this.context;
      return (
        <Modal show={this.props.addTestcaseModal} onHide={this.onHide} onEntered={this.loadFeatures} size="lg">
          <Modal.Header>
            <Modal.Title>{this.props.applicationName ? "Update Testcase" : "Create Testcase"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="sr-form-button-container-row" style={{ justifyContent: "center" }}>
              <div onClick={() => this.props.modalTestcaseSelected("ui")} className={"sr-form-button-container " + (this.props.modalTestcaseType === "ui" ? "sr-form-button-bg" : "")}>
                <div
                  className="fa fa-desktop"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "ui" ? "#fff" : "",
                  }}
                />
                <div className={"sr-form-button-title " + (this.props.modalTestcaseType === "ui" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>UI</div>
              </div>
              <div onClick={() => this.props.modalTestcaseSelected("api")} className={"sr-form-button-container " + (this.props.modalTestcaseType === "api" ? "sr-form-button-bg" : "")}>
                <div
                  className="fa fa-rocket"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "api" ? "#fff" : "",
                  }}
                />
                <div className={"sr-form-button-title " + (this.props.modalTestcaseType === "api" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>API</div>
              </div>
              <div onClick={() => this.props.modalTestcaseSelected("mobile")} className={"sr-form-button-container " + (this.props.modalTestcaseType === "mobile" ? "sr-form-button-bg" : "")}>
                <div
                  className="fa fa-mobile"
                  style={{
                    fontSize: "20px",
                    marginRight: "15px",
                    color: this.props.modalTestcaseType === "mobile" ? "#fff" : "",
                  }}
                />
                <div className={"sr-form-button-title " + (this.props.modalTestcaseType === "mobile" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>Mobile</div>
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
                {/* {this.props.modalTestcaseType === "api" ? (
                  <Col xs={12} className="input-forms">
                    <Form.Item label="Collections">
                      {getFieldDecorator("collections", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.state.selected_collection,
                      })(
                        <Select onChange={(e) => this.UploadCollection(e)}>
                          {this.props.collection_data.map((data, index) => {
                            return (
                              <Select.Option value={data.value} key={index}>
                                {data.label}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )} */}

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
