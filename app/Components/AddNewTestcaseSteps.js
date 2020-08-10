import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Input, Upload, Form } from "antd";
import constants from "../constants";
import axios from "axios";
import Loader from "./Loader";
import AutosizeInput from "react-input-autosize";

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
      const { beforeStepIndex, afterStepIndex } = this.props;

      let fileupload_url;
      if (this.state.fileupload_or_not) {
        let fileUpload = new FormData();
        fileUpload.append("files", form.getFieldValue("StepFileUpload").file.originFileObj);
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
        return Alert.warning("Please provide any element locator");
      }
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

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <Modal
            className="meta-data-modal-body"
            full
            show={this.props.addnewSteps}
            onHide={this.hideModal}
            // onEnter={this.onEnterAction}
          >
            <Modal.Header closeButton={false} className="modal-fixed-header">
              <div className="modal-container-with-button">
                <div className="meta-data-modal-header-title">Add New TestCase Steps</div>
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
            <Modal.Body className="modal-body-scrool">
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
              <Collapse
                className="antd-collapse-container"
                bordered={true}
                defaultActiveKey={["1", "2", "3"]}
                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
              >
                <div className="meta-data-border" />
                <Collapse.Panel header="ELEMENT LOCATORS" key="2">
                  <div className="element-item-row">
                    <div
                      className="element-item-row-header"
                      onClick={() => this.setState({ fileupload_or_not: !this.state.fileupload_or_not })}
                      style={{ height: "39.09px", cursor: "pointer" }}
                    >
                      <i className="fa fa-caret-right" style={this.state.fileupload_or_not ? { transform: "rotate(90deg)" } : {}} />
                      File Upload
                    </div>
                    {this.state.fileupload_or_not ? (
                      <React.Fragment>
                        <div className="element-item-row-border" />
                        <div className="element-item-row-footer">
                          <div className="file-upload-container">
                            <Form.Item>
                              {getFieldDecorator("StepFileUpload", {
                                initialValue: "",
                              })(
                                <Upload.Dragger
                                  multiple={false}
                                  showUploadList={false}
                                  onChange={(e) => this.setState({ uploadedFileName: e.file.name })}
                                >
                                  <p className="ant-upload-text">
                                    {this.state.uploadedFileName ? this.state.uploadedFileName : "Click or drag file to upload."}
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
                      {this.state.valueSelectorValue && this.state.valueSelector ? (
                        <div className="element-item-row-footer-btn" onDoubleClick={() => this.editValueSelector()}>
                          {this.state.valueSelectorValue}
                        </div>
                      ) : (
                        <Input
                          type="text"
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
                  {this.props.showTimeoutField ? (
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
                </Collapse.Panel>
                {/* <div className="meta-data-border" />
                 <Collapse.Panel header="ELEMENT ATTRIBUTES" key="3">
                  <div className="element-attributes-container">
                    <JSONTree hideRoot="true" data={this.state.elementAttributesJson} shouldExpandNode={() => {}} />
                  </div>
                </Collapse.Panel> */}
              </Collapse>
            </Modal.Body>
          </Modal>
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default AddNewTestcaseSteps;
