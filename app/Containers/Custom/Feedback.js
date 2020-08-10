import React from "react";
import "../../Assets/Styles/Custom/Feedback.scss";
import { Form, Input, Upload } from "antd";
import { Alert } from "rsuite";
import Loader from "../../Components/Loader";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import Header from "../../Components/Header";
import constants from "../../constants";
import { Link } from "react-router-dom";

const Feedback = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        uploadedFileName: "",
        loader: false,
      };
    }

    componentDidMount() {
      if (!sessionStorage.getItem("id")) {
        this.props.history.push("/login");
      }
    }

    handleConfirm = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.error("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      this.setState({ loader: true });
      if (form.getFieldValue("AttachScreenshot")) {
        let fileUpload = new FormData();
        fileUpload.append("files", form.getFieldValue("AttachScreenshot").file.originFileObj);
        const config = {
          headers: {
            "content-type": "multipart/form-data",
          },
        };
        axios
          .post(constants.upload, fileUpload, config)
          .then((response) => {
            //-------------------- Data upload --------------------
            let formData = {
              title: form.getFieldValue("Title"),
              description: form.getFieldValue("Description"),
              attach_screenshot: response.data[0].id,
              user: {
                id: sessionStorage.getItem("id"),
              },
            };
            axios
              .post(constants.feedbacks, formData)
              .then((response) => {
                form.resetFields("Title");
                form.resetFields("Description");
                form.resetFields("AttachScreenshot");
                this.setState({ loader: false, uploadedFileName: "" });
                Alert.success("Thank you, Your feedback helps us to make AiTester better.", 10000);
              })
              .catch((error) => {
                Alert.error("Something went wrong");
                console.log(error);
              });
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      } else {
        let formData = {
          title: form.getFieldValue("Title"),
          description: form.getFieldValue("Description"),
          user: {
            id: sessionStorage.getItem("id"),
          },
        };
        axios
          .post(constants.feedbacks, formData)
          .then((response) => {
            form.resetFields("Title");
            form.resetFields("Description");
            form.resetFields("AttachScreenshot");
            this.setState({ loader: false });
            Alert.success("Thank you, Your feedback helps us to make AiTester better.", 10000);
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <div className="main-container">
            <Header />
            <div className="body-container">
              <div className="filter-panel-container" style={{ background: "#f8fafb" }}>
                <div className="breadcrumbs-container">
                  <i className="fa fa-map-marker" />
                  <Link to="/">HOME</Link>
                  <div className="breadcrumbs-items">></div>
                  <div className="breadcrumbs-items">Feedback</div>
                </div>
                <div className="filter-panel-right-part">
                  <div onClick={this.handleConfirm} className="positive-button">
                    <i className="fa fa-check" />
                    Report
                  </div>
                </div>
              </div>
              <div className="container-fluid" style={{ padding: "30px 30px 0 30px", background: "#ffffff" }}>
                <Form layout="vertical">
                  <Form.Item label="TITLE">
                    {getFieldDecorator("Title", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="DESCRIPTION">
                    {getFieldDecorator("Description", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(<TextArea rows="10" />)}
                  </Form.Item>
                  <Form.Item label="ATTACH SCREENSHOT (OPTIONAL)">
                    {getFieldDecorator("AttachScreenshot", {
                      initialValue: "",
                    })(
                      <Upload.Dragger multiple={false} showUploadList={false} onChange={(e) => this.setState({ uploadedFileName: e.file.name })}>
                        <p className="ant-upload-text">
                          {this.state.uploadedFileName ? this.state.uploadedFileName : "Click or drag file to upload."}
                        </p>
                        <p className="ant-upload-hint">Accepted file formats: .jpg / .jpeg / .png</p>
                      </Upload.Dragger>
                    )}
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default Feedback;
