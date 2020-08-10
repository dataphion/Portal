import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Input } from "antd";
import constants from "../constants";
import axios from "axios";

const ForgetPassword = Form.create()(
  class extends React.Component {
    saveRecord = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        } else if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(form.getFieldValue("email"))) {
          error = true;
          return Alert.warning("Please fill valid Email.");
        }
      });
      if (error) {
        return;
      }

      let loginData = {
        email: form.getFieldValue("email"),
        url: constants.resetPassword,
      };
      axios
        .post(constants.forgotPassword, loginData)
        .then((response) => {
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.forgetModal} onHide={this.props.onHide} size="sm">
          <Modal.Header>
            <Modal.Title>Forgot Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form layout="vertical">
              <Form.Item label="Email">
                {getFieldDecorator("email", {
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
                Submit
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default ForgetPassword;
