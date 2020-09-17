import React from "react";
import { Icon, Collapse, Input } from "antd";
import { Modal, Alert } from "rsuite";
import ReactJson from "react-json-view";
import Lightbox from "react-image-lightbox";
import constants from "../../../constants";
import Loader from "../../../Components/Loader";
import "../../../Assets/Styles/Custom/Dashboard/PageElementBody.scss";
import "../../../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import JSONTree from "react-json-tree";
import AutosizeInput from "react-input-autosize";
export default class PageElementBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      current_image: "",
      current_image_type: "",
      isOpen: false,
      tagValue: "",
      tagsClass: [],
      idSelectorCondition: false,
      idSelectorValue: "",
      nameSelectorcondition: false,
      nameSelectorValue: "",
      tagsXPath: [],
      valueSelector: false,
      valueSelectorValue: "",
      elementAttributesJson: this.props.element_values.element_attributes,
      button_display: false,
    };
  }

  componentDidMount = () => {
    this.setState({
      tagValue: this.props.element_values.tag,
    });
    console.log(this.props.element_values);
    if (this.props.element_values.element_attributes) {
      if (this.props.element_values.element_attributes.class) {
        this.setState({
          tagsClass: this.props.element_values.element_attributes.class.split(" "),
        });
      }
    }
    this.setState({
      valueSelectorValue: this.props.element_values.element_value,
      nameSelectorValue: this.props.element_values.element_attributes ? this.props.element_values.element_attributes.name : "",
      idSelectorValue: this.props.element_values.element_id,
      tagsXPath: this.props.element_values.element_xpaths,
      valueSelector: this.props.element_values.element_value ? true : false,
      idSelectorCondition: this.props.element_values.element_id ? true : false,
      nameSelectorcondition: this.props.element_values.element_attributes ? (this.props.element_values.element_attributes.name ? true : false) : false,
    });
  };

  // ** function for edittable input box **//
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
          button_display: true,
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
      this.setState({
        tagsXPath: [...this.state.tagsXPath, val],
        button_display: true,
      });
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
        button_display: true,
      });
    }
  };

  editValueSelector = () => {
    this.setState({ valueSelector: false, button_display: true });
  };

  editIdSelector = () => {
    this.setState({ idSelectorCondition: false, button_display: true });
  };

  editnameSelector = () => {
    this.setState({ nameSelectorcondition: false, button_display: true });
  };

  changeText = (e) => {
    this.setState({
      tagValue: e.target.value,
      button_display: true,
    });
  };

  saveRecords = () => {
    this.setState({ loader: true });
    let url = constants.objectrepositories + "/" + this.props.element_values.id;

    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: this.props.element_values.id,
        element_id: this.state.idSelectorValue, //id selector
        element_css: this.state.tagsClass.toString(), //class selector
        element_value: this.state.valueSelectorValue, //value selector
        element_attributes: this.state.elementAttributesJson, //elements attributes
        element_xpaths: this.state.tagsXPath, //x-path
        tag: this.state.tagValue,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        Alert.success("Metadata updated successfully");
        this.setState({ loader: false, button_display: false });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  revertChanges = () => {
    this.setState({
      loader: true,
    });
    if (this.props.element_values.element_attributes.class) {
      this.setState({
        tagsClass: this.props.element_values.element_attributes.class.split(" "),
      });
    }
    this.setState(
      {
        valueSelectorValue: this.props.element_values.element_value,
        nameSelectorValue: this.props.element_values.element_attributes.name,
        idSelectorValue: this.props.element_values.element_id,
        tagsXPath: this.props.element_values.element_xpaths,
        valueSelector: this.props.element_values.element_value ? true : false,
        idSelectorCondition: this.props.element_values.element_id ? true : false,
        nameSelectorcondition: this.props.element_values.element_attributes.name ? true : false,
        tagValue: this.props.element_values.tag,
        elementAttributesJson: this.props.element_values.element_attributes,
      },
      () => {
        this.setState({ loader: false, button_display: false });
      }
    );
  };

  render() {
    let h_url = this.props.element_values.highlighted_image_url;
    let e_url = this.props.element_values.element_snapshot;
    let b_url = this.props.element_values.page_url;
    console.log("tagsXPath---->", this.state.tagsXPath);
    return (
      <div className="element-details-container">
        <div className="absolute-pixel" id={this.props.element_values.tag} />
        <div className="main-tag-container">
          <div className="main-tag-btn">
            <div className="main-tag-icon">
              <i className="fa fa-tag" aria-hidden="true" />
            </div>
            <div className="main-tag-text-container">
              <AutosizeInput name="form-field-name" value={this.state.tagValue} placeholder="Add tag here" onChange={this.changeText} />
            </div>
          </div>
          <div>
            {this.state.button_display ? (
              <div className="sr-form-footer-btn-container">
                <div className="negative-button" onClick={this.revertChanges}>
                  <i className="fa fa-close" /> Discard Change
                </div>
                <div className="positive-button" onClick={this.saveRecords}>
                  <i className="fa fa-check" />
                  Update
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <Collapse className="page-element-right-body-accordian antd-collapse-container" bordered={true} expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}>
          <div className="meta-data-border" />

          <Collapse.Panel header="ELEMENT LOCATORS" key="1">
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
                    : ""}

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

            {this.props.element_values.browser_width ? (
              <div className="element-item-row">
                <div className="element-item-row-header">
                  <div className="meta-data-icon" />X Y Coordinates
                </div>
                <div className="element-item-row-border" />
                <div className="element-item-row-footer" style={{ display: "block" }}>
                  For the browser having
                  <span className="element-item-row-footer-bold-text">
                    &nbsp;
                    {`${this.props.element_values.browser_width}px `}X{` ${this.props.element_values.browser_height}px`}
                    &nbsp;
                  </span>
                  viewport window, The element is present on XY Position:
                  <span className="element-item-row-footer-bold-text">
                    &nbsp;
                    {`${this.props.element_values.x_cord}px `}X{` ${this.props.element_values.y_cord}px`}
                    &nbsp;
                  </span>
                  after the scroll of
                  <span className="element-item-row-footer-bold-text">
                    &nbsp;
                    {`${this.props.element_values.y_scroll}px`}
                  </span>
                  .
                </div>
              </div>
            ) : (
              ""
            )}
          </Collapse.Panel>

          <div className="meta-data-border" />

          <Collapse.Panel header="ELEMENT ATTRIBUTES" key="2">
            <div className="element-attributes-container">
              {this.state.elementAttributesJson ? (
                <div>
                  <JSONTree hideRoot="true" data={this.state.elementAttributesJson} shouldExpandNode={() => {}} />
                </div>
              ) : (
                ""
              )}
            </div>
          </Collapse.Panel>

          <div className="meta-data-border" />

          <Collapse.Panel header="ELEMENT SNAPSHOTS" key="3">
            <div className="element-attributes-container metadata-img-container">
              <div
                className="metadata-img"
                onClick={() =>
                  this.setState({
                    current_image_type: "Highlighted Snapshot",
                    current_image: constants.image_host + h_url,
                    isOpen: true,
                  })
                }
              >
                <img className="img" src={h_url && h_url.trim() === "" ? require("../../../Assets/Images/blank.png") : constants.image_host + h_url} />
              </div>

              <div
                className="metadata-img"
                onClick={() =>
                  this.setState({
                    current_image_type: "Element Snapshot",
                    current_image: constants.image_host + e_url,
                    isOpen: true,
                  })
                }
              >
                <img className="img" src={e_url && e_url.trim() === "" ? require("../../../Assets/Images/blank.png") : constants.image_host + e_url} />
              </div>

              <div
                className="metadata-img"
                onClick={() =>
                  this.setState({
                    current_image_type: "Base Snapshot",
                    current_image: constants.image_host + b_url,
                    isOpen: true,
                  })
                }
              >
                <img className="img" src={b_url && b_url.trim() === "" ? require("../../../Assets/Images/blank.png") : constants.image_host + b_url} />
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>

        {this.state.isOpen ? (
          <Lightbox
            mainSrc={this.state.current_image}
            imageTitle={this.state.current_image_type}
            onCloseRequest={() =>
              this.setState({
                current_image_type: "",
                current_image: "",
                isOpen: false,
              })
            }
          />
        ) : (
          ""
        )}
        <Loader status={this.state.loader} />
      </div>
    );
  }
}
