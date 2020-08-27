import React from "react";
import { Form, Input } from "antd";
import { Alert, Modal, Row, Col } from "rsuite";
import constants from "../constants";
import axios from "axios";

const AddEnvironmentConfiguration = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        Environments_list: [],
        selected_env: "",
        select_env_err: false,
      };
    }
    getCurrentData = () => {
      const form = this.props.form;
      return {
        source_name: this.props.record["source_name"],
        ip: form.getFieldValue("Ip"),
        port: form.getFieldValue("Port"),
        username: form.getFieldValue("Username"),
        password: form.getFieldValue("Password"),
        database: form.getFieldValue("Database"),
        // queue_name: form.getFieldValue("QueueName"),
        database_type: this.props.record["type"],
        keyspace: form.getFieldValue("Keyspace"),
      };
    };

    testSourceConnection = (e, type) => {
      const form = this.props.form;
      let error = false;
      if (this.state.selected_env === "" && this.props.form.getFieldValue("environment") === "") {
        this.setState({ select_env_err: true });
        this.props.form.validateFields((err, values) => {});
        Alert.warning("please fill all required Fields");
        return;
      }
      form.validateFields((err) => {
        if (err) {
          error = true;
          Alert.warning("Please fill required fields.");
          return;
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
            if (type === "test") {
              Alert.success("Connection has been established successfully.");
            } else {
              this.handleSave(e);
            }
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
            } else if (formData.database_type === "postgres") {
              Alert.error(response.data.error, 10000);
            } else if (formData.database_type === "cassandra") {
              Alert.error(response.data.error, 10000);
            }
          }
        })
        .catch((error) => {
          Alert.error("Something went wrong");
        });
    };

    handleCancel = () => {
      this.props.ConfigModalCancel();
    };

    componentWillMount = () => {
      this.getEnvironments();
    };

    getEnvironments = async () => {
      const environment = await axios.get(`${constants.application}/${window.location.pathname.split("/")[2]}`);

      let list = [];
      if (environment["status"] === 200) {
        for (let env of environment["data"]["environments"]) {
          list.push({ id: env["id"], environment: env["type"] });
        }
        if (list.length > 0) {
          this.setState({ Environments_list: list });
        }
      }
    };

    handleChange = (e) => {
      this.setState({ selected_env: e.target.value, select_env_err: false });
    };

    showConfiguration = () => {
      const { getFieldDecorator } = this.props.form;
      return (
        <Form layout="vertical">
          <Row>
            <Col xs={12} className="input-forms">
              <Form.Item label="Environment">
                {getFieldDecorator("environment", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your environment!",
                    },
                  ],
                  initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.env : "",
                })(
                  <select
                    className={this.props.form.getFieldValue("environment") === "" || this.props.form.getFieldValue("environment") === undefined ? "select-env-err select-env" : "select-env"}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Environment</option>

                    {this.state.Environments_list.map((data, index) => {
                      return (
                        <option key={index} value={data["id"]}>
                          {data["environment"]}
                        </option>
                      );
                    })}
                  </select>
                )}
              </Form.Item>
            </Col>

            <Col xs={12} className="input-forms">
              <Form.Item label="IP">
                {getFieldDecorator("Ip", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your Ip!",
                    },
                  ],
                  initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.ip : "",
                })(<Input />)}
              </Form.Item>
            </Col>
            {/* </Row> */}

            <React.Fragment>
              {/* <Row> */}
              <Col xs={12} className="input-forms">
                <Form.Item label="Port">
                  {getFieldDecorator("Port", {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.port : "",
                  })(<Input maxLength={5} />)}
                </Form.Item>
              </Col>
              {this.props.record["type"] !== "redis" ? (
                <Col xs={12} className="input-forms">
                  <Form.Item label="Username">
                    {getFieldDecorator("Username", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.username : "",
                    })(<Input />)}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {/* </Row>
            <Row> */}
              {this.props.record["type"] !== "redis" ? (
                <Col xs={12} className="input-forms">
                  <Form.Item label="Password">
                    {getFieldDecorator("Password", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.password : "",
                    })(<Input type="password" />)}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {this.props.record["type"] !== "rabbitmq" && this.props.record["type"] !== "kafka" ? (
                <Col xs={12} className="input-forms">
                  <Form.Item label="Database">
                    {getFieldDecorator("Database", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.database : "",
                    })(<Input />)}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {this.props.record["type"] === "cassandra" ? (
                <Col xs={12} className="input-forms">
                  <Form.Item label="Keyspace">
                    {getFieldDecorator("Keyspace", {
                      rules: [
                        {
                          required: true,
                        },
                      ],
                      initialValue: this.props.editConfigurationData ? this.props.editConfigurationData.keyspace : "",
                    })(<Input />)}
                  </Form.Item>
                </Col>
              ) : (
                ""
              )}
              {/* {this.props.record["type"] === "rabbitmq" ? (
                <Col xs={12} className="input-forms">
                  <Form.Item label="Queue Name">
                    {getFieldDecorator("QueueName", {
                      rules: [
                        {
                          required: true
                        }
                      ]
                    })(<Input />)}
                  </Form.Item>
                </Col>
              ) : (
                  ""
                )} */}
            </React.Fragment>
          </Row>
        </Form>
      );
    };

    handleSave = (e) => {
      e.preventDefault();
      if (this.props.form.getFieldValue("environment") === "" || this.props.form.getFieldValue("environment") === undefined) {
        // this.setState({ select_env_err: true });
        this.props.form.validateFields((err, values) => {});
        Alert.warning("please fill all required Fields");
        return;
      } else {
        this.props.form.validateFields((err, values) => {
          if (!err) {
            const form = this.props.form;
            let ip = form.getFieldValue("Ip");
            let port = form.getFieldValue("Port");
            let username = form.getFieldValue("Username");
            let password = form.getFieldValue("Password");
            let database = form.getFieldValue("Database");
            let queuename = form.getFieldValue("QueueName");
            let keyspace = form.getFieldDecorator("Keyspace");
            if (form.getFieldValue("Ip") === undefined) {
              ip = "";
            }
            if (form.getFieldValue("Port") === undefined) {
              port = "";
            }
            if (form.getFieldValue("Username") === undefined) {
              username = "";
            }
            if (form.getFieldValue("Password") === undefined) {
              password = "";
            }
            if (form.getFieldValue("Database") === undefined) {
              database = "";
            }
            if (form.getFieldValue("QueueName") === undefined) {
              queuename = "";
              form.getFieldValue("Ip");
            }
            if (form.getFieldValue("Keyspace") === undefined) {
              keyspace = "";
            }

            let env_id = [this.props.form.getFieldValue("environment")];

            let application = window.location.pathname.split("/")[2];
            let data = {
              ip: ip,
              port: port,
              username: username,
              password: password,
              database: database,
              queue_name: queuename,
              sourceregistration: this.props.record["id"] || this.props.editConfigurationData["sourceregistration"],
              application: application,
              environments: env_id,
              database_type: this.props.record["type"],
              source_name: this.props.record["source_name"],
              keyspace: keyspace,
            };

            let url = constants.dbregistrations;
            let method = axios.post;
            if (this.props.editConfigurationData && Object.keys(this.props.editConfigurationData).length > 0) {
              // if update scenario
              url = `${constants.dbregistrations}/${this.props.editConfigurationData["update_id"]}`;
              method = axios.put;
            }
            method(url, data).then((response) => {
              if (response.status === 200) {
                Alert.success("configured Successfully");
                this.props.ConfigModalCancel();
              } else {
                Alert.error("something went wrong");
              }
            });
          } else {
            // this.setState({select_env_err:true})
            Alert.warning("please fill all required Fields");
          }
        });
      }

      // }
    };

    handleMenuClick = (e) => {
      Alert.info("Click on menu item.");
    };

    renderBtn = () => {
      if (this.props.editConfigurationData) {
        if (Object.keys(this.props.editConfigurationData).length > 0) {
          return (
            <div onClick={(e) => this.testSourceConnection(e, "save")} className="positive-button">
              <i className="fa fa-check" />
              Update
            </div>
          );
        } else {
          return (
            <div onClick={(e) => this.handleSave(e)} className="positive-button">
              <i className="fa fa-check" />
              Save
            </div>
          );
        }
      } else {
        return (
          <div onClick={(e) => this.testSourceConnection(e, "save")} className="positive-button">
            <i className="fa fa-check" />
            Save
          </div>
        );
      }
    };

    render() {
      return (
        <Modal show={this.props.ConfigModalOpen} onHide={this.handleCancel} className="config-modal">
          <Modal.Header>
            <Modal.Title>Add Configuration</Modal.Title>
          </Modal.Header>
          <Modal.Body className="source-from">{this.showConfiguration()}</Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={(e) => this.testSourceConnection(e, "test")} className="negative-button" style={{ marginLeft: "10px" }}>
                <i className="fa fa-cog" />
                Test Connection
              </div>
              {this.renderBtn()}
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default AddEnvironmentConfiguration;
