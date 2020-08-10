import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Input } from "antd";
import constants from "../constants";

const NewTestcasesGroupModal = Form.create()(
  class extends React.Component {
    saveRecord = async () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      const tcGroupNameReq = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            applications(where:{id:"${window.location.pathname.split("/")[2]}"}){
              testcasegroups{
                name
              }
            }
          }`,
        }),
      });
      const tcGroupNameRes = await tcGroupNameReq.json();
      for (const data of tcGroupNameRes.data.applications[0].testcasegroups) {
        if (data.name === form.getFieldValue("Name").trim()) {
          error = true;
          return Alert.warning("Group name is already taken.");
        }
      }
      if (error) {
        return;
      }

      this.props.loader();
      const testcaseGroupReq = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation{
          createTestcasegroup(input:{
            data:{
              name:"${form.getFieldValue("Name").trim()}",
              application:"${window.location.pathname.split("/")[2]}"
              testcase:"${window.location.pathname.split("/")[5]}"
            }
          }){
            testcasegroup{
              id
            }
          }
        }`,
        }),
      });
      const testcaseGroupRes = await testcaseGroupReq.json();
      const testcasegroupId = testcaseGroupRes.data.createTestcasegroup.testcasegroup.id;
      if (testcasegroupId) {
        this.props.stepsDataGroup.map(async (data, index) => {
          try {
            const testcasecomponentReq = await fetch(constants.graphql, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                query: `mutation{updateTestcasecomponent(input:{where:{id:"${data.id}"},data:{testcasegroup:"${testcasegroupId}"}}){testcasecomponent{id}}}`,
              }),
            });
            const testcasecomponentRes = await testcasecomponentReq.json();
            if (testcasecomponentRes.data.updateTestcasecomponent.testcasecomponent.id) {
              if (this.props.stepsDataGroup.length === index + 1) {
                this.props.loadSteps();
                this.props.onHide();
                Alert.success("Group created successfully");
              }
            }
          } catch (error) {
            Alert.error("Something went wrong");
            console.log(error);
          }
        });
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.stepsDataGroupModal} onHide={this.props.onHide} size="lg">
          <Modal.Header>
            <Modal.Title>Create Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form layout="vertical">
              <Form.Item label="GROUP NAME">
                {getFieldDecorator("Name", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                })(<Input autoFocus />)}
              </Form.Item>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.props.onHide} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={this.saveRecord} className="positive-button">
                <i className="fa fa-check" />
                Create
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default NewTestcasesGroupModal;
