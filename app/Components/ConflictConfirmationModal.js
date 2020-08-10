import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Icon, Collapse, Tabs } from "antd";
import constants from "../constants";
import axios from "axios";
import Loader from "../Components/Loader";
import "../Assets/Styles/Custom/Dashboard/ConflictConfirmationModal.scss";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
// import { Diff } from "./DiffViewer";

const { Panel } = Collapse;

const { TabPane } = Tabs;
const ConflictConfirmationModal = Form.create()(
  class extends React.Component {
    state = {
      conflict_data: "",
      conflict_Confirmation: false,
      loader: false,
      expandIconPosition: "left",
    };

    onConfirm = async () => {
      const swaggerData = {
        endpoints: this.props.conflictdata.data,
        endpointpack_data: this.props.conflictdata.endpointpack_data,
      };
      let data = await axios.post(constants.swaggerconfirm, swaggerData);

      if (data.status == 200) {
        Alert.success("Api pack updated successfully.");

        this.setState({ conflict_data: "" });
        this.props.onHide();
      } else {
        Alert.error("Something went wrong.");
      }
    };

    onHide = () => {
      this.setState({ conflict_data: "" });
      this.props.onHide();
    };

    onPositionChange = (expandIconPosition) => {
      this.setState({ expandIconPosition });
    };

    callback = (key) => {
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      const { expandIconPosition } = this.state;
      const editanddelete = ["Edited", "Deleted"];

      return (
        <React.Fragment>
          <Modal show={this.props.conflictConfirmation} onHide={this.onHide} size="lg">
            <Modal.Header>
              <Modal.Title>Endpoint Changes</Modal.Title>
            </Modal.Header>
            <Modal.Body className="conflict-modal">
              <div className="conflict-modal-body">
                <Tabs type="card">
                  {Object.keys(this.props.conflictdata.data).map((key, i) =>
                    this.props.conflictdata.data[key].length > 0 ? (
                      <TabPane tab={key} key={i}>
                        {editanddelete.includes(key) ? (
                          <Collapse accordion bordered={false} expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}>
                            {this.props.conflictdata.data[key].map((data, i) => {
                              return (
                                <Panel header={data.endpoints[0].endpoint} key={i}>
                                  <div className="element-item-row">
                                    <div className="element-item-row-header">
                                      <i className="fa fa-random fa-lg conflict-icon" aria-hidden="true"></i>
                                      {key == "Edited" ? "Difference" : "Newly Added"}
                                    </div>
                                    <div className="element-item-row-border" />
                                    <div className="element-item-row-footer">
                                      <div className="conflict-modal-type">
                                        <div className="conflict-modal-type-name">Method :</div>
                                        <div className="conflict-modal-type-value">{data.endpoints[0].method}</div>
                                      </div>
                                      <div className="conflict-modal-type">
                                        <div className="conflict-modal-type-name">Path :</div>
                                        <div className="conflict-modal-type-value">{data.difference.path.join("/")}</div>
                                      </div>
                                      {data.difference.hasOwnProperty("lhs") ? (
                                        <div className="conflict-modal-type">
                                          <div className="conflict-modal-type-name">Old Value :</div>
                                          <div className="conflict-modal-type-value">
                                            {typeof data.difference.lhs == "object" ? JSON.stringify(data.difference.lhs) : data.difference.lhs}
                                          </div>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                      {data.difference.hasOwnProperty("rhs") ? (
                                        <div className="conflict-modal-type">
                                          <div className="conflict-modal-type-name">New Value :</div>
                                          <div className="conflict-modal-type-value">
                                            {typeof data.difference.rhs == "object" ? JSON.stringify(data.difference.rhs) : data.difference.rhs}
                                          </div>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>
                                  {data.endpoints[0].flows.length > 0 ? (
                                    <div className="element-item-row">
                                      <div className="element-item-row-header">
                                        <i className="fa fa-random fa-lg conflict-icon" aria-hidden="true"></i>
                                        Testcases Affected
                                      </div>
                                      <div className="element-item-row-border" />
                                      <div className="element-item-row-footer">
                                        {data.endpoints[0].flows.map((data, i) => (
                                          <div className="conflict-modal-type">
                                            <div className="conflict-modal-type-name">Name :</div>
                                            <div className="conflict-modal-type-value">{data.testcase.name}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </Panel>
                              );
                            })}
                          </Collapse>
                        ) : key == "New" ? (
                          <Collapse accordion bordered={false} expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}>
                            {this.props.conflictdata.data[key].map((data, i) => (
                              <Panel header={data.endpoints.length > 0 ? data.endpoints[0].endpoint : data.difference.path[1]} key={i}>
                                <div className="element-item-row">
                                  <div className="element-item-row-header">
                                    <i className="fa fa-random fa-lg conflict-icon" aria-hidden="true"></i>
                                    {key == "New" ? "Newly Added" : "Deleted"}
                                  </div>
                                  <div className="element-item-row-border" />
                                  <div className="element-item-row-footer">
                                    <div className="conflict-modal-type">
                                      <div className="conflict-modal-type-name">Method :</div>
                                      {data.endpoints.length > 0 ? (
                                        <div className="conflict-modal-type-value">{data.endpoints[0].method}</div>
                                      ) : (
                                        <div className="conflict-modal-type-value">{data.difference.path[1]}</div>
                                      )}
                                    </div>
                                    <div className="conflict-modal-type">
                                      <div className="conflict-modal-type-name">Path :</div>
                                      <div className="conflict-modal-type-value">{data.difference.path.join("/")}</div>
                                    </div>
                                    <div className="conflict-modal-type">
                                      <div className="conflict-modal-type-name">Value :</div>
                                      {key == "New" ? (
                                        <div className="conflict-modal-type-value">
                                          {typeof data.difference.rhs == "object" ? JSON.stringify(data.difference.rhs) : data.difference.rhs}
                                        </div>
                                      ) : (
                                        <div className="conflict-modal-type-value">
                                          {typeof data.difference.lhs == "object" ? JSON.stringify(data.difference.lhs) : data.difference.lhs}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Panel>
                            ))}
                          </Collapse>
                        ) : (
                          ""
                        )}
                      </TabPane>
                    ) : (
                      ""
                    )
                  )}
                </Tabs>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="sr-form-footer-btn-container">
                <div onClick={this.onHide} className="negative-button">
                  <i className="fa fa-close" /> Cancel
                </div>

                <div onClick={this.onConfirm} className="positive-button">
                  <i className="fa fa-upload" />
                  Confirm
                </div>
              </div>
            </Modal.Footer>
            <Loader status={this.state.loader} />
          </Modal>
        </React.Fragment>
      );
    }
  }
);

export default ConflictConfirmationModal;
