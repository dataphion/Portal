import React from "react";
import "../../Assets/Styles/Custom/Login.scss";
import { Form, Input } from "antd";
import { Alert } from "rsuite";
import { Link } from "react-router-dom";
import Loader from "../../Components/Loader";
import axios from "axios";
import constants from "../../constants";
import ForgetPassword from "../../Components/ForgetPassword";

const Login = Form.create()(
  class extends React.Component {
    state = {
      loader: false,
      forgetModal: false
    };

    componentDidMount() {
      if (sessionStorage.getItem("id")) {
        this.props.history.push("/");
      }
    }

    handleSave = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields(err => {
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

      this.setState({ loader: true });
      let loginData = {
        identifier: form.getFieldValue("email"),
        password: form.getFieldValue("password")
      };
      axios
        .post(constants.login, loginData)
        .then(response => {
          sessionStorage.setItem("id", response.data.user.id);
          sessionStorage.setItem("username", response.data.user.username);
          sessionStorage.setItem("jwt", response.data.jwt);
          this.props.history.push("/");
        })
        .catch(error => {
          this.setState({ loader: false });
          const err = JSON.stringify(error);
          const msg = JSON.parse(err);
          if (msg.response.data.message === "Identifier or password invalid.") {
            Alert.error("Invalid email or password.");
          } else {
            Alert.error("Something went wrong");
          }
          console.log(error);
        });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <div className="login-body-container animated fadeIn">
            <div className="login-left-part">
              <div className="login-logo-container">
                <div className="login-logo" />
              </div>
              <div className="login-sub-title">Hey, Welcome Back!</div>
              <div className="login-description">We are glad to see you here</div>
            </div>
            <div className="login-right-part">
              <div className="login-form login-box">
                <div className="login-form-title">Login</div>
                <div className="border-container" />
                <Form layout="vertical">
                  <Form.Item label="Email">
                    {getFieldDecorator("email", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue: ""
                    })(<Input autoFocus onPressEnter={this.handleSave} />)}
                  </Form.Item>
                  <Form.Item label="Password">
                    {getFieldDecorator("password", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue: ""
                    })(<Input type="password" onPressEnter={this.handleSave} />)}
                  </Form.Item>
                  <div className="login-button-container">
                    <div onClick={this.handleSave} className="positive-button">
                      <i className="fa fa-unlock-alt" />
                      Login
                    </div>
                    <div onClick={() => this.setState({ forgetModal: true })} className="login-forget-password">
                      Forgot Password?
                    </div>
                  </div>
                </Form>
                <div className="or-border-container">
                  <div className="border-container" />
                  <div className="circle-container">OR</div>
                  <div className="border-container" />
                </div>
                <Link to="/register" className="negative-button">
                  <i className="fa fa-user-plus" />
                  Create a new account
                </Link>
              </div>
            </div>
          </div>
          <ForgetPassword forgetModal={this.state.forgetModal} onHide={() => this.setState({ forgetModal: false })} />
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default Login;
