import React from "react";
import "../../Assets/Styles/Custom/Profile.scss";
import Header from "../../Components/Header";
import { Form, Input } from "antd";
import { Link } from "react-router-dom";
import constants from "../../constants";
import { Alert } from "rsuite";
import Loader from "../../Components/Loader";

const Profile = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        userInfo: [],
        loader: false
      };
    }

    componentDidMount = () => {
      if (sessionStorage.getItem("id")) {
        this.getUserInfo();
      } else {
        this.props.history.push("/login");
      }
    };

    getUserInfo = () => {
      console.log(sessionStorage.getItem("id"));

      this.setState({ loader: true });
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `{users(where:{id:"${sessionStorage.getItem("id")}"}){username,email, designation}}`
        })
      })
        .then(response => response.json())
        .then(response => {
          console.log("response ====>", response);

          this.setState({
            loader: false,
            userInfo: response.data.users
          });
        })
        .catch(error => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    updateUserInfo = () => {
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
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `mutation{updateUser(input:{
            where:{id:"${sessionStorage.getItem("id")}"},
            data:{
              username:"${form.getFieldValue("username")}",
              email:"${form.getFieldValue("email")}",
              designation:"${form.getFieldValue("designation")}",
              password: "${form.getFieldValue("newPassword")}"
            }})
            {user{id}}}`
        })
      })
        .then(response => response.json())
        .then(response => {
          this.setState({ loader: false });
          Alert.success("Profile updated successfully");
        })
        .catch(error => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    logout = () => {
      sessionStorage.clear();
      Alert.success("Logout successfully, Goodbye!", 10000);
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <div className="main-container animated fadeIn">
          <Header />
          <div className="body-container">
            <div className="filter-panel-container">
              <div className="breadcrumbs-container">
                <i className="fa fa-map-marker" />
                <Link to="/">HOME</Link>
                <div className="breadcrumbs-items">></div>
                <div className="breadcrumbs-items">PROFILE</div>
              </div>
              <div className="filter-panel-right-part">
                <Link to="/login" onClick={() => this.logout()} className="negative-button">
                  <i className="fa fa-power-off" />
                  Logout
                </Link>
                <div onClick={() => this.updateUserInfo()} className="positive-button">
                  <i className="fa fa-check" />
                  Save Changes
                </div>
              </div>
            </div>
            <Form layout="vertical">
              <div className="profile-body-container">
                <div className="profile-row-container">
                  <div className="profile-title-container">About me</div>
                  <div className="profile-sub-title-container">Basic profile settings</div>
                  <div className="profile-border-container" />
                  <div className="profile-form-container">
                    <div className="form-row-flex">
                      <Form.Item label="Username">
                        {getFieldDecorator("username", {
                          rules: [
                            {
                              required: true
                            }
                          ],
                          initialValue: this.state.userInfo.length !== 0 ? this.state.userInfo[0].username : ""
                        })(<Input />)}
                      </Form.Item>
                      <Form.Item label="Email">
                        {getFieldDecorator("email", {
                          rules: [
                            {
                              required: true
                            }
                          ],
                          initialValue: this.state.userInfo.length !== 0 ? this.state.userInfo[0].email : ""
                        })(<Input />)}
                      </Form.Item>
                      <Form.Item label="Designation">
                        {getFieldDecorator("designation", {
                          rules: [
                            {
                              required: true
                            }
                          ],
                          initialValue: this.state.userInfo.length !== 0 ? this.state.userInfo[0].designation : ""
                        })(<Input />)}
                      </Form.Item>
                    </div>
                    <div className="profile-border-container" />
                    <div className="profile-access-verified-container">
                      <div className="profile-access-verified-row">
                        <div className="profile-access-verified-logo">
                          <i className="fa fa-check" />
                        </div>
                        Admin Access
                      </div>
                      <div className="profile-access-verified-row">
                        <div className="profile-access-verified-logo">
                          <i className="fa fa-check" />
                        </div>
                        Email Verified
                      </div>
                    </div>
                  </div>
                </div>
                <div className="profile-row-container">
                  <div className="profile-title-container">Change Password</div>
                  <div className="profile-sub-title-container">Reset the password</div>
                  <div className="profile-border-container" />
                  <div className="profile-form-container">
                    <div className="form-row-flex">
                      <Form.Item label="Old Password">
                        {getFieldDecorator("oldPassword", {
                          initialValue: ""
                        })(<Input type="password" />)}
                      </Form.Item>
                      <Form.Item label="New Password">
                        {getFieldDecorator("newPassword", {
                          initialValue: ""
                        })(<Input type="password" />)}
                      </Form.Item>
                    </div>
                    <div className="profile-border-container" />
                    <div className="profile-button-container">
                      <div className="negative-button" onClick={() => this.updateUserInfo()}>
                        <i className="fa fa-check" />
                        Update Passwords
                      </div>
                    </div>
                  </div>
                </div>
                <div className="profile-row-container">
                  <div className="profile-title-container">Plan Details</div>
                  <div className="profile-sub-title-container">Choose the suitable plan according to your need</div>
                  <div className="profile-border-container" />
                  <div className="profile-form-container">
                    <div className="profile-plan-info-container">
                      Your current plan is
                      <div className="profile-active-plan">FREE PLAN</div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
          <Loader status={this.state.loader} />
        </div>
      );
    }
  }
);

export default Profile;
