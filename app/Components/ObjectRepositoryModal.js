import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Input, Select, Form } from "antd";
import constants from "../constants";
import Loader from "./Loader";
import AutosizeInput from "react-input-autosize";

class ObjectRepositoryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      element_type: "",
      ElementAdd: [],
      AnchorAdd: [],
    };
  }

  saveRecords = async function () {
    this.setState({ loader: true });
    const data = {
      element_type: this.state.element_type,
      element_attributes: this.state.ElementAdd,
      anchor_attributes: this.state.AnchorAdd,
    };

    fetch(constants.objectrepositories, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        element_type: this.state.element_type,
        custom_attributes: data,
        action: "custom",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        Alert.success("Component added successfully");
        this.setState({ loader: false });
        this.onHide();
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  }.bind(this);

  ElementAdd = () => {
    const form = this.props.form;
    if (form.getFieldValue("ElementKey") && form.getFieldValue("ElementCondition") && form.getFieldValue("ElementValue")) {
      if (this.state.ElementAdd.length === 0) {
        this.state.ElementAdd.push({
          ElementKey: form.getFieldValue("ElementKey"),
          ElementCondition: form.getFieldValue("ElementCondition"),
          ElementValue: form.getFieldValue("ElementValue"),
        });
      } else {
        let Checker = true;
        this.state.ElementAdd.map((data) => {
          if (data.ElementKey === form.getFieldValue("ElementKey")) {
            Checker = false;
          }
        });
        if (Checker) {
          this.state.ElementAdd.push({
            ElementKey: form.getFieldValue("ElementKey"),
            ElementCondition: form.getFieldValue("ElementCondition"),
            ElementValue: form.getFieldValue("ElementValue"),
          });
        } else {
          return Alert.warning(`Dupalicate key "${form.getFieldValue("ElementKey")}"`);
        }
      }
      form.resetFields("ElementKey");
      form.resetFields("ElementCondition");
      form.resetFields("ElementValue");
    } else {
      return Alert.warning("Please insert key and value properly");
    }
  };

  RenderElement = () => {
    const { getFieldDecorator } = this.props.form;
    if (this.state.ElementAdd.length >= 1) {
      return (
        <React.Fragment>
          {this.state.ElementAdd.map((Data, index) => {
            return (
              <div className="sidebar-body-regular-row animated fadeIn" key={index} style={{ width: "100%" }}>
                <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                  {getFieldDecorator("ElementKey" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.ElementKey,
                  })(<Input onChange={(e) => (this.state.ElementAdd[index].ElementKey = e.target.value)} />)}
                </Form.Item>
                <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                  {getFieldDecorator("ElementCondition" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.ElementCondition,
                  })(
                    <Select
                      onChange={(e) => (this.state.ElementAdd[index].ElementCondition = e)}
                      className="input-container-text"
                      style={{ marginRight: "10px" }}
                    >
                      <Select.Option value="equals_to">Equals to</Select.Option>
                      <Select.Option value="contains">Contains</Select.Option>
                    </Select>
                  )}
                </Form.Item>
                <Form.Item style={{ width: "100%" }}>
                  {getFieldDecorator("ElementValue" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.ElementValue,
                  })(<Input onChange={(e) => (this.state.ElementAdd[index].ElementValue = e.target.value)} />)}
                </Form.Item>
                <div
                  onClick={() => this.ElementRemove(index)}
                  className="sidebar-body-regular-row-right-btn"
                  style={{ marginTop: "6px", marginLeft: "5px", width: "84px" }}
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

  ElementRemove = (index) => {
    let ElementRemove = this.state.ElementAdd;
    ElementRemove.splice(index, 1);
    this.setState({ ElementAdd: ElementRemove });
  };

  AnchorAdd = () => {
    const form = this.props.form;
    if (form.getFieldValue("AnchorKey") && form.getFieldValue("AnchorCondition") && form.getFieldValue("AnchorValue")) {
      if (this.state.AnchorAdd.length === 0) {
        this.state.AnchorAdd.push({
          AnchorKey: form.getFieldValue("AnchorKey"),
          AnchorCondition: form.getFieldValue("AnchorCondition"),
          AnchorValue: form.getFieldValue("AnchorValue"),
        });
      } else {
        let Checker = true;
        this.state.AnchorAdd.map((data) => {
          if (data.AnchorKey === form.getFieldValue("AnchorKey")) {
            Checker = false;
          }
        });
        if (Checker) {
          this.state.AnchorAdd.push({
            AnchorKey: form.getFieldValue("AnchorKey"),
            AnchorCondition: form.getFieldValue("AnchorCondition"),
            AnchorValue: form.getFieldValue("AnchorValue"),
          });
        } else {
          return Alert.warning(`Dupalicate key "${form.getFieldValue("AnchorKey")}"`);
        }
      }
      form.resetFields("AnchorKey");
      form.resetFields("AnchorCondition");
      form.resetFields("AnchorValue");
    } else {
      return Alert.warning("Please insert key and value properly");
    }
  };

  RenderAnchor = () => {
    const { getFieldDecorator } = this.props.form;
    if (this.state.AnchorAdd.length >= 1) {
      return (
        <React.Fragment>
          {this.state.AnchorAdd.map((Data, index) => {
            return (
              <div className="sidebar-body-regular-row animated fadeIn" key={index} style={{ width: "100%" }}>
                <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                  {getFieldDecorator("AnchorKey" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.AnchorKey,
                  })(<Input onChange={(e) => (this.state.AnchorAdd[index].AnchorKey = e.target.value)} />)}
                </Form.Item>
                <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                  {getFieldDecorator("AnchorCondition" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.AnchorCondition,
                  })(
                    <Select
                      onChange={(e) => (this.state.AnchorAdd[index].AnchorCondition = e)}
                      className="input-container-text"
                      style={{ marginRight: "10px" }}
                    >
                      <Select.Option value="equals_to">Equals to</Select.Option>
                      <Select.Option value="contains">Contains</Select.Option>
                    </Select>
                  )}
                </Form.Item>
                <Form.Item style={{ width: "100%" }}>
                  {getFieldDecorator("AnchorValue" + index, {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: Data.AnchorValue,
                  })(<Input onChange={(e) => (this.state.AnchorAdd[index].AnchorValue = e.target.value)} />)}
                </Form.Item>
                <div
                  onClick={() => this.AnchorRemove(index)}
                  className="sidebar-body-regular-row-right-btn"
                  style={{ marginTop: "6px", marginLeft: "5px", width: "84px" }}
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

  AnchorRemove = (index) => {
    let AnchorRemove = this.state.AnchorAdd;
    AnchorRemove.splice(index, 1);
    this.setState({ AnchorAdd: AnchorRemove });
  };

  onHide = () => {
    this.setState({
      element_type: "",
      AnchorAdd: [],
      ElementAdd: [],
    });
    this.props.onHide();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Modal className="meta-data-modal-body" full show={this.props.addOR} onEnter={this.onEnterAction} onHide={this.onHide}>
          <Modal.Header closeButton={false} className="modal-fixed-header">
            <div className="modal-container-with-button">
              <div className="meta-data-modal-header-title">Add Component</div>
              <div className="sr-form-footer-btn-container">
                <div onClick={this.onHide} className="negative-button">
                  <i className="fa fa-close" /> Cancel
                </div>
                <div onClick={this.saveRecords} className="positive-button">
                  <i className="fa fa-check" />
                  Add
                </div>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="modal-body-scrool">
            {/* <div className="meta-data-modal-body-header-container">
              <div className="meta-data-modal-body-header-url">
                <i className="globe-icon" />
                <div className="meta-data-modal-body-header-url-text">{this.props.modalInformation.url ? this.props.modalInformation.url.split("?")[0] : ""}</div>
              </div>
              <div className="meta-data-modal-body-header-tags-btn">
                <div className="meta-data-modal-body-header-tags-btn-icon">
                  <i className="fa fa-tag" />
                </div>
                <div className="meta-data-modal-body-header-tags-btn-text">
                  <AutosizeInput name="form-field-name" placeholder="Add tag here" onChange={this.changeText} />
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
                  <div className="element-item-row-header">
                    <div className="meta-data-icon" />
                    Element Type
                  </div>
                  <div className="element-item-row-border" />
                  <div className="element-item-row-footer">
                    <Input
                      type="text"
                      className="input-container-text"
                      onChange={(e) => this.setState({ element_type: e.target.value })}
                      value={this.state.element_type}
                    />
                  </div>
                </div>
                <div className="element-item-row">
                  <div className="element-item-row-header">
                    <div className="meta-data-icon" />
                    Element Attribute
                  </div>
                  <div className="element-item-row-border" />
                  <div className="element-item-row-footer">
                    <div className="lable-key-value-container">
                      <div className="lable-key-value">KEY</div>
                      <div className="lable-key-value">CONDITION</div>
                      <div className="lable-key-value">VALUE</div>
                      <div className="lable-key-value-blank" />
                    </div>
                    <div className="sidebar-body-regular-row" style={{ width: "100%" }}>
                      <Form.Item style={{ width: "100%", marginRight: "10px" }}>{getFieldDecorator("ElementKey")(<Input />)}</Form.Item>
                      <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                        {getFieldDecorator("ElementCondition")(
                          <Select className="input-container-text" style={{ marginRight: "10px" }}>
                            <Select.Option value="equals_to">Equals to</Select.Option>
                            <Select.Option value="contains">Contains</Select.Option>
                          </Select>
                        )}
                      </Form.Item>
                      <Form.Item style={{ width: "100%" }}>{getFieldDecorator("ElementValue")(<Input />)}</Form.Item>
                      <div
                        onClick={this.ElementAdd}
                        className="sidebar-body-regular-row-right-btn"
                        style={{ marginTop: "6px", marginLeft: "5px", width: "84px" }}
                      >
                        <i className="fa fa-plus" />
                      </div>
                    </div>
                    {this.RenderElement()}
                  </div>
                </div>
                <div className="element-item-row">
                  <div className="element-item-row-header">
                    <div className="meta-data-icon" />
                    Anchor Attribute
                  </div>
                  <div className="element-item-row-border" />
                  <div className="element-item-row-footer">
                    <div className="lable-key-value-container">
                      <div className="lable-key-value">KEY</div>
                      <div className="lable-key-value">CONDITION</div>
                      <div className="lable-key-value">VALUE</div>
                      <div className="lable-key-value-blank" />
                    </div>
                    <div className="sidebar-body-regular-row" style={{ width: "100%" }}>
                      <Form.Item style={{ width: "100%", marginRight: "10px" }}>{getFieldDecorator("AnchorKey")(<Input />)}</Form.Item>
                      <Form.Item style={{ width: "100%", marginRight: "10px" }}>
                        {getFieldDecorator("AnchorCondition")(
                          <Select className="input-container-text" style={{ marginRight: "10px" }}>
                            <Select.Option value="equals_to">Equals to</Select.Option>
                            <Select.Option value="contains">Contains</Select.Option>
                          </Select>
                        )}
                      </Form.Item>
                      <Form.Item style={{ width: "100%" }}>{getFieldDecorator("AnchorValue")(<Input />)}</Form.Item>
                      <div
                        onClick={this.AnchorAdd}
                        className="sidebar-body-regular-row-right-btn"
                        style={{ marginTop: "6px", marginLeft: "5px", width: "84px" }}
                      >
                        <i className="fa fa-plus" />
                      </div>
                    </div>
                    {this.RenderAnchor()}
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          </Modal.Body>
        </Modal>
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}

const ORModal = Form.create()(ObjectRepositoryModal);
export default ORModal;
