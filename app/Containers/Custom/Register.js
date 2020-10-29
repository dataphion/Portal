import React from "react";
import "../../Assets/Styles/Custom/Register.scss";
import { Form, Input } from "antd";
import { Alert } from "rsuite";
import { Link } from "react-router-dom";
import Loader from "../../Components/Loader";
import axios from "axios";
import constants from "../../constants";

const Register = Form.create()(
  class extends React.Component {
    state = {
      loader: false,
      terms_and_condition_checked: false,
    };

    componentDidMount() {
      if (sessionStorage.getItem("id")) {
        this.props.history.push("/");
      }
    }

    handleSave = async () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("Please fill required fields.");
        } else if (!/^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(form.getFieldValue("email"))) {
          error = true;
          return Alert.warning("Please fill valid Email.");
        }
      });
      if (error) {
        return;
      }

      this.setState({ loader: true });
      let registerData = {
        username: form.getFieldValue("username"),
        password: form.getFieldValue("password"),
        email: form.getFieldValue("email"),
        designation: form.getFieldValue("designation"),
        confirmed: false,
      };
      try {
        await axios.post(constants.register, registerData);
        // await axios.post(constants.send_email, {'email': registerData.email});
        this.props.history.push({
          pathname: "register-successful",
          parentData: "afterRegister",
        });
      } catch (error) {
        this.setState({ loader: false });
        const err = JSON.stringify(error);
        const msg = JSON.parse(err);
        if (msg.response.data.message === "Email is already taken.") {
          Alert.error("Email is already taken.");
        } else {
          Alert.error("Something went wrong");
        }
        console.log(error);
      }
    };

    handleReset = () => {
      const form = this.props.form;
      form.resetFields("username");
      form.resetFields("password");
      form.resetFields("email");
      form.resetFields("designation");
    };

    conditionCheck = (e) => {
      console.log("checkbox value ---->", e.target.checked);
      this.setState({ terms_and_condition_checked: e.target.checked });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <div className="register-body-container animated fadeIn">
            <div className="register-left-part">
              <div className="register-logo-container">
                <div className="register-logo" />
                {/* <div className="register-name"><span>AI</span> Tester</div> */}
              </div>
              <div>
                <div className="register-sub-title">The most advance testing tool ever!</div>
                <div className="register-description">
                  Now your QA Automation will never break with <br />
                  our unique auto healing technology
                </div>
              </div>
              <div className="registration-graphic" />
            </div>
            <div className="register-right-part">
              <div className="registration-box">
                <div className="register-form-title">Registration</div>
                <div className="border-container" />
                <Form layout="vertical">
                  {/* <div className="form-row-flex"> */}
                  <Form.Item label="Username">
                    {getFieldDecorator("username", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<Input autoFocus />)}
                  </Form.Item>
                  <Form.Item label="Email">
                    {getFieldDecorator("email", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="Password">
                    {getFieldDecorator("password", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<Input type="password" />)}
                  </Form.Item>
                  {/* </div> */}
                  {/* <div className="form-row-flex"> */}

                  <Form.Item label="Designation">
                    {getFieldDecorator("designation", {
                      // rules: [
                      //   {
                      //     required: true
                      //   }
                      // ],
                      initialValue: "",
                    })(<Input />)}
                  </Form.Item>
                  {/* </div> */}
                  <div className="terms_condition">
                    <input type="checkbox" className="" onChange={this.conditionCheck} />
                    <span style={{ marginLeft: 8 }}>
                      I Agree{" "}
                      <a style={{ color: "green" }} href="">
                        {" "}
                        Terms & Conditions
                      </a>{" "}
                    </span>
                  </div>
                  <div className="register-button-container between">
                    <div onClick={this.handleReset} className="negative-button">
                      <i className="fa fa-refresh" />
                      Reset
                    </div>
                    <div onClick={this.handleSave} className={this.state.terms_and_condition_checked ? "positive-button" : "positive-button disabled-cls"}>
                      <i className="fa fa-check" />
                      Register
                    </div>
                  </div>
                </Form>
                <div className="or-border-container">
                  <div className="border-container" />
                  <div className="circle-container">OR</div>
                  <div className="border-container" />
                </div>
                <Link to="/login" className="negative-button">
                  <i className="fa fa-user" />
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default Register;
