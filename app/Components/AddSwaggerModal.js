import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Upload, Input } from "antd";
import constants from "../constants";
import axios from "axios";
import Loader from "../Components/Loader";

const AddSwaggerModal = Form.create()(
  class extends React.Component {
    state = {
      uploadedFileName: "",
      uploadType: "file",
      loader: false,
      spec_name: "",
      file_url: ""
    };

    loadAddedPack = () => {
      if (this.props.spec_id) {
        this.setState({ loader: true });
        fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"}id:"${window.location.pathname.split("/")[2]}"}){endpointpacks(where:{id:"${
              this.props.spec_id
            }"}){id,name,upload_type,swagger_url}}}`
          })
        })
          .then(response => response.json())
          .then(response => {
            this.setState({
              loader: false,
              spec_name: response.data.applications[0].endpointpacks[0].name,
              file_url: response.data.applications[0].endpointpacks[0].swagger_url
            });
          })
          .catch(error => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      }
    };

    saveRecord = async () => {
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

      this.setState({ loader: true });
      try {
        let fileUploadReq = "";
        let endpointpackReq = "";

        if (this.state.uploadType === "file") {
          let fileUpload = new FormData();
          fileUpload.append("files", form.getFieldValue("swaggerFile").file.originFileObj);
          // fileUpload.append("ref", "endpointpack");
          // fileUpload.append("refId", this.props.spec_id ? this.props.spec_id : endpointpackReq.data.id);
          // fileUpload.append("field", "swagger_files");

          const config = { headers: { "content-type": "multipart/form-data" } };

          fileUploadReq = await axios.post(constants.upload, fileUpload, config);
          // fileUploadReq.data[0].url = fileUploadReq.data[0].url.replace(constants.image_host, "")
        }

        if (!this.props.spec_id) {
          // Endpointpack Request
          const endpointpackData = {
            name: form.getFieldValue("swaggerName"),
            upload_type: this.state.uploadType,
            application: {
              id: window.location.pathname.split("/")[2]
            }
          };

          endpointpackReq = await axios.post(constants.endpointpacks, endpointpackData);
        }

        const swaggerData = {
          swagger_url: this.state.uploadType === "file" ? fileUploadReq.data[0].url : form.getFieldValue("swaggerUrl"),
          endpointpack_id: this.props.spec_id ? this.props.spec_id : endpointpackReq.data.id
        };

        this.props.spec_id ? (swaggerData["applicationid"] = window.location.pathname.split("/")[2]) : "";
        let data = await axios.post(this.props.spec_id ? constants.swaggerUpadte : constants.swaggerFile, swaggerData);

        if (this.props.spec_id) {
          this.props.showconflict(data.data);
        } else {
          this.props.loadAddedPack();
          Alert.success("Api pack created successfully.");
        }
        this.setState({ loader: false });
      } catch (error) {
        Alert.error("Something went wrong");
        console.log(error);
      }
      this.props.onHide();
    };

    onHide = () => {
      this.setState({ uploadedFileName: "", spec_name: "" });
      this.props.onHide();
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <Modal show={this.props.addSwaggerModal} onHide={this.onHide} onEnter={this.loadAddedPack} size="lg">
            <Modal.Header>
              <Modal.Title>Upload Api Specs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="sr-form-button-container-row" style={{ justifyContent: "center" }}>
                <div onClick={() => this.setState({ uploadType: "file" })} className={"sr-form-button-container " + (this.state.uploadType === "file" ? "sr-form-button-bg" : "")}>
                  <div
                    className="fa fa-file-text"
                    style={{
                      fontSize: "20px",
                      marginRight: "15px",
                      color: this.state.uploadType === "file" ? "#fff" : ""
                    }}
                  />
                  <div className={"sr-form-button-title " + (this.state.uploadType === "file" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>FILE</div>
                </div>
                <div onClick={() => this.setState({ uploadType: "url" })} className={"sr-form-button-container " + (this.state.uploadType === "url" ? "sr-form-button-bg" : "")}>
                  <div
                    className="fa fa-link"
                    style={{
                      fontSize: "20px",
                      marginRight: "15px",
                      color: this.state.uploadType === "url" ? "#fff" : ""
                    }}
                  />
                  <div className={"sr-form-button-title " + (this.state.uploadType === "url" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>URL</div>
                </div>
              </div>
              <Form layout="vertical">
                <Form.Item label="Name">
                  {getFieldDecorator("swaggerName", {
                    rules: [
                      {
                        required: true
                      }
                    ],
                    initialValue: this.state.spec_name ? this.state.spec_name : ""
                  })(<Input />)}
                </Form.Item>
                {this.state.uploadType === "file" ? (
                  <Form.Item label="File">
                    {getFieldDecorator("swaggerFile", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue: ""
                    })(
                      <Upload.Dragger
                        multiple={false}
                        showUploadList={false}
                        onChange={e => {
                          this.setState({
                            uploadedFileName: e.file.name
                          });
                        }}
                      >
                        <p className="ant-upload-text">{this.state.uploadedFileName ? this.state.uploadedFileName : "Click or drag file to upload."}</p>
                        <p className="ant-upload-hint">Accepted Files: .json / .yaml</p>
                      </Upload.Dragger>
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item label="Url">
                    {getFieldDecorator("swaggerUrl", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue: ""
                    })(<Input />)}
                  </Form.Item>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <div className="sr-form-footer-btn-container">
                <div onClick={this.onHide} className="negative-button">
                  <i className="fa fa-close" /> Cancel
                </div>
                {this.props.spec_id ? (
                  <a target="_blank" href={this.state.file_url} download className="negative-button" style={{ marginLeft: "10px" }}>
                    <i className="fa fa-eye" />
                    View
                  </a>
                ) : (
                  ""
                )}
                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-upload" />
                  {this.props.spec_id ? "Update" : "Upload"}
                </div>
              </div>
            </Modal.Footer>
            <Loader status={this.state.loader} />
          </Modal>
        </React.Fragment>
      );
    }
  }
);

export default AddSwaggerModal;
