import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Upload, Input } from "antd";
import { object } from "prop-types";
// const writeFileP = require("write-file-p");
var FileSaver = require("file-saver");

const ApiTransformation = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        uploadedFileName: "",
        jsonFile: {},
        SwaggerInputData: null,
      };
      this.fileReader = new FileReader();
    }

    TranformToSwagger = async () => {
      const form = this.props.form;
      // form.validateFields(err => {
      //   if (err) {
      //     error = true;
      //   }
      // });
      console.log(!!this.state.SwaggerInputData);

      if (!this.state.SwaggerInputData) {
        return Alert.warning("Please Upload Input File.");
      }
      //   let data = form.getFieldValue("swaggerInputFile");
      console.log(this.state.SwaggerInputData);

      // ------------Swagger Documentation------------
      let swaggerFile = {
        openapi: "3.0.0",
        info: {
          version: "1.0.0",
          title: "API DOCUMENTATION",
          description: "",
          contact: {
            name: "TEAM",
            email: "contact-email@something.io",
            url: "mywebsite.io",
          },
          termsOfService: "YOUR_TERMS_OF_SERVICE_URL",
          license: {
            name: "Apache 2.0",
            url: "https://www.apache.org/licenses/LICENSE-2.0.html",
          },
        },
        servers: [],
        paths: {},
      };
      //   ----Download Swagger File---

      if (this.state.SwaggerInputData) {
        let swaggerDefination = this.state.SwaggerInputData.swaggerDefination;
        console.log(swaggerDefination);

        if (swaggerDefination.servers.length >= 1) {
          swaggerFile.servers = swaggerDefination.servers;
        }
        if (swaggerDefination.apis.length >= 1) {
          let paths = {};
          for (const api of swaggerDefination.apis) {
            if (api.hasOwnProperty("url")) {
              // set url property
              let url = api["url"];
              let method = api["method"];
              swaggerFile["paths"][api["url"]] = {};
              swaggerFile["paths"][url][api["method"]] = {};

              let response_body = {};
              for (const body in api.response) {
                response_body[body] = {
                  type: typeof api.response[body],
                };
              }

              console.log("response body", response_body);

              let request_body = {};
              for (const body in api.requestBody) {
                request_body[body] = {
                  type: typeof api.requestBody[body],
                };
              }

              // check for path parameteres
              let parameteres = [];
              let path = url.split("/");
              for (const p of path) {
                if (p.startsWith("{")) {
                  parameteres.push({
                    name: p.replace("{", "").replace("}", ""),
                    in: "path",
                    description: "",
                    deprecated: false,
                    required: true,
                    schema: {
                      type: "string",
                    },
                  });
                }
              }

              // response ----
              let response = {
                200: {
                  description: "response",
                  content: {
                    "application/json": {
                      schema: {
                        type: object,
                        properties: response_body,
                      },
                    },
                  },
                },
              };

              // requestBody----
              let requestBody = {
                description: "",
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      properties: request_body,
                    },
                  },
                },
              };

              // set response/request body
              if (method === "get") {
                swaggerFile["paths"][url][method] = {
                  deprecated: false,
                  description: api["description"],
                  responses: response,
                  parameteres: parameteres,
                };
              } else {
                swaggerFile["paths"][url][method] = {
                  deprecated: false,
                  description: api["description"],
                  responses: response,
                  requestBody: requestBody,
                  parameteres: parameteres,
                };
              }
            }
          }
          // console.log("path --->", paths);
        }
      }

      console.log("output swagger file", swaggerFile);
      var blob = new Blob([JSON.stringify(swaggerFile)], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "swagger_documentation.json");
    };

    DownloadSample = () => {
      let sample = {
        swaggerDefination: {
          servers: [
            {
              url: "http://localhost:5000",
              description: "Development server",
            },
            {
              url: "http://localhost:5000",
              description: "Production server",
            },
          ],
          apis: [
            {
              url: "/api/url_1",
              method: "get",
              description: "",
              headers: {},
              response: {},
            },
            {
              url: "/api/url_2",
              method: "post",
              headers: {},
              description: "",
              requestBody: {},
              response: {},
            },
            {
              // for parameterize path
              url: "/api/url_3/{_id}",
              method: "get",
              description: "",
              headers: {},
              response: {},
            },
          ],
        },
      };

      var blob = new Blob([JSON.stringify(sample)], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "swagger_input_sample.json");
    };

    render() {
      const { getFieldDecorator } = this.props.form;

      return (
        <div className="modal-container">
          <Modal show={this.props.addApiTransformationModal} onHide={() => this.props.onHide()} size="lg">
            <Modal.Header>
              <Modal.Title>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>API Transformation</div>
                  <div>
                    {/* <div onClick={this.TranformToSwagger} className="positive-button swagger-sample">
                      Download Sample
                    </div> */}
                    <div onClick={() => this.DownloadSample()} className="negative-button swagger-sample">
                      Download sample
                    </div>
                  </div>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form layout="vertical">
                <Form.Item label="Upload File">
                  {getFieldDecorator("swaggerInputFile", {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: "",
                  })(
                    <Upload.Dragger
                      multiple={false}
                      showUploadList={false}
                      onChange={(e) => {
                        let _this = this;
                        const reader = new FileReader();
                        reader.onload = function () {
                          _this.setState({ SwaggerInputData: JSON.parse(reader.result) });
                        };
                        reader.readAsText(e.fileList[0].originFileObj);

                        this.setState({
                          uploadedFileName: e.file.name,
                        });
                      }}
                    >
                      <p className="ant-upload-text">{this.state.uploadedFileName ? this.state.uploadedFileName : "Click or drag file to upload."}</p>
                      <p className="ant-upload-hint">Accepted Files: .json </p>
                    </Upload.Dragger>
                  )}
                </Form.Item>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <div className="sr-form-footer-btn-container">
                <div onClick={() => this.props.onHide()} className="negative-button">
                  <i className="fa fa-close" /> Cancel
                </div>

                <div onClick={this.TranformToSwagger} className="positive-button">
                  <i className="fa fa-upload" />
                  Transform
                </div>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
);

export default ApiTransformation;
