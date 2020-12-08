import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Input, Upload, Form } from "antd";
import constants from "../constants";
import Loader from "./Loader";
import JSONTree from "react-json-tree";
import axios from "axios";
import AutosizeInput from "react-input-autosize";
import AceEditor from "react-ace";

const MetaDataModal = Form.create()(
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
        bestMatchcondition: false,
        bestMatchValue: "",
        tagsXPath: [],
        valueSelector: false,
        valueSelectorValue: "",
        tag_width: 0,
        uploadedFileName: "",
        configureTimeout: null,
        configureTimeoutcondition: false,
        elementAttributesJson: this.props.modalInformation.element_attributes || this.props.modalInformation.custom_attributes || {},
        actionValue: "",
        element_type: "text",
        PathParametersAdd: [
          { "PathParametersKey": '1', "PathParametersValue": '1' },
          { "PathParametersKey": '2', "PathParametersValue": '2' }
        ],
        showPassword: false,
        QueryParametersAdd: [],
        HeadersAdd: [],
        BodySelectedMenu: "None",
        BodyFormDataAdd: [],
        AceEditorValue: [],
        AceEditorValidation: [],
        api_attributes: {}
      };
      this.saveRecords = this.saveRecords.bind(this);
    }
    componentDidMount() {
      if (this.props.modalInformation.element_attributes && this.props.modalInformation.element_attributes.class) {
        let class_attribute = this.props.modalInformation.element_attributes.class.trimRight();
        this.setState({
          tagsClass: class_attribute.split(" "),
        });
      }

      this.setState({
        actionValue: this.props.modalInformation.action,
        configureTimeout: this.props.modalInformation.timeout,
        configureTimeoutcondition: this.props.modalInformation.timeout ? true : false,
        valueSelectorValue: this.props.modalInformation.element_value,
        nameSelectorValue: this.props.modalInformation.element_attributes ? this.props.modalInformation.element_attributes.name : "",
        bestMatchValue: this.props.modalInformation.best_match,
        bestMatchcondition: this.props.modalInformation.best_match ? true : false,
        idSelectorValue: this.props.modalInformation.element_id,
        tagsXPath: this.props.modalInformation.element_xpaths,
        valueSelector: this.props.modalInformation.element_value ? true : false,
        idSelectorCondition: this.props.modalInformation.element_id ? true : false,
        nameSelectorcondition: this.props.modalInformation.element_attributes
          ? this.props.modalInformation.element_attributes.name
            ? true
            : false
          : "",
        element_type: this.props.modalInformation.element_attributes
          ? this.props.modalInformation.element_attributes.type
            ? this.props.modalInformation.element_attributes.type.toLowerCase() === "password"
              ? "password"
              : "text"
            : "text"
          : "text",
        api_attributes: this.props.modalInformation.api_attributes ? this.props.modalInformation.api_attributes : {}
      });
      if (this.props.modalInformation.api_attributes) {
        this.setState({
          PathParametersAdd: this.props.modalInformation.api_attributes['PathParametersAdd'] ? this.props.modalInformation.api_attributes['PathParametersAdd'] : [],
          QueryParametersAdd: this.props.modalInformation.api_attributes['QueryParametersAdd'] ? this.props.modalInformation.api_attributes['QueryParametersAdd'] : [],
          HeadersAdd: this.props.modalInformation.api_attributes['HeadersAdd'] ? this.props.modalInformation.api_attributes['HeadersAdd'] : [],
          BodySelectedMenu: this.props.modalInformation.api_attributes['BodySelectedMenu'],
          BodyFormDataAdd: this.props.modalInformation.api_attributes['BodyFormDataAdd'] ? this.props.modalInformation.api_attributes['BodyFormDataAdd'] : [],
          AceEditorValue: this.props.modalInformation.api_attributes['AceEditorValue'] ? this.props.modalInformation.api_attributes['AceEditorValue'] : "",
        })
      }
    }

    updateProps = () => {
      if (this.props.modalInformation.element_attributes && this.props.modalInformation.element_attributes.class) {
        let class_attribute = this.props.modalInformation.element_attributes.class.trimRight();
        this.setState({
          tagsClass: class_attribute.split(" "),
        });
      } else {
        this.setState({
          tagsClass: [],
        });
      }

      this.setState({
        configureTimeout: this.props.modalInformation.timeout,
        configureTimeoutcondition: this.props.modalInformation.timeout ? true : false,
        valueSelectorValue: this.props.modalInformation.element_value,
        nameSelectorValue: this.props.modalInformation.element_attributes ? this.props.modalInformation.element_attributes.name : "",
        bestMatchValue: this.props.modalInformation.best_match,
        idSelectorValue: this.props.modalInformation.element_id,
        tagsXPath: this.props.modalInformation.element_xpaths,
        valueSelector: this.props.modalInformation.element_value ? true : false,
        idSelectorCondition: this.props.modalInformation.element_id ? true : false,
        nameSelectorcondition: this.props.modalInformation.element_attributes
          ? this.props.modalInformation.element_attributes.name
            ? true
            : false
          : "",
        elementAttributesJson: this.props.modalInformation.element_attributes,
      });
    };

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
        if (this.state.tagsClass.find((tag) => tag.toLowerCase() === val.toLowerCase())) {
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
        if (this.state.tagsXPath.find((tag) => tag.toLowerCase() === val.toLowerCase())) {
          return;
        }
        this.setState({ tagsXPath: [...this.state.tagsXPath, val] });
        this.tagInputXpath.value = null;
      }
    };

    handleBestMatchKeyDown = (e) => {
      const val = e.target.value;
      if (e.key === "Enter" && val) {
        this.setState({ bestMatchcondition: true });
      }
    };

    handleBestMatchChange = (e) => {
      this.setState({ bestMatchValue: e.target.value });
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

    onEnterAction = () => {
      this.setState({ tagValue: "" });
      if (this.props.modalInformation.tag) {
        this.setState({
          tagValue: this.props.modalInformation.tag.split("/")[this.props.modalInformation.tag.split("/").length - 1],
        });
      }
    };

    saveRecords = async function () {
      const form = this.props.form;
      if (this.props.modalInformation.action != "custom_api") {
        this.setState({ loader: true });
        // const form = this.props.form;
        let url = constants.objectrepositories + "/" + this.props.modalInformation.id;
        let fileupload_url;
        if (this.props.modalInformation.action === "fileupload" && this.state.fileData) {
          let fileUpload = new FormData();
          fileUpload.append("files", this.state.fileData.file.originFileObj);
          const reqFileUpload = await axios.post(constants.upload, fileUpload, {
            headers: {
              "content-type": "multipart/form-data",
            },
          });
          if ([200, 201].includes(reqFileUpload.status)) {
            fileupload_url = reqFileUpload.data[0].id;
          }
        }

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: this.props.modalInformation.id,
            element_id: this.state.idSelectorValue, //id selector
            element_css: this.state.tagsClass.toString(), //class selector
            element_value: this.state.valueSelectorValue, //value selector,
            timeout: this.state.configureTimeout, //timeout
            element_attributes: this.state.elementAttributesJson, //elements attributes
            element_xpaths: this.state.tagsXPath, //x-path
            tag: this.state.tagValue,
            best_match: this.state.bestMatchValue,
            fileupload_url,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            Alert.success("Metadata updated successfully");
            this.setState({ tagValue: "", loader: false });
            this.props.loadTestcase();
            this.props.onHide();
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
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
        let PathParametersAdd = this.state.PathParametersAdd;
        let QueryParametersAdd = this.state.QueryParametersAdd;
        let HeadersAdd = this.state.HeadersAdd;
        // Auto save key and value if only written and not added in array
        if (
          form.getFieldValue("PathParametersKey") &&
          form.getFieldValue("PathParametersValue")
        ) {
          PathParametersAdd.push({
            PathParametersKey: form.getFieldValue("PathParametersKey"),
            PathParametersValue: form.getFieldValue("PathParametersValue"),
          });
          form.resetFields("PathParametersKey");
          form.resetFields("PathParametersValue");
        }
        if (
          form.getFieldValue("QueryParametersKey") &&
          form.getFieldValue("QueryParametersValue")
        ) {
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
          HeadersAdd.push({
            HeadersKey: form.getFieldValue("HeadersKey"),
            HeadersValue: form.getFieldValue("HeadersValue"),
          });
          // console.log("headerssss --->", HeadersAdd);
          form.resetFields("HeadersKey");
          form.resetFields("HeadersValue");
        }
        this.handleConfirm({
          Method: form.getFieldValue("Method"),
          Uri: form.getFieldValue("Uri"),
          PathParametersAdd: PathParametersAdd,
          QueryParametersAdd: QueryParametersAdd,
          AuthorizationUsername: form.getFieldValue("AuthorizationUsername"),
          AuthorizationPassword: form.getFieldValue("AuthorizationPassword"),
          HeadersAdd: HeadersAdd,
          BodySelectedMenu: this.state.BodySelectedMenu,
          BodyFormDataAdd: this.state.BodyFormDataAdd,
          AceEditorValue: this.state.AceEditorValue,
        });
      }
    };
    handleConfirm = async (data) => {
      let payload = {
        api_attributes: data,
      };
      // console.log("save_data -->", data);
      let url = constants.objectrepositories + "/" + this.props.modalInformation.id;
      let method = axios.put;
      method(url, payload).then((response) => {
        if (response.status === 200) {
          Alert.success("Metadata updated successfully");
          this.setState({ tagValue: "", loader: false });
          this.props.loadTestcase();
          this.props.onHide();
        } else {
          Alert.error("something went wrong");
        }
      });
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

    editValueSelector = () => {
      this.setState({ valueSelector: false });
    };

    editIdSelector = () => {
      this.setState({ idSelectorCondition: false });
    };

    editnameSelector = () => {
      this.setState({ nameSelectorcondition: false });
    };

    editBestMatch = () => {
      this.setState({ bestMatchcondition: false });
    };

    changeText = (e) => {
      this.setState({
        tagValue: e.target.value,
      });
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

    editcofigureTimeout = () => {
      this.setState({ configureTimeoutcondition: false });
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
                        // disabled={true}
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
                        // disabled={true}
                        onChange={(e) =>
                          (this.state.PathParametersAdd[
                            index
                          ].PathParametersValue = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <div
                    // style={{ pointerEvents: "none" }}
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
    PathParametersRemove = (index) => {
      let PathParametersRemove = this.state.PathParametersAdd;
      PathParametersRemove.splice(index, 1);
      this.setState({ PathParametersAdd: PathParametersRemove });
    };
    QueryParametersRemove = (index) => {
      let QueryParametersRemove = this.state.QueryParametersAdd;
      QueryParametersRemove.splice(index, 1);
      this.setState({ QueryParametersAdd: QueryParametersRemove });
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
                        // disabled={true}
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
                        // disabled={true}
                        onChange={(e) =>
                          (this.state.QueryParametersAdd[
                            index
                          ].QueryParametersValue = e.target.value)
                        }
                      />
                    )}
                  </Form.Item>
                  <div
                    // style={{ pointerEvents: "none" }}
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
                        // disabled={true}
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
                        // disabled={true}
                        onChange={(e) => {
                          this.state.HeadersAdd[index].HeadersValue =
                            e.target.value;
                        }}
                      />
                    )}
                  </Form.Item>
                  <div
                    // style={{ pointerEvents: "none" }}
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
                // style={{ pointerEvents: 'none' }}
                onClick={() => this.BodyFormDataAdd("Text")}
                className="formdata-select-button"
              >
                Add Text
              <i className="fa fa-pencil" style={{ color: "#c5c6c7" }} />
              </div>
              <div
                // style={{ pointerEvents: 'none' }}
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
    }
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
                        // disabled={true}
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
                          // disabled={true}
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
                            // disabled={true}
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
                    // style={{ pointerEvents: 'none' }}
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

    render() {
      const { getFieldDecorator } = this.props.form;

      if (this.props.modalInformation) {
        return (
          <React.Fragment>
            <Modal className="meta-data-modal-body" full show={this.props.metaDataModal} onEnter={this.onEnterAction} onHide={this.props.onHide}>
              <Modal.Header closeButton={false} className="modal-fixed-header">
                <div className="modal-container-with-button">
                  <div className="meta-data-modal-header-title">Meta Data Information</div>
                  <div className="sr-form-footer-btn-container">
                    <div onClick={this.props.onHide} className="negative-button">
                      <i className="fa fa-close" /> Discard Change
                  </div>
                    <div onClick={this.saveRecords} className="positive-button">
                      <i className="fa fa-check" />
                    Update
                  </div>
                  </div>
                </div>
              </Modal.Header>
              <Modal.Body className="modal-body-scrool">
                <div className="meta-data-modal-body-header-container">
                  <div className="meta-data-modal-body-header-url">
                    <i className="globe-icon" />
                    <div title={this.props.modalInformation.url} className="meta-data-modal-body-header-url-text">
                      {this.props.modalInformation.url ? this.props.modalInformation.url.split("?")[0] : ""}
                    </div>
                  </div>
                  <div className="meta-data-modal-body-header-tags-btn">
                    <div className="meta-data-modal-body-header-tags-btn-icon">
                      <i className="fa fa-tag" />
                    </div>
                    <div className="meta-data-modal-body-header-tags-btn-text">
                      <AutosizeInput name="form-field-name" value={this.state.tagValue} placeholder="Add tag here" onChange={this.changeText} />
                      {/* <input
                      type="text"
                      placeholder="Add tag here"
                      size={this.state.tag_width}
                      onChange={this.changeText}
                      value={this.state.tagValue}
                    /> */}
                    </div>
                  </div>
                </div>
                <Collapse
                  className="antd-collapse-container"
                  bordered={true}
                  defaultActiveKey={["1", "2", "3"]}
                  expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                >
                  <Collapse.Panel header="EVENT" key="1">
                    <div className="event-container">
                      <div className={"event-container-items " + (this.props.modalInformation.action === "mouselclick" ? "active" : "")}>
                        Left Click
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "mouserclick" ? "active" : "")}>
                        Right Click
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "mousedclick" ? "active" : "")}>
                        Double Click
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "tap" ? "active" : "")}>Tap</div>
                      <div
                        className={
                          "event-container-items " +
                          (this.props.modalInformation.action === "text_input" || this.props.modalInformation.action === "sendkey" ? "active" : "")
                        }
                      >
                        Text Input
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "dropdown" ? "active" : "")}>Dropdown</div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "mouseover" ? "active" : "")}>Hover</div>
                      <div
                        className={
                          "event-container-items " +
                          (this.props.modalInformation.action === "drag" || this.props.modalInformation.action === "drop" ? "active" : "")
                        }
                      >
                        Drag & Drop
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "custom" ? "active" : "")}>Custom</div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "fileupload" ? "active" : "")}>
                        File Upload
                    </div>
                      <div className={"event-container-items " + (this.props.modalInformation.action === "custom_api" ? "active" : "")}>
                        API
                    </div>
                    </div>
                  </Collapse.Panel>
                  <div className="meta-data-border" />
                  {this.props.modalInformation.action === "custom_api" ?
                    //if action is api
                    <Collapse.Panel header="API Headers" key="2">
                      <div>
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
                                initialValue: this.state.api_attributes['Method'],
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
                                initialValue: this.state.api_attributes['Uri'],
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
                                {getFieldDecorator("PathParametersValue")(<Input />)}
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
                                {getFieldDecorator("QueryParametersValue")(<Input />)}
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
                                  initialValue: this.state.api_attributes['AuthorizationUsername'],
                                })(
                                  <Input autoComplete="new-password" />
                                )}
                              </Form.Item>
                              <Form.Item label="PASSWORD">
                                {getFieldDecorator("AuthorizationPassword", {
                                  initialValue: this.state.api_attributes['AuthorizationPassword'],
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
                      </div>
                    </Collapse.Panel>
                    :
                    //action is not api
                    <Collapse.Panel header="ELEMENT LOCATORS" key="2">
                      {this.props.modalInformation.action === "fileupload" ? (
                        <div className="element-item-row">
                          <div className="element-item-row-header">
                            <div className="meta-data-icon" />
                        Upload File
                      </div>
                          <React.Fragment>
                            <div className="element-item-row-border" />
                            <div className="element-item-row-footer">
                              <div className="file-upload-container">
                                {/* <Form.Item>
                                {getFieldDecorator("StepFileUpload", {
                                  initialValue: ""
                                })( */}
                                <Upload.Dragger
                                  multiple={false}
                                  showUploadList={false}
                                  onChange={(e) => {
                                    this.setState({ uploadedFileName: e.file.name, fileData: e });
                                  }}
                                >
                                  {this.props.modalInformation.fileupload_url ? (
                                    <p className="ant-upload-text">
                                      {this.state.uploadedFileName
                                        ? this.state.uploadedFileName
                                        : `"${this.props.modalInformation.fileupload_url.name}" alredy uploaded`}
                                    </p>
                                  ) : (
                                      <p className="ant-upload-text">
                                        {this.state.uploadedFileName ? this.state.uploadedFileName : "Click or drag file to upload."}
                                      </p>
                                    )}
                                </Upload.Dragger>
                                {/* )}
                              </Form.Item> */}
                              </div>
                            </div>
                          </React.Fragment>
                        </div>
                      ) : null}

                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />
                      Action
                    </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          {this.state.actionValue ? (
                            <div className="element-item-row-footer-btn">{this.state.actionValue}</div>
                          ) : (
                              <Input
                                type="text"
                                placeholder="Add Id Selector"
                                className="input-container-text"
                                // onKeyPress={e => this.handleValueSelectorChange(e)}
                                // onChange={e => this.handleValueSelectorChange(e)}
                                value={this.state.actionValue}
                              />
                            )}
                        </div>
                      </div>
                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />
                      Value Selector
                    </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          {this.state.valueSelectorValue && this.state.valueSelector ? (
                            // <div className="element-item-row-footer-btn" onDoubleClick={() => this.editValueSelector()}>
                            //   {this.state.valueSelectorValue}
                            // </div>
                            <Input
                              className="element-item-row-footer-btn"
                              onDoubleClick={() => this.editValueSelector()}
                              type={this.state.element_type}
                              placeholder="Add Id Selector"
                              value={this.state.valueSelectorValue}
                            />
                          ) : (
                              <Input
                                type={this.state.element_type}
                                placeholder="Add Id Selector"
                                className="input-container-text"
                                onKeyPress={(e) => this.handleValueSelectorChange(e)}
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
                            {this.state.idSelectorValue && this.state.idSelectorCondition ? (
                              <div className="element-item-row-footer-btn" onDoubleClick={() => this.editIdSelector()}>
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
                          {this.state.nameSelectorValue && this.state.nameSelectorcondition ? (
                            <div className="element-item-row-footer-btn" onDoubleClick={() => this.editnameSelector()}>
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
                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />
                      Best Match
                    </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          {this.state.bestMatchValue && this.state.bestMatchcondition ? (
                            <div className="element-item-row-footer-btn" onDoubleClick={() => this.editBestMatch()}>
                              {this.state.bestMatchValue}
                            </div>
                          ) : (
                              <Input
                                type="text"
                                className="input-container-text"
                                placeholder="Add Best Match"
                                onKeyPress={(e) => this.handleBestMatchKeyDown(e)}
                                onChange={(e) => this.handleBestMatchChange(e)}
                                value={this.state.bestMatchValue}
                              />
                            )}
                        </div>
                      </div>

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
                            {this.state.tagsXPath
                              ? this.state.tagsXPath.map((tag, i) => (
                                <li key={tag} onDoubleClick={() => this.editTagXPath(i)}>
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
                              ))
                              : null}
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
                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />
                      Time Out Configuration (Seconds)
                    </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          {this.state.configureTimeout && this.state.configureTimeoutcondition ? (
                            <div className="element-item-row-footer-btn" onDoubleClick={() => this.editcofigureTimeout()}>
                              {this.state.configureTimeout}
                            </div>
                          ) : (
                              <Input
                                type="number"
                                className="input-container-text"
                                placeholder="Add Name Selector"
                                onKeyPress={(e) => this.handleConfigureTimeoutChange(e)}
                                onChange={(e) => this.handleConfigureTimeoutChange(e)}
                                value={this.state.configureTimeout}
                              />
                            )}
                        </div>
                      </div>
                      <div className="element-item-row">
                        <div className="element-item-row-header">
                          <div className="meta-data-icon" />X Y Coordinates
                    </div>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer" style={{ display: "block" }}>
                          For the browser having
                      <span className="element-item-row-footer-bold-text">
                            &nbsp;
                        {`${this.props.modalInformation.browser_width || 0}px `}X{` ${this.props.modalInformation.browser_height || 0}px`}
                        &nbsp;
                      </span>
                      viewport window, The element is present on XY Position:
                      <span className="element-item-row-footer-bold-text">
                            &nbsp;
                        {`${this.props.modalInformation.x_cord || 0}px `}X{` ${this.props.modalInformation.y_cord || 0}px`}
                        &nbsp;
                      </span>
                      after the scroll of
                      <span className="element-item-row-footer-bold-text">
                            &nbsp;
                        {`${this.props.modalInformation.y_scroll || 0}px`}
                          </span>
                      .
                    </div>
                      </div>
                    </Collapse.Panel>}
                  <div className="meta-data-border" />
                  {this.props.modalInformation.action === "custom_api" ? null :
                    <Collapse.Panel header="ELEMENT ATTRIBUTES" key="3">
                      <div className="element-attributes-container">
                        <JSONTree hideRoot="true" data={this.state.elementAttributesJson} shouldExpandNode={() => { }} />
                      </div>
                    </Collapse.Panel>}
                </Collapse>
              </Modal.Body>
            </Modal>
            <Loader status={this.state.loader} />
          </React.Fragment>
        );
      } else {
        return "";
      }
    }
  })

export default MetaDataModal;
