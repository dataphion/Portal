import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Input, Upload, Form, Tabs } from "antd";
import constants from "../constants";
import axios from "axios";
import Loader from "./Loader";
import AutosizeInput from "react-input-autosize";
import AceEditor from "react-ace";
const { Panel } = Collapse;

const { TabPane } = Tabs;

const AddNewTestcaseSteps = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loader: false,
        tagValue: "",
        tagsClass: [],
        idSelectorCondition: false,
        idSelectorValue: "",
        nameSelectorcondition: false,
        nameSelectorValue: "",
        configureTimeout: null,
        tagsXPath: [],
        valueSelector: false,
        valueSelectorValue: "",
        tag_width: 0,
        elementAttributesJson: {},
        fileupload_or_not: false,
        uploadedFileName: "",
        configureTimeoutcondition: false,

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
        tab_id: 1,
      };
    }

    removeTag = (i) => {
      let newElementAttributesJson = this.state.elementAttributesJson;
      const newTags = [...this.state.tagsClass];
      newTags.splice(i, 1);
      this.setState({ tagsClass: newTags }, () => {
        newElementAttributesJson.class = this.state.tagsClass.join(" ");
        this.setState({
          elementAttributesJson: newElementAttributesJson,
        });
      });
    };

    inputKeyDown = (e) => {
      const val = e.target.value;
      if (e.key === "Enter" && val) {
        if (
          this.state.tagsClass.find(
            (tag) => tag.toLowerCase() === val.toLowerCase()
          )
        ) {
          return;
        }
        let newElementAttributesJson = this.state.elementAttributesJson;

        this.setState({ tagsClass: [...this.state.tagsClass, val] }, () => {
          newElementAttributesJson.class = this.state.tagsClass.join(" ");
          this.setState({
            elementAttributesJson: newElementAttributesJson,
          });
        });
        this.tagInput.value = null;
      }
    };

    editTag = (e) => {
      this.tagInput.value = this.state.tagsClass[e];
      this.removeTag(e);
    };

    removeTagXPath = (i) => {
      const newTags = [...this.state.tagsXPath];
      newTags.splice(i, 1);
      this.setState({ tagsXPath: newTags });
    };

    inputKeyDownXpath = (e) => {
      const val = e.target.value;
      if (e.key === "Enter" && val) {
        if (
          this.state.tagsXPath.find(
            (tag) => tag.toLowerCase() === val.toLowerCase()
          )
        ) {
          return;
        }
        this.setState({ tagsXPath: [...this.state.tagsXPath, val] });
        this.tagInputXpath.value = null;
      }
    };

    editTagXPath = (e) => {
      this.tagInputXpath.value = this.state.tagsXPath[e];
      this.removeTagXPath(e);
    };

    handleIdSelectorChange = (e) => {
      if (event.key === "Enter") {
        this.setState({
          idSelectorCondition: true,
        });
      } else {
        let newElementAttributesJson = this.state.elementAttributesJson;
        newElementAttributesJson.id = e.target.value;
        this.setState({
          idSelectorValue: e.target.value,
          elementAttributesJson: newElementAttributesJson,
        });
      }
    };

    handleNameSelectorChange = (e) => {
      if (event.key === "Enter") {
        this.setState({
          nameSelectorcondition: true,
        });
      } else {
        let newElementAttributesJson = this.state.elementAttributesJson;
        newElementAttributesJson.name = e.target.value;
        this.setState({
          nameSelectorValue: e.target.value,
          elementAttributesJson: newElementAttributesJson,
        });
      }
    };

    handleConfigureTimeoutChange = (e) => {
      if (event.key === "Enter") {
        this.setState({
          configureTimeoutcondition: true,
        });
      } else {
        this.setState({
          configureTimeout: e.target.value,
        });
      }
    };

    handleValueSelectorChange = (e) => {
      if (event.key === "Enter") {
        this.setState({
          valueSelector: true,
        });
      } else {
        let newElementAttributesJson = this.state.elementAttributesJson;
        newElementAttributesJson.value = e.target.value;
        this.setState({
          valueSelectorValue: e.target.value,
          elementAttributesJson: newElementAttributesJson,
        });
      }
    };

    // onEnterAction = () => {
    //   this.setState({ tagValue: "" });
    //   if (this.props.modalInformation.tag) {
    //     this.setState({
    //       tagValue: this.props.modalInformation.tag.split("/")[
    //         this.props.modalInformation.tag.split("/").length - 1
    //       ]
    //     });
    //   }
    // };

    middleValue = (values) => {
      values.sort((a, b) => {
        return a - b;
      });
      var half = Math.floor(values.length / 2);

      if (values.length % 2) return values[half];
      else return (values[half - 1] + values[half]) / 2.0;
    };

    saveRecords = async () => {
      // const middleValue = this.middleValue([beforeStepIndex, afterStepIndex]);
      this.setState({ loader: true });
      const form = this.props.form;
      const { tab_id } = this.state;
      const { beforeStepIndex, afterStepIndex } = this.props;
      let fileupload_url;

      if (tab_id == 1) {
        if (this.state.fileupload_or_not) {
          let fileUpload = new FormData();
          fileUpload.append(
            "files",
            form.getFieldValue("StepFileUpload").file.originFileObj
          );
          const reqFileUpload = await axios.post(constants.upload, fileUpload, {
            headers: {
              "content-type": "multipart/form-data",
            },
          });
          if ([200, 201].includes(reqFileUpload.status)) {
            fileupload_url = reqFileUpload.data[0].id;
          }
        }

        if (
          this.state.valueSelectorValue ||
          this.state.idSelectorValue ||
          this.state.nameSelectorValue ||
          this.state.tagsClass.length > 0 ||
          this.state.tagsXPath.length > 0
        ) {
          const ORBody = {
            action: "custom",
            element_value: this.state.valueSelectorValue,
            element_id: this.state.idSelectorValue,
            element_attributes: {
              name: this.state.nameSelectorValue,
              class: this.state.tagsClass.join(" "),
            },
            element_xpaths: this.state.tagsXPath,
            fileupload_url,
            timeout: this.state.configureTimeout,
            expected_condition: this.props.expected_condition,
          };
          const reqOR = await axios.post(constants.objectrepositories, ORBody);

          // await fetch(constants.graphql, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     Accept: "application/json"
          //   },
          //   body: JSON.stringify({
          //     query: `mutation{createTestcasecomponent(input:{data:{sequence_number: "${beforeStepIndex + 0.1}",type: "ui",objectrepository:"${reqOR.data.id}",testcase: "${
          //       window.location.pathname.split("/")[5]
          //     }"}}){testcasecomponent{id}}}`
          //   })
          // });

          let testcasecomponent_data = {
            sequence_number: beforeStepIndex + 0.1,
            type: "ui",
            objectrepository: reqOR.data.id,
            testcase: window.location.pathname.split("/")[5],
          };

          await fetch(constants.testcasecomponents, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(testcasecomponent_data),
          });

          // let create_step = await create_testcasecomponent

          this.hideModal();
          this.props.loadSteps();
        } else {
          this.setState({ loader: false });
          return Alert.warning("Please provide any element locator");
        }
      } else {
        let error = false;
        // console.log(form.getFieldValue("Method"));
        form.validateFields((err) => {
          if (err) {
            error = true;

            this.setState({ loader: false });
            return Alert.error("Please fill required fields.");
          }
        });
        if (error) {
          return;
        }
        // console.log("headers value.....", this.state.HeadersAdd);

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
        if (
          form.getFieldValue("QueryParametersKey") &&
          form.getFieldValue("QueryParametersValue")
        ) {
          let QueryParametersAdd = this.state.QueryParametersAdd;
          QueryParametersAdd.push({
            QueryParametersKey: form.getFieldValue("QueryParametersKey"),
            QueryParametersValue: form.getFieldValue("QueryParametersValue"),
          });
          form.resetFields("QueryParametersKey");
          form.resetFields("QueryParametersValue");
        }
        if (
          form.getFieldValue("HeadersKey") &&
          form.getFieldValue("HeadersValue")
        ) {
          let HeadersAdd = this.state.HeadersAdd;
          HeadersAdd.push({
            HeadersKey: form.getFieldValue("HeadersKey"),
            HeadersValue: form.getFieldValue("HeadersValue"),
          });
          // console.log("headerssss --->", HeadersAdd);
          form.resetFields("HeadersKey");
          form.resetFields("HeadersValue");
        }

        // Save all form fields
        this.handleConfirm({
          Method: form.getFieldValue("Method"),
          // Host_url: host === "" ? form.getFieldValue("Host_url") : host,
          // Uri: uri === "" ? form.getFieldValue("Uri") : uri,
          Uri: form.getFieldValue("Uri"),
          PathParametersAdd: this.state.PathParametersAdd,
          QueryParametersAdd: this.state.QueryParametersAdd,
          AuthorizationUsername: form.getFieldValue("AuthorizationUsername"),
          AuthorizationPassword: form.getFieldValue("AuthorizationPassword"),
          HeadersAdd: this.state.HeadersAdd,
          BodySelectedMenu: this.state.BodySelectedMenu,
          BodyFormDataAdd: this.state.BodyFormDataAdd,
          AceEditorValue: this.state.AceEditorValue,
        });
      }
    };

    handleConfirm = async (data) => {
      console.log(data);
      const { beforeStepIndex, afterStepIndex } = this.props;

      const ORBody = {
        action: "custom_api",
        url: data.Uri,
        api_attributes: data,
      };
      const reqOR = await axios.post(constants.objectrepositories, ORBody);

      let testcasecomponent_data = {
        sequence_number: beforeStepIndex + 0.1,
        type: "ui",
        objectrepository: reqOR.data.id,
        testcase: window.location.pathname.split("/")[5],
      };

      await fetch(constants.testcasecomponents, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(testcasecomponent_data),
      });

      this.hideModal();
      this.props.loadSteps();
    };

    hideModal = () => {
      this.setState({
        tagValue: "",
        loader: false,
        tagsClass: [],
        idSelectorCondition: false,
        idSelectorValue: "",
        nameSelectorcondition: false,
        nameSelectorValue: "",
        configureTimeoutcondition: false,
        configureTimeout: null,
        tagsXPath: [],
        valueSelector: false,
        valueSelectorValue: "",
        tag_width: 0,
        elementAttributesJson: {},
        fileupload_or_not: false,
        uploadedFileName: "",
      });
      this.props.onHide();
    };

    editValueSelector = () => {
      this.setState({ valueSelector: false });
    };

    editIdSelector = () => {
      this.setState({ idSelectorCondition: false });
    };

    editnameSelector = () => {
      this.setState({ nameSelectorcondition: false });
    };

    editcofigureTimeout = () => {
      this.setState({ configureTimeoutcondition: false });
    };

    changeText = (e) => {
      this.setState({
        tagValue: e.target.value,
      });
    };

    PathParametersAdd = () => {
      const form = this.props.form;
      if (
        form.getFieldValue("PathParametersKey") &&
        form.getFieldValue("PathParametersValue")
      ) {
        if (this.state.PathParametersAdd.length === 0) {
          this.state.PathParametersAdd.push({
            PathParametersKey: form.getFieldValue("PathParametersKey"),
            PathParametersValue: form.getFieldValue("PathParametersValue"),
          });
        } else {
          let Checker = true;
          this.state.PathParametersAdd.map((data) => {
            if (
              data.PathParametersKey === form.getFieldValue("PathParametersKey")
            ) {
              Checker = false;
            }
          });
          if (Checker) {
            this.state.PathParametersAdd.push({
              PathParametersKey: form.getFieldValue("PathParametersKey"),
              PathParametersValue: form.getFieldValue("PathParametersValue"),
            });
          } else {
            return Alert.error(
              `Dupalicate key "${form.getFieldValue("PathParametersKey")}"`
            );
          }
        }
        form.resetFields("PathParametersKey");
        form.resetFields("PathParametersValue");
      } else {
        return Alert.error("Please insert key and value properly");
      }
    };

    RenderPathParameters = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.state.PathParametersAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.PathParametersAdd.map((Data, index) => {
              return (
                <div
                  className="sidebar-body-regular-row animated fadeIn"
                  key={index}
                >
                  <Form.Item>
                    {getFieldDecorator("PathParametersKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.PathParametersKey,
                    })(
                      <Input
                        onChange={(e) =>
                          (this.state.PathParametersAdd[
                            index
                          ].PathParametersKey = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("PathParametersValue" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.PathParametersValue,
                    })(
                      <Input
                        onChange={(e) =>
                          (this.state.PathParametersAdd[
                            index
                          ].PathParametersValue = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <div
                    onClick={() => this.PathParametersRemove(index)}
                    className="sidebar-body-regular-row-right-btn"
                  >
                    <i className="fa fa-minus " />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      }
    };

    PathParametersRemove = (index) => {
      let QueryParametersRemove = this.state.PathParametersAdd;
      QueryParametersRemove.splice(index, 1);
      this.setState({ PathParametersAdd: QueryParametersRemove });
    };
    QueryParametersAdd = () => {
      const form = this.props.form;
      if (
        form.getFieldValue("QueryParametersKey") &&
        form.getFieldValue("QueryParametersValue")
      ) {
        if (this.state.QueryParametersAdd.length === 0) {
          this.state.QueryParametersAdd.push({
            QueryParametersKey: form.getFieldValue("QueryParametersKey"),
            QueryParametersValue: form.getFieldValue("QueryParametersValue"),
          });
        } else {
          let Checker = true;
          this.state.QueryParametersAdd.map((data) => {
            if (
              data.QueryParametersKey ===
              form.getFieldValue("QueryParametersKey")
            ) {
              Checker = false;
            }
          });
          if (Checker) {
            this.state.QueryParametersAdd.push({
              QueryParametersKey: form.getFieldValue("QueryParametersKey"),
              QueryParametersValue: form.getFieldValue("QueryParametersValue"),
            });
          } else {
            return Alert.error(
              `Dupalicate key "${form.getFieldValue("QueryParametersKey")}"`
            );
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
                <div
                  className="sidebar-body-regular-row animated fadeIn"
                  key={index}
                >
                  <Form.Item>
                    {getFieldDecorator("QueryParametersKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.QueryParametersKey,
                    })(
                      <Input
                        onChange={(e) =>
                          (this.state.QueryParametersAdd[
                            index
                          ].QueryParametersKey = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("QueryParametersValue" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.QueryParametersValue,
                    })(
                      <Input
                        onChange={(e) =>
                          (this.state.QueryParametersAdd[
                            index
                          ].QueryParametersValue = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <div
                    onClick={() => this.QueryParametersRemove(index)}
                    className="sidebar-body-regular-row-right-btn"
                  >
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
      // debugger;
      // console.log("make headers ---->", this.state.headers);
      const form = this.props.form;
      if (
        form.getFieldValue("HeadersKey") &&
        form.getFieldValue("HeadersValue")
      ) {
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
            return Alert.error(
              `Dupalicate key "${form.getFieldValue("HeadersKey")}"`
            );
          }
        }
        form.resetFields("HeadersKey");
        form.resetFields("HeadersValue");
      } else {
        return Alert.error("Please insert key and value properly");
      }
    };

    findDuplicate = (type) => {
      const getKeys = [];
      if (type === "QueryParameters") {
        this.state.QueryParametersAdd.map((obj) =>
          getKeys.push(obj["QueryParametersKey"])
        );
      } else if (type === "Headers") {
        this.state.HeadersAdd.map((obj) => getKeys.push(obj["HeadersKey"]));
      } else if (type === "BodyFormData") {
        this.state.BodyFormDataAdd.map((obj) =>
          getKeys.push(obj["BodyFormDataKey"])
        );
      }
      return _(getKeys)
        .groupBy()
        .pickBy((x) => x.length > 1)
        .keys()
        .value();
    };

    RenderHeaders = () => {
      const { getFieldDecorator } = this.props.form;
      // console.log("headers value --->", this.state.HeadersAdd);
      if (this.state.HeadersAdd.length >= 1) {
        return (
          <React.Fragment>
            {this.state.HeadersAdd.map((Data, index) => {
              return (
                <div
                  className="sidebar-body-regular-row animated fadeIn"
                  key={index}
                >
                  <Form.Item>
                    {getFieldDecorator("HeadersKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.HeadersKey,
                    })(
                      <Input
                        onChange={(e) => {
                          this.state.HeadersAdd[index].HeadersKey =
                            e.target.value;
                        }}
                      />
                    )}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator("HeadersValue" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.HeadersValue,
                    })(
                      <Input
                        onChange={(e) => {
                          this.state.HeadersAdd[index].HeadersValue =
                            e.target.value;
                        }}
                      />
                    )}
                  </Form.Item>
                  <div
                    onClick={() => this.HeadersRemove(index)}
                    className="sidebar-body-regular-row-right-btn"
                  >
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
              <div
                onClick={() => this.BodyFormDataAdd("Text")}
                className="formdata-select-button"
              >
                Add Text
                <i className="fa fa-pencil" style={{ color: "#c5c6c7" }} />
              </div>
              <div
                onClick={() => this.BodyFormDataAdd("File")}
                className="formdata-select-button"
              >
                Add File
                <i className="fa fa-file" style={{ color: "#c5c6c7" }} />
              </div>
            </div>
            {this.RenderBodyFormDataType()}
          </React.Fragment>
        );
      } else if (
        this.state.BodySelectedMenu === "XML" ||
        this.state.BodySelectedMenu === "JSON" ||
        this.state.BodySelectedMenu === "TEXT"
      ) {
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
                <div
                  className="sidebar-body-regular-row animated fadeIn"
                  key={index}
                >
                  <Form.Item>
                    {getFieldDecorator("BodyFormDataKey" + index, {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: Data.BodyFormDataKey,
                    })(
                      <Input
                        onChange={(e) =>
                          (this.state.BodyFormDataAdd[index].BodyFormDataKey =
                            e.target.value)
                        }
                      />
                    )}
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
                      })(
                        <Input
                          onChange={(e) =>
                            (this.state.BodyFormDataAdd[
                              index
                            ].BodyFormDataValue = e.target.value)
                          }
                        />
                      )}
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
                        <Upload
                          showUploadList={false}
                          action=""
                          onChange={(e) =>
                            (this.state.BodyFormDataAdd[
                              index
                            ].BodyFormDataValue = e.file)
                          }
                        >
                          <Button>
                            <Icon type="upload" />
                            <b>
                              {Data.BodyFormDataValue.name
                                ? " " + Data.BodyFormDataValue.name
                                : " Upload"}
                            </b>
                          </Button>
                        </Upload>
                      )}
                    </Form.Item>
                  )}
                  <div
                    onClick={() => this.BodyFormDataRemove(index)}
                    className="sidebar-body-regular-row-right-btn"
                  >
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
    setTabs = (index) => {
      this.setState({ tab_id: index });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <Modal
            className="meta-data-modal-body-add"
            full
            show={this.props.addnewSteps}
            onHide={this.hideModal}
            // onEnter={this.onEnterAction}
          >
            <Modal.Header closeButton={false} className="modal-fixed-header">
              <div className="modal-container-with-button">
                <div className="meta-data-modal-header-title">
                  Add New TestCase Steps
                </div>
                <div className="sr-form-footer-btn-container">
                  <div onClick={this.props.onHide} className="negative-button">
                    <i className="fa fa-close" /> Close
                  </div>
                  <div onClick={this.saveRecords} className="positive-button">
                    <i className="fa fa-check" />
                    Add Step
                  </div>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              {/* <div className="meta-data-modal-body-header-container">
                <div className="meta-data-modal-body-header-url">
                  <i className="globe-icon" />
                  <div title="" className="meta-data-modal-body-header-url-text" />
                </div>
                <div className="meta-data-modal-body-header-tags-btn">
                  <div className="meta-data-modal-body-header-tags-btn-icon">
                    <i className="fa fa-tag" />
                  </div>
                  <div className="meta-data-modal-body-header-tags-btn-text">
                    <AutosizeInput name="form-field-name" value={this.state.tagValue} placeholder="Add tag here" onChange={this.changeText} />
                          <input
                            type="text"
                            placeholder="Add tag here"
                            size={this.state.tag_width}
                            onChange={this.changeText}
                            value={this.state.tagValue}
                          /> 
                  </div>
                </div>
              </div> */}
              <Tabs defaultActiveKey="1" type="card" onChange={this.setTabs}>
                {/* <div className="meta-data-border" /> */}
                {/* <Collapse.Panel header="ELEMENT LOCATORS" key="2"> */}
                <TabPane tab="ELEMENT LOCATORS" key="1">
                  <Form>
                    <div className="element-item-row">
                      <div
                        className="element-item-row-header"
                        onClick={() =>
                          this.setState({
                            fileupload_or_not: !this.state.fileupload_or_not,
                          })
                        }
                        style={{ height: "39.09px", cursor: "pointer" }}
                      >
                        <i
                          className="fa fa-caret-right"
                          style={
                            this.state.fileupload_or_not
                              ? { transform: "rotate(90deg)" }
                              : {}
                          }
                        />
                        File Upload
                      </div>
                      {this.state.fileupload_or_not ? (
                        <React.Fragment>
                          <div className="element-item-row-border" />
                          <div className="element-item-row-footer">
                            <div className="file-upload-container">
                              <Form.Item>
                                {getFieldDecorator("StepFileUpload", {
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
                                    onChange={(e) =>
                                      this.setState({
                                        uploadedFileName: e.file.name,
                                      })
                                    }
                                  >
                                    <p className="ant-upload-text">
                                      {this.state.uploadedFileName
                                        ? this.state.uploadedFileName
                                        : "Click or drag file to upload."}
                                    </p>
                                  </Upload.Dragger>
                                )}
                              </Form.Item>
                            </div>
                          </div>
                        </React.Fragment>
                      ) : null}
                    </div>
                    <div className="element-item-row">
                      <div className="element-item-row-header">
                        <div className="meta-data-icon" />
                        Value Selector
                      </div>
                      <div className="element-item-row-border" />
                      <div className="element-item-row-footer">
                        {this.state.valueSelectorValue &&
                        this.state.valueSelector ? (
                          <div
                            className="element-item-row-footer-btn"
                            onDoubleClick={() => this.editValueSelector()}
                          >
                            {this.state.valueSelectorValue}
                          </div>
                        ) : (
                          <Input
                            type="text"
                            placeholder="Add Id Selector"
                            className="input-container-text"
                            onKeyPress={(e) =>
                              this.handleValueSelectorChange(e)
                            }
                            onChange={(e) => this.handleValueSelectorChange(e)}
                            value={this.state.valueSelectorValue}
                          />
                        )}
                      </div>
                    </div>
                    <div className="element-item-row">
                      <div className="element-item-row-header">
                        <div className="meta-data-icon" />
                        Id Selector
                      </div>
                      <div className="element-item-row-border">
                        <div className="element-item-row-footer">
                          {this.state.idSelectorValue &&
                          this.state.idSelectorCondition ? (
                            <div
                              className="element-item-row-footer-btn"
                              onDoubleClick={() => this.editIdSelector()}
                            >
                              {this.state.idSelectorValue}
                            </div>
                          ) : (
                            <Input
                              type="text"
                              placeholder="Add Id Selector"
                              className="input-container-text"
                              onKeyPress={(e) => this.handleIdSelectorChange(e)}
                              onChange={(e) => this.handleIdSelectorChange(e)}
                              value={this.state.idSelectorValue}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="element-item-row">
                      <div className="element-item-row-header">
                        <div className="meta-data-icon" />
                        Name Selector
                      </div>
                      <div className="element-item-row-border" />
                      <div className="element-item-row-footer">
                        {this.state.nameSelectorValue &&
                        this.state.nameSelectorcondition ? (
                          <div
                            className="element-item-row-footer-btn"
                            onDoubleClick={() => this.editnameSelector()}
                          >
                            {this.state.nameSelectorValue}
                          </div>
                        ) : (
                          <Input
                            type="text"
                            className="input-container-text"
                            placeholder="Add Name Selector"
                            onKeyPress={(e) => this.handleNameSelectorChange(e)}
                            onChange={(e) => this.handleNameSelectorChange(e)}
                            value={this.state.nameSelectorValue}
                          />
                        )}
                      </div>
                    </div>
                    {this.props.showTimeoutField ? (
                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />
                          Time Out Configuration (Seconds)
                        </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          {this.state.configureTimeout &&
                          this.state.configureTimeoutcondition ? (
                            <div
                              className="element-item-row-footer-btn"
                              onDoubleClick={() => this.editcofigureTimeout()}
                            >
                              {this.state.configureTimeout}
                            </div>
                          ) : (
                            <Input
                              type="number"
                              className="input-container-text"
                              placeholder="Add Name Selector"
                              onKeyPress={(e) =>
                                this.handleConfigureTimeoutChange(e)
                              }
                              onChange={(e) =>
                                this.handleConfigureTimeoutChange(e)
                              }
                              value={this.state.configureTimeout}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}

                    <div className="element-item-row">
                      <div className="element-item-row-header">
                        <div className="meta-data-icon" />
                        Class Selector
                      </div>
                      <div className="element-item-row-border" />
                      <div className="input-tag">
                        <ul className="input-tag__tags">
                          {this.state.tagsClass.map((tag, i) => (
                            <li key={tag} onDoubleClick={() => this.editTag(i)}>
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  this.removeTag(i);
                                }}
                              >
                                +
                              </button>
                            </li>
                          ))}
                          <li className="input-tag__tags__input">
                            <input
                              type="text"
                              className="input-container-text"
                              onKeyDown={this.inputKeyDown}
                              ref={(c) => {
                                this.tagInput = c;
                              }}
                            />
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="element-item-row">
                      <div className="element-item-row-header">
                        <div className="meta-data-icon" />
                        XPath Selectors
                      </div>
                      <div className="element-item-row-border" />
                      <div className="input-tag">
                        <ul className="input-tag__tags">
                          {this.state.tagsXPath.map((tag, i) => (
                            <li
                              key={tag}
                              onDoubleClick={() => this.editTagXPath(i)}
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  this.removeTagXPath(i);
                                }}
                              >
                                +
                              </button>
                            </li>
                          ))}
                          <li className="input-tag__tags__input">
                            <input
                              type="text"
                              className="input-container-text"
                              onKeyDown={this.inputKeyDownXpath}
                              ref={(c) => {
                                this.tagInputXpath = c;
                              }}
                            />
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* <div className="element-item-row">
                    <div className="element-item-row-header">
                      <div className="meta-data-icon" />X Y Coordinates
                    </div>
                    <div className="element-item-row-border" />
                    <div className="element-item-row-footer" style={{ display: "block" }}>
                      For the browser having
                      <span className="element-item-row-footer-bold-text">&nbsp; &nbsp;</span>
                      viewport window, The element is present on XY Position:
                      <span className="element-item-row-footer-bold-text">&nbsp; &nbsp;</span>
                      after the scroll of
                      <span className="element-item-row-footer-bold-text">&nbsp;</span>.
                    </div>
                  </div> */}
                    {/* </Collapse.Panel> */}
                  </Form>
                </TabPane>
                {/* <div className="meta-data-border" />
                 <Collapse.Panel header="ELEMENT ATTRIBUTES" key="3">
                  <div className="element-attributes-container">
                    <JSONTree hideRoot="true" data={this.state.elementAttributesJson} shouldExpandNode={() => {}} />
                  </div>
                </Collapse.Panel> */}
                <TabPane tab="API" key="2">
                  <Form>
                    <div className="element-item-row-method-uri">
                      <div
                        className="element-item-row-method"
                        style={{ width: 180 }}
                      >
                        <Form.Item>
                          {getFieldDecorator("Method", {
                            rules: [
                              {
                                required: true,
                              },
                            ],
                            initialValue: "GET",
                          })(
                            <select className="select-env">
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          )}
                        </Form.Item>
                      </div>
                      <div className="element-item-row-uri">
                        <Form.Item>
                          {getFieldDecorator("Uri", {
                            rules: [
                              {
                                required: true,
                              },
                            ],
                            initialValue: "",
                          })(
                            <Input placeholder="http://localhost:3000/api/endpoint" />
                          )}
                        </Form.Item>
                      </div>
                    </div>
                    <Collapse
                      className="antd-collapse-container element-item-row-api"
                      bordered={true}
                      defaultActiveKey={["1", "2", "3", "4", "5", "6"]}
                      expandIcon={({ isActive }) => (
                        <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                      )}
                    >
                      <Collapse.Panel header="PATH PARAMETERS" key="1">
                        <div className="lable-key-value-container">
                          <div className="lable-key-value">KEY</div>
                          <div className="lable-key-value">VALUE</div>
                          <div className="lable-key-value-blank" />
                        </div>
                        {this.RenderPathParameters()}
                        <div className="sidebar-body-regular-row">
                          <Form.Item>
                            {getFieldDecorator("PathParametersKey")(<Input />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator("PathParametersValue")(
                              <Input />
                            )}
                          </Form.Item>
                          <div
                            onClick={this.PathParametersAdd}
                            className="sidebar-body-regular-row-right-btn"
                          >
                            <i className="fa fa-plus" />
                          </div>
                        </div>
                      </Collapse.Panel>
                      <div className="sidebar-body-divider" />

                      <Collapse.Panel header="QUERY PARAMETERS" key="2">
                        <div className="lable-key-value-container">
                          <div className="lable-key-value">KEY</div>
                          <div className="lable-key-value">VALUE</div>
                          <div className="lable-key-value-blank" />
                        </div>
                        {this.RenderQueryParameters()}
                        <div className="sidebar-body-regular-row">
                          <Form.Item>
                            {getFieldDecorator("QueryParametersKey")(<Input />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator("QueryParametersValue")(
                              <Input />
                            )}
                          </Form.Item>
                          <div
                            onClick={this.QueryParametersAdd}
                            className="sidebar-body-regular-row-right-btn"
                          >
                            <i className="fa fa-plus" />
                          </div>
                        </div>
                      </Collapse.Panel>

                      <div className="sidebar-body-divider" />

                      <Collapse.Panel header="AUTHORIZATION" key="3">
                        <div className="sidebar-body-regular-row">
                          <Form.Item label="USERNAME">
                            {getFieldDecorator("AuthorizationUsername", {
                              initialValue: "",
                            })(<Input autoComplete="new-password" />)}
                          </Form.Item>
                          <Form.Item label="PASSWORD">
                            {getFieldDecorator("AuthorizationPassword", {
                              initialValue: "",
                            })(
                              <Input
                                type={
                                  this.state.showPassword ? "text" : "password"
                                }
                                autoComplete="new-password"
                              />
                            )}
                          </Form.Item>

                          <div
                            onClick={() =>
                              this.setState({
                                showPassword: !this.state.showPassword,
                              })
                            }
                            className="sidebar-body-regular-row-right-btn"
                            style={{ marginTop: "53px" }}
                          >
                            <i
                              className={
                                "fa " +
                                (this.state.showPassword
                                  ? "fa-eye-slash"
                                  : "fa-eye")
                              }
                            />
                          </div>
                        </div>
                      </Collapse.Panel>

                      <div className="sidebar-body-divider" />

                      <Collapse.Panel header="HEADERS" key="4">
                        <div className="lable-key-value-container">
                          <div className="lable-key-value">KEY</div>
                          <div className="lable-key-value">VALUE</div>
                          <div className="lable-key-value-blank" />
                        </div>
                        {this.RenderHeaders()}
                        <div className="sidebar-body-regular-row">
                          <Form.Item>
                            {getFieldDecorator("HeadersKey")(<Input />)}
                          </Form.Item>
                          <Form.Item>
                            {getFieldDecorator("HeadersValue")(<Input />)}
                          </Form.Item>
                          <div
                            onClick={this.HeadersAdd}
                            className="sidebar-body-regular-row-right-btn"
                          >
                            <i className="fa fa-plus" />
                          </div>
                        </div>
                      </Collapse.Panel>

                      <div className={"sidebar-body-divider"} />

                      <Collapse.Panel header="BODY" key="5">
                        <div className="sidebar-body-regular-row-body-menu-container">
                          <div className="sidebar-body-regular-row-body-menu">
                            <div
                              onClick={() => this.BodySelectedMenu("None")}
                              className={
                                "sidebar-body-regular-row-body-menu-items " +
                                (this.state.BodySelectedMenu === "None"
                                  ? "sidebar-body-regular-row-body-menu-items-active"
                                  : "")
                              }
                            >
                              None
                            </div>
                            <div
                              onClick={() => this.BodySelectedMenu("FormData")}
                              className={
                                "sidebar-body-regular-row-body-menu-items " +
                                (this.state.BodySelectedMenu === "FormData"
                                  ? "sidebar-body-regular-row-body-menu-items-active"
                                  : "")
                              }
                            >
                              Form Data
                            </div>
                            <div
                              onClick={() => this.BodySelectedMenu("XML")}
                              className={
                                "sidebar-body-regular-row-body-menu-items " +
                                (this.state.BodySelectedMenu === "XML"
                                  ? "sidebar-body-regular-row-body-menu-items-active"
                                  : "")
                              }
                            >
                              XML
                            </div>
                            <div
                              onClick={() => this.BodySelectedMenu("JSON")}
                              className={
                                "sidebar-body-regular-row-body-menu-items " +
                                (this.state.BodySelectedMenu === "JSON"
                                  ? "sidebar-body-regular-row-body-menu-items-active"
                                  : "")
                              }
                            >
                              JSON
                            </div>
                            <div
                              onClick={() => this.BodySelectedMenu("TEXT")}
                              className={
                                "sidebar-body-regular-row-body-menu-items " +
                                (this.state.BodySelectedMenu === "TEXT"
                                  ? "sidebar-body-regular-row-body-menu-items-active"
                                  : "")
                              }
                            >
                              TEXT
                            </div>
                          </div>
                        </div>
                        {this.RenderBodySelectedMenu()}
                      </Collapse.Panel>
                    </Collapse>
                  </Form>
                </TabPane>
              </Tabs>
            </Modal.Body>
          </Modal>
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default AddNewTestcaseSteps;
