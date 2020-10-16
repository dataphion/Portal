import React from "react";
import { Form, Input } from "antd";
import { Alert, Modal } from "rsuite";
import constants from "../constants";
import axios from "axios";

const { TextArea } = Input;

const AddDataSources = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        source_databases: [
          { label: "Oracle", value: "oracle" },
          { label: "RabbitMQ", value: "rabbitmq" },
          { label: "MySQL", value: "mysql" },
          { label: "Redis", value: "redis" },
          { label: "MSSQL", value: "mssql" },
          { label: "Postgres", value: "postgres" },
          {
            label: "Cassandra",
            value: "cassandra",
          },
          {
            label: "Kafka",
            value: "kafka",
          },
          {
            label: "Gmail",
            value: "gmail",
          },
        ],
      };
    }

    getCurrentData = () => {
      const form = this.props.form;
      return {
        source_name: form.getFieldValue("SourceName"),
        ip: form.getFieldValue("Ip"),
        port: form.getFieldValue("Port"),
        username: form.getFieldValue("Username"),
        password: form.getFieldValue("Password"),
        database: form.getFieldValue("Database"),
        queue_name: form.getFieldValue("QueueName"),
        database_type: this.props.DatabaseType,
      };
    };

    testSourceConnection = () => {
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

      const formData = this.getCurrentData();
      axios
        .post(constants.dbregistrationsCheck, formData)
        .then((response) => {
          if (response.data.status === "success") {
            Alert.success("Connection has been established successfully.");
          } else {
            if (formData.database_type === "redis") {
              Alert.error("Unable to connect to the database, Please verify again.");
            } else if (formData.database_type === "mysql") {
              Alert.error(response.data.error.message, 10000);
            } else if (formData.database_type === "rabbitmq") {
              Alert.error(response.data.error, 10000);
            } else if (formData.database_type === "oracle") {
              Alert.error(`Unable to connect to the database, Error code ${response.data.error.errorNum}`, 10000);
            } else if (formData.database_type === "mongodb") {
              Alert.error(response.data.error, 10000);
            } else if (formData.database_type === "mssql") {
              Alert.error(response.data.error, 10000);
            }
          }
        })
        .catch((error) => {
          Alert.error("Something went wrong");
        });
    };

    handleSave = () => {
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

      let data = {
        type: this.props.DatabaseType,
        name: form.getFieldValue("SourceName"),
        description: form.getFieldValue("description"),
        application: window.location.pathname.split("/")[2],
      };

      axios.post(constants.sourceregistration, data).then((response) => {
        this.props.ModalCancel();
        this.props.updateData();
      });
    };

    handleCancel = () => {
      this.props.form.resetFields();
      this.props.ModalCancel();
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.ModalOpen} onHide={this.handleCancel}>
          <Modal.Header>
            <Modal.Title>{Object.keys(this.props.UpdateRequestData).length === 0 ? "Register New Source" : "Update Source"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="source-from">
            {Object.keys(this.props.UpdateRequestData).length === 0 ? (
              <div className="sr-form-button-container-row">
                {/* <div onClick={() => this.props.SelectDatabase("oracle")} className={"sr-form-button-container " + (this.props.DatabaseType === "oracle" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "oracle" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>Oracle</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("rabbitmq")} className={"sr-form-button-container " + (this.props.DatabaseType === "rabbitmq" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "rabbitmq" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>RabbitMQ</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("mysql")} className={"sr-form-button-container " + (this.props.DatabaseType === "mysql" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "mysql" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>MySQL</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("redis")} className={"sr-form-button-container " + (this.props.DatabaseType === "redis" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "redis" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>Redis</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("mongodb")} className={"sr-form-button-container " + (this.props.DatabaseType === "mongodb" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "mongodb" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>MongoDB</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("mssql")} className={"sr-form-button-container " + (this.props.DatabaseType === "mssql" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "mssql" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>MSSQL</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("postgres")} className={"sr-form-button-container " + (this.props.DatabaseType === "postgres" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "postgres" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>Postgres</div>
                </div>
                <div onClick={() => this.props.SelectDatabase("cassandra")} className={"sr-form-button-container " + (this.props.DatabaseType === "cassandra" ? "sr-form-button-bg" : "")}>
                  <div className={"sr-form-button-title " + (this.props.DatabaseType === "cassandra" ? "sr-form-button-title-white" : "sr-form-button-title-black")}>Cassandra</div>
                </div> */}
                <div style={{ width: "100%" }}>
                  <div className="label-required-box">
                    <label className="data-source-label">Select Data Sources</label>
                    <span className="required-field">*</span>
                  </div>
                  <select autoFocus id="source-database" value={this.props.DatabaseType} className="source-database-option" onChange={(e) => this.props.SelectDatabase(e)}>
                    <option disabled value="selected_data_source" selected>
                      Select Data Source
                    </option>
                    {this.state.source_databases.map((data, index) => {
                      return (
                        <option value={data.value} key={index}>
                          {data.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ) : (
              ""
            )}
            <Form layout="vertical">
              <Form.Item label="Source Name">
                {getFieldDecorator("SourceName", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: Object.keys(this.props.UpdateRequestData).length > 0 ? this.props.UpdateRequestData.source_name : "",
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Description">
                {getFieldDecorator("description", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: Object.keys(this.props.UpdateRequestData).length > 0 ? this.props.UpdateRequestData.description : "",
                })(<TextArea rows={4} />)}
              </Form.Item>
              {/* <Form.Item label="IP">
                {getFieldDecorator("Ip", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue:
                    Object.keys(this.props.UpdateRequestData).length > 0
                      ? this.props.UpdateRequestData.ip
                      : ""
                })(<Input />)}
              </Form.Item>
              <Form.Item label="Port">
                {getFieldDecorator("Port", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue:
                    Object.keys(this.props.UpdateRequestData).length > 0
                      ? this.props.UpdateRequestData.port
                      : ""
                })(<Input maxLength={5} />)}
              </Form.Item>

              {this.props.DatabaseType !== "redis" ? (
                <React.Fragment>
                  <Form.Item label="Username">
                    {getFieldDecorator("Username", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue:
                        Object.keys(this.props.UpdateRequestData).length > 0
                          ? this.props.UpdateRequestData.username
                          : ""
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="Password">
                    {getFieldDecorator("Password", {
                      rules: [
                        {
                          required: true
                        }
                      ],
                      initialValue:
                        Object.keys(this.props.UpdateRequestData).length > 0
                          ? this.props.UpdateRequestData.password
                          : ""
                    })(
                      <Input
                        type={
                          Object.keys(this.props.UpdateRequestData).length > 0
                            ? "text"
                            : "password"
                        }
                      />
                    )}
                  </Form.Item>
                </React.Fragment>
              ) : (
                ""
              )}
              {this.props.DatabaseType !== "rabbitmq" ? (
                <Form.Item label="Database">
                  {getFieldDecorator("Database", {
                    rules: [
                      {
                        required: true
                      }
                    ],
                    initialValue:
                      Object.keys(this.props.UpdateRequestData).length > 0
                        ? this.props.UpdateRequestData.database
                        : ""
                  })(<Input />)}
                </Form.Item>
              ) : (
                ""
              )}
              {this.props.DatabaseType === "rabbitmq" ? (
                <Form.Item label="Queue Name">
                  {getFieldDecorator("QueueName", {
                    rules: [
                      {
                        required: true
                      }
                    ],
                    initialValue:
                      Object.keys(this.props.UpdateRequestData).length > 0
                        ? this.props.UpdateRequestData.queue_name
                        : ""
                  })(<Input />)}
                </Form.Item>
              ) : (
                ""
              )} */}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              {/* <div
                onClick={this.testSourceConnection}
                className="negative-button"
                style={{ marginLeft: "10px" }}
              >
                <i className="fa fa-cog" />
                Test Connection
              </div> */}
              <div onClick={this.handleSave} className="positive-button">
                <i className="fa fa-check" />
                {Object.keys(this.props.UpdateRequestData).length === 0 ? " Register" : " Update"}
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default AddDataSources;
