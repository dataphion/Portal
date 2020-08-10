import React from "react";
import { Modal, Alert } from "rsuite";
import { Form, Upload, Input } from "antd";
import constants from "../constants";
import axios from "axios";
import Loader from "../Components/Loader";

const DataDrivenModal = Form.create()(
  class extends React.Component {
    state = {
      uploadedFileName: "",
      uploadType: "file",
      loader: false,
      spec_name: "",
      file_url: "",
    };

    onHide = () => {
      this.props.onHide();
    };

    fileUpload = (e) => {
      // read json file
      //   var file = e.fileList[0].originFileObj;
      //   var reader = new FileReader();
      //   reader.onload = function(e) {
      //   };
      //   reader.readAsText(file);
      this.setState({
        uploadedFileName: e.file.name,
      });
    };

    removeFile = async () => {
      this.setState({ loader: true });
      let testcase;
      let data = {
        ddt_file: "",
      };
      testcase = await axios.put(`${constants.testcases}/${window.location.pathname.split("/")[5]}`, data);
      if (testcase.status === 200) {
        this.setState({ loader: false, uploadedFileName: null });
        Alert.success("file removed successfully.");
        this.props.onHide();
      } else {
        this.setState({ loader: false });
        Alert.error("something went wrong.");
      }
    };

    saveRecord = async () => {
      const form = this.props.form;
      let error = false;
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.warning("No file selected.");
        }
      });
      if (error) {
        return;
      }
      this.setState({ loader: true });
      let fileUploadReq = "";
      let testcase = "";

      if (this.state.uploadType === "file") {
        let fileUpload = new FormData();
        fileUpload.append("files", form.getFieldValue("ddtFile").file.originFileObj);
        const config = { headers: { "content-type": "multipart/form-data" } };
        fileUploadReq = await axios.post(constants.upload, fileUpload, config);

        // update file id in testcase
        let data = {
          ddt_file: fileUploadReq.data[0].id,
        };
        const testcase_config = { headers: { "constent-type": "application/json" } };
        testcase = await axios.put(`${constants.testcases}/${window.location.pathname.split("/")[5]}`, data);
        if (testcase.status === 200) {
          Alert.success("file uploaded successfully.");
        } else {
          Alert.error("something went wrong.");
        }
        this.setState({ loader: false });
      }
      this.props.onHide();
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          <Modal show={this.props.showDttModal} onHide={this.onHide} size="lg">
            <Modal.Header>
              <Modal.Title>Upload File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="sr-form-button-container-row" style={{ justifyContent: "center" }}>
                <div
                  onClick={() => this.setState({ uploadType: "file" })}
                  className={"sr-form-button-container " + (this.state.uploadType === "file" ? "sr-form-button-bg" : "")}
                >
                  <div
                    className="fa fa-file-text"
                    style={{
                      fontSize: "20px",
                      marginRight: "15px",
                      color: this.state.uploadType === "file" ? "#fff" : "",
                    }}
                  />
                  <div
                    className={
                      "sr-form-button-title " + (this.state.uploadType === "file" ? "sr-form-button-title-white" : "sr-form-button-title-black")
                    }
                  >
                    Upload File
                  </div>
                </div>
                <div
                  onClick={() => this.setState({ uploadType: "db_configuration" })}
                  className={"sr-form-button-container " + (this.state.uploadType === "db_configuration" ? "sr-form-button-bg" : "")}
                >
                  <div
                    className="fa fa-link"
                    style={{
                      fontSize: "20px",
                      marginRight: "15px",
                      color: this.state.uploadType === "db_configuration" ? "#fff" : "",
                    }}
                  />
                  <div
                    className={
                      "sr-form-button-title " +
                      (this.state.uploadType === "db_configuration" ? "sr-form-button-title-white" : "sr-form-button-title-black")
                    }
                  >
                    DB Configuration
                  </div>
                </div>
              </div>
              <Form layout="vertical">
                {this.state.uploadType === "file" ? (
                  <Form.Item label="File">
                    {getFieldDecorator("ddtFile", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: "",
                    })(
                      <Upload.Dragger multiple={false} accept=".json,.csv,.xlsx,.xls" showUploadList={false} onChange={(e) => this.fileUpload(e)}>
                        <p className="ant-upload-text">
                          {this.state.uploadedFileName
                            ? this.state.uploadedFileName
                            : !!this.props.file
                            ? this.props.file.name
                            : "Click or drag file to upload."}
                        </p>
                        <p className="ant-upload-hint">Accepted Files: .json, .csv, .xlsx </p>
                      </Upload.Dragger>
                    )}
                  </Form.Item>
                ) : (
                  ""
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <div className="sr-form-footer-btn-container">
                <div onClick={this.onHide} className="negative-button">
                  <i className="fa fa-close" /> Cancel
                </div>
                {this.state.uploadedFileName || this.props.file ? (
                  <div onClick={this.removeFile} className="positive-button">
                    <i className="fa fa-trash-o" />
                    Remove file
                  </div>
                ) : (
                  ""
                )}

                <div onClick={this.saveRecord} className="positive-button">
                  <i className="fa fa-upload" />
                  Upload
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

export default DataDrivenModal;
