import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Input } from "antd";
import constants from "../constants";

const NewApplicationModal = Form.create()(
  class extends React.Component {
    saveRecord = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields(err => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      // check if application already exist
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `{applications(where:{
            user: { id: "${sessionStorage.getItem("id")}" }
          }){id, name}}`
        })
      })
        .then(response => response.json())
        .then(response => {
          let applicationsName = [];
          for (let app of response.data.applications) {
            applicationsName.push(app.name.toLowerCase());
          }
          if (applicationsName.includes(form.getFieldValue("applicationName").toLowerCase())) {
            Alert.warning("Application already exist !");
            return;
          } else {
            if (this.props.applicationName) {
              this.props.updateApplication(form.getFieldValue("applicationName"), form.getFieldValue("applicationUrl"));
            } else {
              this.props.saveApplication(form.getFieldValue("applicationName"), form.getFieldValue("applicationUrl"));
            }
          }
        });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.NewApplicationModal} onHide={this.props.onHide} size="lg">
          <Modal.Header>
            <Modal.Title>{this.props.applicationName ? "Update" : "Create Project"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form layout="vertical">
              <Form.Item label="Project Name">
                {getFieldDecorator("applicationName", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.applicationName ? this.props.applicationName : ""
                })(<Input autoFocus />)}
              </Form.Item>
              <Form.Item label="Project Url">
                {getFieldDecorator("applicationUrl", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.applicationUrl ? this.props.applicationUrl : ""
                })(<Input />)}
              </Form.Item>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.props.onHide} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              {this.props.applicationName ? (
                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-check" />
                  Update
                </div>
              ) : (
                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-check" />
                  Create
                </div>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default NewApplicationModal;
