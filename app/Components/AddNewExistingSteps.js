import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Alert } from "rsuite";
import { Icon, Collapse, Select, Form } from "antd";
import constants from "../constants";
import Loader from "./Loader";

class AddNewExistingSteps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      created_components: [],
      selected_components: "",
    };
  }

  onEnterAction = () => {
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{objectrepositories(where:{testcasecomponents_null:"Equals null"}){id,element_type}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({ created_components: response.data.objectrepositories });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  saveRecords = () => {
    const { beforeStepIndex, afterStepIndex } = this.props;
    if (this.state.selected_components) {
      this.setState({ loader: true });
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `mutation{createTestcasecomponent(input:{data:{sequence_number: "${beforeStepIndex + 0.1}",type: "mobile",objectrepository:"${
            this.state.selected_components
          }",testcase: "${window.location.pathname.split("/")[5]}"}}){testcasecomponent{id}}}`,
        }),
      })
        .then(() => {
          this.setState({ loader: false });
          this.onHide();
          this.props.loadSteps();
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    } else {
      return Alert.warning("Select any component");
    }
  };

  onHide = () => {
    this.props.onHide();
    this.setState({ selected_components: "" });
  };

  render() {
    return (
      <React.Fragment>
        <Modal className="meta-data-modal-body" full show={this.props.addnewExistingSteps} onEnter={this.onEnterAction} onHide={this.onHide}>
          <Modal.Header closeButton={false} className="modal-fixed-header">
            <div className="modal-container-with-button">
              <div className="meta-data-modal-header-title">Add Existing TestCase Steps</div>
              <div className="sr-form-footer-btn-container">
                <div onClick={this.onHide} className="negative-button">
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
            <Collapse
              className="antd-collapse-container"
              bordered={true}
              defaultActiveKey={["1", "2", "3"]}
              expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
            >
              <div className="meta-data-border" />
              <Collapse.Panel header="SELECT COMPONENT" key="2">
                <div className="element-item-row">
                  <div className="element-item-row-header">
                    <div className="meta-data-icon" />
                    Created Components
                  </div>
                  <div className="element-item-row-border" />
                  <div className="element-item-row-footer">
                    <Select
                      className="input-container-text"
                      // style={{ marginRight: "10px" }}
                      defaultValue="string"
                      onChange={(e) => this.setState({ selected_components: e })}
                      value={this.state.selected_components}
                    >
                      {this.state.created_components.map((data, index) => (
                        <Select.Option key={index} value={data.id}>
                          {data.element_type}
                        </Select.Option>
                      ))}
                    </Select>
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

const AddNewExisting = Form.create()(AddNewExistingSteps);
export default AddNewExisting;
