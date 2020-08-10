import React from "react";
import { Modal, Alert, Message } from "rsuite";
import { Form, Input, Tree, Select } from "antd";
const { TreeNode } = Tree;
import constants from "../constants";
import axios from "axios";
import _ from "lodash";

const ManageFeaturesModal = Form.create()(
  class extends React.Component {
    state = {
      sequence_changed: false,
      features: [],
      raw_data: {},
      testcaseData: {},
      changedPairs: [],
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (
        Object.keys(prevProps.features).length !== Object.keys(this.props.features).length ||
        Object.keys(prevState.features).length !== Object.keys(this.props.features).length
      ) {
        this.setState({ features: this.props.features });
      }

      if (
        Object.keys(prevProps.raw_data).length !== Object.keys(this.props.raw_data).length ||
        Object.keys(prevState.raw_data).length !== Object.keys(this.props.raw_data).length
      ) {
        const testcaseData = {};
        for (const data of this.props.raw_data) {
          if (data.feature && data.feature.id) {
            testcaseData[data.feature.id] = {
              feature_name: data.feature.name,
              id: data.feature.id,
              testcases: [],
            };
          }
        }

        if (this.props.raw_data.length !== 0) {
          for (const data of this.props.raw_data) {
            if (data.feature && data.feature.id) {
              let testcasecomponents = [];
              let objectrepositories = [];

              data.testcasecomponents.map((tc) => {
                if (tc.objectrepository) {
                  testcasecomponents.push(tc.id);
                  objectrepositories.push(tc.objectrepository.id);
                }
              });

              testcaseData[data.feature.id].testcases.push({
                id: data.id,
                name: data.name,
                description: data.description,
                type: data.type,
                total: data.testcasecomponents.length,
                testcasecomponents,
                objectrepositories,
              });
            }
          }
        }

        this.setState({ raw_data: this.props.raw_data, testcaseData });
      }
    }

    onDrop = (info) => {
      this.setState({ sequence_changed: true });
      let new_raw_data_state = this.state.raw_data;
      let new_changed_pairs = this.state.changedPairs;
      const dropKey = info.node.props.eventKey;
      const dragKey = info.dragNode.props.eventKey;

      let testcase_name = "";
      let testcase_id = dragKey.split("@@")[0];
      let old_feature_name = this.state.testcaseData[dragKey.split("@@")[1]].feature_name;
      let feature_id = "";
      let splitted = dropKey.split("@@");

      if (splitted.length > 1) {
        feature_id = splitted[1];
      } else {
        feature_id = dropKey;
      }

      let feature_name = this.state.testcaseData[feature_id].feature_name;
      let index = _.findIndex(new_raw_data_state, { id: testcase_id });
      new_raw_data_state[index]["feature"]["id"] = feature_id;
      new_raw_data_state[index]["feature"]["name"] = feature_name;

      new_changed_pairs.push({ testcase_id, feature_id });

      testcase_name = new_raw_data_state[index]["name"];

      const testcaseData = {};
      for (const data of new_raw_data_state) {
        testcaseData[data.feature.id] = {
          feature_name: data.feature.name,
          id: data.feature.id,
          testcases: [],
        };
      }

      if (new_raw_data_state.length !== 0) {
        for (const data of new_raw_data_state) {
          testcaseData[data.feature.id].testcases.push({
            id: data.id,
            name: data.name,
            description: data.description,
            type: data.type,
            total: data.testcasecomponents.length,
          });
        }
      }

      Alert.info(
        `Testcase "${testcase_name}" moved from "${old_feature_name}" feature to "${feature_name}" feature. Please click on "Update Association(s)" to save the changes.`,
        10000
      );

      this.setState({
        raw_data: new_raw_data_state,
        testcaseData,
        changedPairs: new_changed_pairs,
      });
    };

    updateChanges = () => {
      let api_calls = [];

      for (const changed of this.state.changedPairs) {
        api_calls.push(
          fetch(`${constants.testcases}/${changed.testcase_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ feature: changed.feature_id }),
          })
        );
      }

      Promise.all(api_calls).then((resp) => {
        Alert.success("All changes are saved successfully");
      });
    };

    deleteFeature = async () => {
      let feature_id = this.props.form.getFieldValue("selected_feature");

      if (this.state.testcaseData[feature_id]) {
        let feature_name = this.state.testcaseData[feature_id]["feature_name"];
        let testcases = [];
        let objectrepositories = [];
        let testcasecomponents = [];

        this.state.testcaseData[feature_id]["testcases"].map((testcase) => {
          testcases.push(testcase.id);
          objectrepositories = _.concat(objectrepositories, testcase["objectrepositories"]);
          testcasecomponents = _.concat(testcasecomponents, testcase["testcasecomponents"]);
        });

        const delReq = await fetch(`${constants.features}/bulkdelete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            feature: feature_id,
            testcases,
            objectrepositories,
            testcasecomponents,
          }),
        });
        const delResp = await delReq.json();
        this.props.loadAgain();
        Alert.success(`Feature ${feature_name} removed successfully`);
        this.onHide();
      } else {
        let feature_name = "";
        for (const feature of this.state.features) {
          if (feature.id === feature_id) {
            feature_name = feature.name;
            break;
          }
        }

        const delReq = await fetch(`${constants.features}/bulkdelete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            feature: feature_id,
            testcases: [],
            objectrepositories: [],
            testcasecomponents: [],
          }),
        });
        const delResp = await delReq.json();
        this.props.loadAgain();
        Alert.success(`Feature ${feature_name} removed successfully`);
        this.onHide();
      }
    };

    onHide = () => {
      this.setState({
        sequence_changed: false,
        features: [],
        raw_data: {},
        testcaseData: {},
        changedPairs: [],
      });
      this.props.onHide();
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      let feature_id = this.props.form.getFieldValue("selected_feature");
      let feature_name = "";
      let feature_total = 0;
      for (const feature of this.state.features) {
        if (feature.id === feature_id) {
          feature_name = feature.name;
          feature_total = feature.total;
          break;
        }
      }

      return (
        <Modal className="feature-modal" show={this.props.manageFeaturesModal} onHide={this.onHide} size="lg">
          <Modal.Header>{/* <Modal.Title>Test Case Management</Modal.Title> */}</Modal.Header>
          <Modal.Body className="feature-modal-holder">
            <div className="move-testcases-container">
              <div className="modal-section-title">Move Testcases</div>
              <Tree className="feature-tree" onDrop={this.onDrop} draggable autoExpandParent={true} defaultExpandAll={true}>
                {Object.keys(this.state.testcaseData).length > 0
                  ? Object.keys(this.state.testcaseData).map((feature, index) => {
                      let node = this.state.testcaseData[feature];
                      return (
                        <TreeNode title={node.feature_name} key={node.id}>
                          {node.testcases.map((testcase, inner_index) => {
                            return <TreeNode title={testcase.name} key={testcase.id + "@@" + node.id} />;
                          })}
                        </TreeNode>
                      );
                    })
                  : ""}
              </Tree>

              {this.state.sequence_changed ? (
                <div className="modal-section-bottom">
                  <div className="center">
                    <div onClick={this.onHide} className="negative-button">
                      <i className="fa fa-close" /> Discard
                    </div>
                    <div onClick={this.updateChanges} className="positive-button">
                      <i className="fa fa-check" />
                      Update Association(s)
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="feature-management-container">
              <div className="modal-section-title">Delete Feature</div>
              <div className="delete-feature-container">
                <Form layout="vertical">
                  <div className="form-row-flex delete-feature">
                    {Object.keys(this.state.features).length > 0 ? (
                      <Form.Item label="Select Feature to remove">
                        {getFieldDecorator("selected_feature", {
                          rules: [{ required: true }],
                        })(
                          <Select placeholder="select">
                            {this.state.features.map((feature) => {
                              return (
                                <Select.Option key={feature.id} value={feature.id}>
                                  {feature.name}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        )}
                      </Form.Item>
                    ) : (
                      ""
                    )}
                  </div>
                </Form>

                {feature_id ? (
                  feature_total !== 0 ? (
                    <Message
                      title="Dangerous to Delete"
                      description={`feature "${feature_name}" contains total ${feature_total} testcase(s). Please move the testcase(s) to different features if you want to save it. Deleting the selected feature will remove all ${feature_total} testcase(s).`}
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Message
                      title="Safe to Delete"
                      description={`feature "${feature_name}" does not belong to any testcase. You can safely delete it.`}
                      type="info"
                      showIcon
                    />
                  )
                ) : (
                  ""
                )}

                {feature_id ? (
                  feature_total !== 0 ? (
                    <div className="modal-section-bottom">
                      <div className="center">
                        <div onClick={this.deleteFeature} className="red-button">
                          <i className="fa fa-check" />
                          Delete Feature and Related Test Cases
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="modal-section-bottom">
                      <div className="center">
                        <div onClick={this.deleteFeature} className="red-button">
                          <i className="fa fa-check" />
                          Delete Feature
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  ""
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      );
    }
  }
);

export default ManageFeaturesModal;
