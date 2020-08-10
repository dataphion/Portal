import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Input, Upload } from "antd";
import constants from "../constants";
import Loader from "./Loader";
import JSONTree from "react-json-tree";
import axios from "axios";
import AutosizeInput from "react-input-autosize";

class MetaDataModal extends React.Component {
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
    });
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

  render() {
    // const { getFieldDecorator } = this.props.form;

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
                  </div>
                </Collapse.Panel>
                <div className="meta-data-border" />
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
                </Collapse.Panel>
                <div className="meta-data-border" />
                <Collapse.Panel header="ELEMENT ATTRIBUTES" key="3">
                  <div className="element-attributes-container">
                    <JSONTree hideRoot="true" data={this.state.elementAttributesJson} shouldExpandNode={() => {}} />
                  </div>
                </Collapse.Panel>
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
}

export default MetaDataModal;
