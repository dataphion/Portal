import React from "react";
import "../../../../Assets/Styles/Custom/GraphTools/Sidebar.scss";
import { Drawer } from "rsuite";
import { Form, Input, Icon, Button, Upload, Collapse, Select } from "antd";
import constants from "../../../../constants";
import { Alert } from "rsuite";
import _ from "lodash";
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/mode/xml";
import "brace/mode/text";
import "brace/theme/monokai";

const ApiSidebar = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        Method: null,
        UiTestcase: [],
        UiTestcaseName: "",
        PathParametersAdd: [],
        QueryParametersAdd: [],
        HeadersAdd: [],
        BodySelectedMenu: "None",
        BodyFormDataAdd: [],
        AceEditorValue: [],
        AceEditorValidation: [],
        showPassword: false,
      };
    }

    SidebarEnter = () => {
      if (this.props.selectedCellData.Method && this.props.selectedCellData.Method.value === "uitestcase") {
        this.setState({
          Method: this.props.selectedCellData.Method.value,
          UiTestcaseName: this.props.selectedCellData.UiTestcaseName ? this.props.selectedCellData.UiTestcaseName.value : null,
        });

        fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: `{applications(where:
              {user:{id:"${sessionStorage.getItem("id")}"},
              id:"${window.location.pathname.split("/")[2]}"})
              {testcases(where:{type:"ui"}){id,name}}}`,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            this.setState({
              UiTestcase: response.data.applications[0].testcases,
            });
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      }
      if (this.props.selectedCellData.PathParametersAdd) {
        this.setState({
          PathParametersAdd: JSON.parse(this.props.selectedCellData.PathParametersAdd.value),
        });
      }
      if (this.props.selectedCellData.QueryParametersAdd) {
        this.setState({
          QueryParametersAdd: JSON.parse(this.props.selectedCellData.QueryParametersAdd.value),
        });
      }
      if (this.props.selectedCellData.HeadersAdd) {
        this.setState({
          HeadersAdd: JSON.parse(this.props.selectedCellData.HeadersAdd.value),
        });
      }
      if (this.props.selectedCellData.BodySelectedMenu) {
        this.setState({
          BodySelectedMenu: this.props.selectedCellData.BodySelectedMenu.value,
        });
      }
      if (this.props.selectedCellData.BodyFormDataAdd) {
        this.setState({
          BodyFormDataAdd: JSON.parse(this.props.selectedCellData.BodyFormDataAdd.value),
        });
      }
      if (this.props.selectedCellData.AceEditorValue) {
        this.setState({
          AceEditorValue: JSON.parse(this.props.selectedCellData.AceEditorValue.value),
        });
      }

      if (this.props.selectedCellData.Uri && this.props.selectedCellData.Uri.value.split("{").length > 1) {
        for (let i = 1; i < this.props.selectedCellData.Uri.value.split("{").length; i++) {
          this.state.PathParametersAdd.push({
            PathParametersKey: this.props.selectedCellData.Uri.value.split("{")[i].split("}")[0],
            PathParametersValue: "",
          });
        }
      }
    };

    findDuplicate = (type) => {
      const getKeys = [];
      if (type === "QueryParameters") {
        this.state.QueryParametersAdd.map((obj) => getKeys.push(obj["QueryParametersKey"]));
      } else if (type === "Headers") {
        this.state.HeadersAdd.map((obj) => getKeys.push(obj["HeadersKey"]));
      } else if (type === "BodyFormData") {
        this.state.BodyFormDataAdd.map((obj) => getKeys.push(obj["BodyFormDataKey"]));
      }
      return _(getKeys)
        .groupBy()
        .pickBy((x) => x.length > 1)
        .keys()
        .value();
    };

    handleConfirm = () => {
      const form = this.props.form;
      // For form validation
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.error("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }

      if (this.state.Method !== "uitestcase") {
        // Check key dupalication in QueryParameters, Headers, BodyFormData
        const QueryParametersDuplicates = this.findDuplicate("QueryParameters");
        if (QueryParametersDuplicates.length > 0) {
          return Alert.error("Duplicate key in Query Parameters");
        }
        const HeadersDuplicates = this.findDuplicate("Headers");
        if (HeadersDuplicates.length > 0) {
          return Alert.error("Duplicate key in Headers");
        }
        const BodyFormDataDuplicates = this.findDuplicate("BodyFormData");
        if (BodyFormDataDuplicates.length > 0) {
          return Alert.error("Duplicate key in Body FormData");
        }

        // For AceEditor validation
        if (this.state.AceEditorValidation.length > 0) {
          return this.state.AceEditorValidation.map((error) => {
            return Alert.error(error.text, 5000);
          });
        }

        // Auto save key and value if only written and not added in array
        if (form.getFieldValue("QueryParametersKey") && form.getFieldValue("QueryParametersValue")) {
          let QueryParametersAdd = this.state.QueryParametersAdd;
          QueryParametersAdd.push({
            QueryParametersKey: form.getFieldValue("QueryParametersKey"),
            QueryParametersValue: form.getFieldValue("QueryParametersValue"),
          });
          form.resetFields("QueryParametersKey");
          form.resetFields("QueryParametersValue");
        }
        if (form.getFieldValue("HeadersKey") && form.getFieldValue("HeadersValue")) {
          let HeadersAdd = this.state.HeadersAdd;
          HeadersAdd.push({
            HeadersKey: form.getFieldValue("HeadersKey"),
            HeadersValue: form.getFieldValue("HeadersValue"),
          });
          form.resetFields("HeadersKey");
          form.resetFields("HeadersValue");
        }

        // Save all form fields
        console.log(form.getFieldValue("Uri"));
        let host = "";
        let uri = "";
        if (this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true") {
          console.log(this.props.selectedCellData.custom_api.value);
          let host_endpoint_url = form.getFieldValue("Uri");
          let split_url = host_endpoint_url.split("//");
          host = split_url[0] + "//" + split_url[1].split("/")[0];

          let uri_endpoint = split_url[1].split("/");
          for (let i = 1; i < uri_endpoint.length; i++) {
            uri = uri + "/" + uri_endpoint[i];
          }
        }

        console.log("host--->", host, "uri--->", uri);
        this.props.handleConfirm({
          Title: form.getFieldValue("Title"),
          Description: form.getFieldValue("Description"),
          Method: form.getFieldValue("Method"),
          Host_url: host === "" ? form.getFieldValue("Host_url") : host,
          Uri: uri === "" ? form.getFieldValue("Uri") : uri,
          PathParametersAdd: this.state.PathParametersAdd,
          QueryParametersAdd: this.state.QueryParametersAdd,
          AuthorizationUsername: form.getFieldValue("AuthorizationUsername"),
          AuthorizationPassword: form.getFieldValue("AuthorizationPassword"),
          HeadersAdd: this.state.HeadersAdd,
          BodySelectedMenu: this.state.BodySelectedMenu,
          BodyFormDataAdd: this.state.BodyFormDataAdd,
          AceEditorValue: this.state.AceEditorValue,
        });
      } else {
        this.props.handleConfirm({
          Title: form.getFieldValue("Title"),
          Description: form.getFieldValue("Description"),
          UiTestcase: form.getFieldValue("UiTestcase").split("//name")[0],
          UiTestcaseName: this.state.UiTestcaseName,
        });
      }
      this.hideModal();
    };

    hideModal = () => {
      this.setState({
        Method: null,
        UiTestcase: [],
        UiTestcaseName: "",
        PathParametersAdd: [],
        QueryParametersAdd: [],
        HeadersAdd: [],
        BodySelectedMenu: "None",
        BodyFormDataAdd: [],
        AceEditorValue: [],
        AceEditorValidation: [],
        showPassword: false,
      });
      this.props.form.resetFields();
      this.props.handleCancel();
    };

    QueryParametersAdd = () => {
      const form = this.props.form;
      if (form.getFieldValue("QueryParametersKey") && form.getFieldValue("QueryParametersValue")) {
        if (this.state.QueryParametersAdd.length === 0) {
          this.state.QueryParametersAdd.push({
            QueryParametersKey: form.getFieldValue("QueryParametersKey"),
            QueryParametersValue: form.getFieldValue("QueryParametersValue"),
          });
        } else {
          let Checker = true;
          this.state.QueryParametersAdd.map((data) => {
            if (data.QueryParametersKey === form.getFieldValue("QueryParametersKey")) {
              Checker = false;
            }
          });
          if (Checker) {
            this.state.QueryParametersAdd.push({
              QueryParametersKey: form.getFieldValue("QueryParametersKey"),
              QueryParametersValue: form.getFieldValue("QueryParametersValue"),
            });
          } else {
            return Alert.error(`Dupalicate key "${form.getFieldValue("QueryParametersKey")}"`);
          }
        }
        form.resetFields("QueryParametersKey");
        form.resetFields("QueryParametersValue");
      } else {
        return Alert.error("Please insert key and value properly");
      }
    };

    RenderQueryParameters = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.QueryParametersAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.QueryParametersAdd.map((Data, index) => {
              return (
                <div className="sidebar-body-regular-row animated fadeIn" key={index}>
                  <Form.Item>
                    {getFieldDecorator("QueryParametersKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.QueryParametersKey,
                    })(<Input onChange={(e) => (this.state.QueryParametersAdd[index].QueryParametersKey = e.target.value)} />)}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("QueryParametersValue" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.QueryParametersValue,
                    })(<Input onChange={(e) => (this.state.QueryParametersAdd[index].QueryParametersValue = e.target.value)} />)}
                  </Form.Item>
                  <div onClick={() => this.QueryParametersRemove(index)} className="sidebar-body-regular-row-right-btn">
                    <i className="fa fa-minus " />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    QueryParametersRemove = (index) => {
      let QueryParametersRemove = this.state.QueryParametersAdd;
      QueryParametersRemove.splice(index, 1);
      this.setState({ QueryParametersAdd: QueryParametersRemove });
    };

    HeadersAdd = () => {
      const form = this.props.form;
      if (form.getFieldValue("HeadersKey") && form.getFieldValue("HeadersValue")) {
        if (this.state.HeadersAdd.length === 0) {
          this.state.HeadersAdd.push({
            HeadersKey: form.getFieldValue("HeadersKey"),
            HeadersValue: form.getFieldValue("HeadersValue"),
          });
        } else {
          let Checker = true;
          this.state.HeadersAdd.map((data) => {
            if (data.HeadersKey === form.getFieldValue("HeadersKey")) {
              Checker = false;
            }
          });
          if (Checker) {
            this.state.HeadersAdd.push({
              HeadersKey: form.getFieldValue("HeadersKey"),
              HeadersValue: form.getFieldValue("HeadersValue"),
            });
          } else {
            return Alert.error(`Dupalicate key "${form.getFieldValue("HeadersKey")}"`);
          }
        }
        form.resetFields("HeadersKey");
        form.resetFields("HeadersValue");
      } else {
        return Alert.error("Please insert key and value properly");
      }
    };

    RenderHeaders = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.HeadersAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.HeadersAdd.map((Data, index) => {
              return (
                <div className="sidebar-body-regular-row animated fadeIn" key={index}>
                  <Form.Item>
                    {getFieldDecorator("HeadersKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.HeadersKey,
                    })(<Input onChange={(e) => (this.state.HeadersAdd[index].HeadersKey = e.target.value)} />)}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("HeadersValue" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.HeadersValue,
                    })(<Input onChange={(e) => (this.state.HeadersAdd[index].HeadersValue = e.target.value)} />)}
                  </Form.Item>
                  <div onClick={() => this.HeadersRemove(index)} className="sidebar-body-regular-row-right-btn">
                    <i className="fa fa-minus " />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    HeadersRemove = (index) => {
      let HeadersRemove = this.state.HeadersAdd;
      HeadersRemove.splice(index, 1);
      this.setState({ HeadersAdd: HeadersRemove });
    };

    BodySelectedMenu = (Selected) => {
      let BodySelectedMenu = this.state.BodySelectedMenu;
      if (Selected === "None") {
        BodySelectedMenu = "None";
      } else if (Selected === "FormData") {
        BodySelectedMenu = "FormData";
      } else if (Selected === "XML") {
        BodySelectedMenu = "XML";
      } else if (Selected === "JSON") {
        BodySelectedMenu = "JSON";
      } else if (Selected === "TEXT") {
        BodySelectedMenu = "TEXT";
      }
      this.setState({ BodySelectedMenu: BodySelectedMenu });
    };

    RenderBodySelectedMenu = () => {
      if (this.state.BodySelectedMenu === "FormData") {
        return (
          <React.Fragment>
            <div className="formdata-select-button-container animated fadeIn">
              <div onClick={() => this.BodyFormDataAdd("Text")} className="formdata-select-button">
                Add Text
                <i className="fa fa-pencil" style={{ color: "#c5c6c7" }} />
              </div>
              <div onClick={() => this.BodyFormDataAdd("File")} className="formdata-select-button">
                Add File
                <i className="fa fa-file" style={{ color: "#c5c6c7" }} />
              </div>
            </div>
            {this.RenderBodyFormDataType()}
          </React.Fragment>
        );
      } else if (this.state.BodySelectedMenu === "XML" || this.state.BodySelectedMenu === "JSON" || this.state.BodySelectedMenu === "TEXT") {
        return (
          <AceEditor
            className="animated fadeIn"
            mode={this.state.BodySelectedMenu.toLowerCase()}
            theme="monokai"
            onValidate={(e) => this.setState({ AceEditorValidation: e })}
            onChange={(value) => this.setState({ AceEditorValue: value })}
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            style={{ width: "100%", height: "300px", borderRadius: "10px" }}
            value={`${this.state.AceEditorValue}`}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        );
      }
    };

    BodyFormDataAdd = (Type) => {
      let BodyFormDataAdd = this.state.BodyFormDataAdd;
      BodyFormDataAdd.push({
        BodyFormDataKey: "",
        BodyFormDataType: Type,
        BodyFormDataValue: "",
      });
      this.setState({ BodyFormDataAdd: BodyFormDataAdd });
    };

    RenderBodyFormDataType = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.BodyFormDataAdd.length >= 1) {
        return (
          <React.Fragment>
            <div className="sidebar-inner-body-divider" />
            <div className="lable-key-value-container">
              <div className="lable-key-value">KEY</div>
              <div className="lable-key-value">VALUE</div>
              <div className="lable-key-value-blank" />
            </div>
            {this.state.BodyFormDataAdd.map((Data, index) => {
              return (
                <div className="sidebar-body-regular-row animated fadeIn" key={index}>
                  <Form.Item>
                    {getFieldDecorator("BodyFormDataKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.BodyFormDataKey,
                    })(<Input onChange={(e) => (this.state.BodyFormDataAdd[index].BodyFormDataKey = e.target.value)} />)}
                  </Form.Item>
                  {Data.BodyFormDataType === "Text" ? (
                    <Form.Item>
                      {getFieldDecorator("BodyFormDataValue" + index, {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: Data.BodyFormDataValue,
                      })(<Input onChange={(e) => (this.state.BodyFormDataAdd[index].BodyFormDataValue = e.target.value)} />)}
                    </Form.Item>
                  ) : (
                    <Form.Item>
                      {getFieldDecorator("BodyFormDataValue" + index, {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: Data.BodyFormDataValue,
                      })(
                        <Upload showUploadList={false} action="" onChange={(e) => (this.state.BodyFormDataAdd[index].BodyFormDataValue = e.file)}>
                          <Button>
                            <Icon type="upload" />
                            <b>{Data.BodyFormDataValue.name ? " " + Data.BodyFormDataValue.name : " Upload"}</b>
                          </Button>
                        </Upload>
                      )}
                    </Form.Item>
                  )}
                  <div onClick={() => this.BodyFormDataRemove(index)} className="sidebar-body-regular-row-right-btn">
                    <i className="fa fa-minus " />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    BodyFormDataRemove = (index) => {
      let BodyFormDataRemove = this.state.BodyFormDataAdd;
      BodyFormDataRemove.splice(index, 1);
      this.setState({ BodyFormDataAdd: BodyFormDataRemove });
    };

    render() {
      let host_url = "";
      if (this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true") {
        if (this.props.selectedCellData.Host_url && this.props.selectedCellData.Uri) {
          host_url = this.props.selectedCellData.Host_url.value + this.props.selectedCellData.Uri.value;
        }
      }
      const { getFieldDecorator } = this.props.form;
      return (
        <Drawer size="md" placement="right" show={this.props.visible} onHide={this.hideModal} onEnter={this.SidebarEnter}>
          <div className="animated fadeIn slow">
            <div className="sidebar-header-container">
              <div className="sidebar-header-title">
                Configure
                {this.state.Method === "uitestcase" ? " UI Testcase" : " API"}
              </div>
              <div className="sidebar-header-btn-container">
                <div onClick={this.hideModal} className="sidebar-header-btn-close">
                  <i className="fa fa-close" />
                </div>
                <div onClick={this.handleConfirm} className="sidebar-header-btn-confirm">
                  <i className="fa fa-check" />
                </div>
              </div>
            </div>

            <Form layout="vertical">
              <div className="sidebar-body-first-row">
                <Form.Item>
                  {getFieldDecorator("Title", {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: this.props.selectedCellData.Title ? this.props.selectedCellData.Title.value : "",
                  })(<Input placeholder="Title" autoFocus />)}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator("Description", {
                    initialValue: this.props.selectedCellData.Description ? this.props.selectedCellData.Description.value : "",
                  })(<Input placeholder="Description" />)}
                </Form.Item>
              </div>

              {this.state.Method !== "uitestcase" ? (
                <div className="sidebar-body-second-row">
                  <div className="sidebar-body-second-row-method" style={{ width: 180 }}>
                    <Form.Item>
                      {getFieldDecorator("Method", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.props.selectedCellData.Method ? this.props.selectedCellData.Method.value : "",
                      })(
                        this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true" ? (
                          <select className="select-env">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                        ) : (
                          <Input
                            disabled={this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true" ? false : true}
                            style={{
                              textAlign: "center",
                              textTransform: "uppercase",
                            }}
                            placeholder="METHOD"
                          />
                        )
                      )}
                    </Form.Item>
                  </div>
                  {/* {this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true" ? (
                    <div className="sidebar-body-second-row-uri" style={{ marginRight: 10 }}>
                      <Form.Item>
                        {getFieldDecorator("Host_url", {
                          rules: [
                            {
                              required: true,
                            },
                          ],
                          initialValue: this.props.selectedCellData.Host_url ? this.props.selectedCellData.Host_url.value : "",
                        })(<Input placeholder="http://localhost:3000" />)}
                      </Form.Item>
                    </div>
                  ) : (
                    ""
                  )} */}

                  <div className="sidebar-body-second-row-uri">
                    <Form.Item>
                      {getFieldDecorator("Uri", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.props.selectedCellData.Uri ? (host_url === "" ? this.props.selectedCellData.Uri.value : host_url) : "",
                      })(
                        <Input
                          placeholder="http://localhost:3000/api/endpoint"
                          disabled={this.props.selectedCellData.custom_api && this.props.selectedCellData.custom_api.value === "true" ? false : true}
                        />
                      )}
                    </Form.Item>
                  </div>
                </div>
              ) : null}

              <Collapse
                className="antd-collapse-container"
                bordered={true}
                defaultActiveKey={["1", "2", "3", "4", "5", "6"]}
                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
              >
                {this.state.PathParametersAdd.length >= 1 ? <div className="sidebar-body-divider" /> : ""}

                {this.state.Method !== "uitestcase" && this.state.PathParametersAdd.length >= 1 ? (
                  <Collapse.Panel header="PATH PARAMETERS" key="1">
                    <div className="lable-key-value-container">
                      <div className="lable-key-value">KEY</div>
                      <div className="lable-key-value">VALUE</div>
                      <div className="lable-key-value-blank" />
                    </div>
                    {this.state.PathParametersAdd.map((Data, index) => {
                      return (
                        <div className="sidebar-body-regular-row animated fadeIn" key={index}>
                          <Form.Item>
                            {getFieldDecorator("PathParametersKey" + index, {
                              rules: [
                                {
                                  required: true,
                                },
                              ],
                              initialValue: Data.PathParametersKey,
                            })(<Input disabled />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator("PathParametersValue" + index, {
                              rules: [
                                {
                                  required: true,
                                },
                              ],
                              initialValue: Data.PathParametersValue,
                            })(<Input onChange={(e) => (this.state.PathParametersAdd[index].PathParametersValue = e.target.value)} />)}
                          </Form.Item>
                          <div className="sidebar-body-regular-row-right-blank-btn" />
                        </div>
                      );
                    })}
                  </Collapse.Panel>
                ) : (
                  ""
                )}

                <div className="sidebar-body-divider" />

                {this.state.Method !== "uitestcase" ? (
                  <Collapse.Panel header="QUERY PARAMETERS" key="2">
                    <div className="lable-key-value-container">
                      <div className="lable-key-value">KEY</div>
                      <div className="lable-key-value">VALUE</div>
                      <div className="lable-key-value-blank" />
                    </div>
                    {this.RenderQueryParameters()}
                    <div className="sidebar-body-regular-row">
                      <Form.Item>{getFieldDecorator("QueryParametersKey")(<Input />)}</Form.Item>
                      <Form.Item>{getFieldDecorator("QueryParametersValue")(<Input />)}</Form.Item>
                      <div onClick={this.QueryParametersAdd} className="sidebar-body-regular-row-right-btn">
                        <i className="fa fa-plus" />
                      </div>
                    </div>
                  </Collapse.Panel>
                ) : null}

                <div className="sidebar-body-divider" />

                {this.state.Method !== "uitestcase" ? (
                  <Collapse.Panel header="AUTHORIZATION" key="3">
                    <div className="sidebar-body-regular-row">
                      <Form.Item label="USERNAME">
                        {getFieldDecorator("AuthorizationUsername", {
                          initialValue: this.props.selectedCellData.AuthorizationUsername ? this.props.selectedCellData.AuthorizationUsername.value : "",
                        })(<Input autoComplete="new-password" />)}
                      </Form.Item>
                      <Form.Item label="PASSWORD">
                        {getFieldDecorator("AuthorizationPassword", {
                          initialValue: this.props.selectedCellData.AuthorizationPassword ? this.props.selectedCellData.AuthorizationPassword.value : "",
                        })(<Input type={this.state.showPassword ? "text" : "password"} autoComplete="new-password" />)}
                      </Form.Item>

                      <div
                        onClick={() =>
                          this.setState({
                            showPassword: !this.state.showPassword,
                          })
                        }
                        className="sidebar-body-regular-row-right-btn"
                        style={{ marginTop: "24px" }}
                      >
                        <i className={"fa " + (this.state.showPassword ? "fa-eye-slash" : "fa-eye")} />
                      </div>
                    </div>
                  </Collapse.Panel>
                ) : null}

                <div className="sidebar-body-divider" />

                {this.state.Method !== "uitestcase" ? (
                  <Collapse.Panel header="HEADERS" key="4">
                    <div className="lable-key-value-container">
                      <div className="lable-key-value">KEY</div>
                      <div className="lable-key-value">VALUE</div>
                      <div className="lable-key-value-blank" />
                    </div>
                    {this.RenderHeaders()}
                    <div className="sidebar-body-regular-row">
                      <Form.Item>{getFieldDecorator("HeadersKey")(<Input />)}</Form.Item>
                      <Form.Item>{getFieldDecorator("HeadersValue")(<Input />)}</Form.Item>
                      <div onClick={this.HeadersAdd} className="sidebar-body-regular-row-right-btn">
                        <i className="fa fa-plus" />
                      </div>
                    </div>
                  </Collapse.Panel>
                ) : null}

                {this.state.Method !== "uitestcase" ? (
                  <div className={this.props.selectedCellData.Method ? (this.props.selectedCellData.Method.value === "get" ? "display-none-div" : "sidebar-body-divider") : ""} />
                ) : null}

                {this.state.Method !== "uitestcase" ? (
                  <Collapse.Panel
                    className={this.props.selectedCellData.Method ? (this.props.selectedCellData.Method.value === "get" ? "display-none-div" : "body-background") : ""}
                    header="BODY"
                    key="5"
                  >
                    <div className="sidebar-body-regular-row-body-menu-container">
                      <div className="sidebar-body-regular-row-body-menu">
                        <div
                          onClick={() => this.BodySelectedMenu("None")}
                          className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "None" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                        >
                          None
                        </div>
                        <div
                          onClick={() => this.BodySelectedMenu("FormData")}
                          className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "FormData" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                        >
                          Form Data
                        </div>
                        <div
                          onClick={() => this.BodySelectedMenu("XML")}
                          className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "XML" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                        >
                          XML
                        </div>
                        <div
                          onClick={() => this.BodySelectedMenu("JSON")}
                          className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "JSON" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                        >
                          JSON
                        </div>
                        <div
                          onClick={() => this.BodySelectedMenu("TEXT")}
                          className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "TEXT" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                        >
                          TEXT
                        </div>
                      </div>
                    </div>
                    {this.RenderBodySelectedMenu()}
                  </Collapse.Panel>
                ) : null}

                {this.state.Method === "custom-api" ? (
                  <Collapse.Panel header="Custom API" key="6">
                    <Form.Item>
                      {getFieldDecorator("UiTestcase", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue:
                          this.props.selectedCellData.UiTestcase && this.state.UiTestcaseName ? this.props.selectedCellData.UiTestcase.value.concat(`//name${this.state.UiTestcaseName}`) : "",
                      })(
                        <Select
                          onChange={(e) => {
                            this.setState({
                              UiTestcaseName: e.split("//name")[1],
                            });
                          }}
                        >
                          {this.state.UiTestcase.map((data, index) => {
                            const value = `${data.id}//name${data.name}`;
                            return (
                              <Select.Option key={index} value={value}>
                                {data.name}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Collapse.Panel>
                ) : null}

                {this.state.Method === "uitestcase" ? (
                  <Collapse.Panel header="UI TESTCASE" key="6">
                    <Form.Item>
                      {getFieldDecorator("UiTestcase", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue:
                          this.props.selectedCellData.UiTestcase && this.state.UiTestcaseName ? this.props.selectedCellData.UiTestcase.value.concat(`//name${this.state.UiTestcaseName}`) : "",
                      })(
                        <Select
                          onChange={(e) => {
                            this.setState({
                              UiTestcaseName: e.split("//name")[1],
                            });
                          }}
                        >
                          {this.state.UiTestcase.map((data, index) => {
                            const value = `${data.id}//name${data.name}`;
                            return (
                              <Select.Option key={index} value={value}>
                                {data.name}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Collapse.Panel>
                ) : null}
              </Collapse>
            </Form>
          </div>
        </Drawer>
      );
    }
  }
);

export default ApiSidebar;
