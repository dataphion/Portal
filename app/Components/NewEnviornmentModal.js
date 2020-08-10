import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Input } from "antd";

const NewEnviornmentModal = Form.create()(
  class extends React.Component {
    saveRecord = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      this.props.saveEnviornments(form.getFieldValue("enviornmentname"));
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.NewEnviornmentModal} onHide={this.props.onHide} size="lg">
          <Modal.Header>
            <Modal.Title>Create Enviornment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form layout="vertical">
              <Form.Item label="Enviornment Name">
                {getFieldDecorator("enviornmentname", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.enviornmentName ? this.props.enviornmentName : "",
                })(<Input autoFocus />)}
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

export default NewEnviornmentModal;
