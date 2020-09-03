import React from "react";
import "../../../../Assets/Styles/Custom/GraphTools/Sidebar.scss";
import { Form, Input, Icon, Collapse, Select } from "antd";
import { Alert, Drawer, Row, Col } from "rsuite";
import constants from "../../../../constants";
import axios from "axios";
import { Link } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";
import AceEditor from "react-ace";

const SourceSidebar = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        registeredDatabase: "",
        BodySelectedMenu: "QueryTemplate",
        source: [],
        rabbitmq_type_err: false,
        rabbitmq_type: "",
        publishDataSelected: "None",
        AceEditorValue: [],
        ExpectedKafkaReponse: [],
        AceEditorValidation: [],
        sourcetype: "",
        source_name: "",
      };
    }

    componentDidMount() {
      this.getSource();
    }

    getSource = () => {
      axios.get(`${constants.application}/${window.location.pathname.split("/")[2]}`).then((response) => {
        let temp_source = [];
        for (let source of response.data.sourceregistrations) {
          temp_source.push({ id: source["id"].toString(), source_name: source["name"], database_type: source["type"] });
        }
        this.setState({ source: temp_source });
      });
    };

    RenderBodySelectedMenu = () => {
      console.log(this.state.publishDataSelected);
      const form = this.props.form;
      if (
        ((this.state.publishDataSelected === "JSON" || this.state.publishDataSelected === "TEXT") && form.getFieldValue("RabbitmqType") === "pub") ||
        ((this.state.publishDataSelected === "JSON" || this.state.publishDataSelected === "TEXT") && form.getFieldValue("KafkaType") === "pub")
      ) {
        return (
          <AceEditor
            className="animated fadeIn"
            mode={this.state.publishDataSelected.toLowerCase()}
            theme="monokai"
            onValidate={(e) => this.setState({ AceEditorValidation: e })}
            onChange={(value) => this.setState({ AceEditorValue: value })}
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            style={{ width: "100%", height: "300px", borderRadius: "10px" }}
            value={`${this.state.AceEditorValue}`}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        );
      }
    };

    SidebarEnter = () => {
      this.props.loader();
      if (this.props.selectedCellData.publishDataSelected) {
        this.setState({
          publishDataSelected: this.props.selectedCellData.publishDataSelected.value,
        });
      }
      if (this.props.selectedCellData.RabbitmqType) {
        this.setState({
          rabbitmq_type: this.props.selectedCellData.RabbitmqType.value,
        });
      }
      if (this.props.selectedCellData.rmqData) {
        this.setState({
          AceEditorValue: this.props.selectedCellData.rmqData.value,
        });
      }
      if (this.props.selectedCellData.ExpectedKafkaReponse) {
        this.setState({
          ExpectedKafkaReponse: this.props.selectedCellData.ExpectedKafkaReponse.value,
        });
      }
      this.setState({
        sourcetype: this.props.selectedCellData.Method.value,
      });
      axios
        .get(constants.dbregistrations)
        .then((response) => {
          this.setState({
            registeredDatabase: response.data,
            BodySelectedMenu: this.props.selectedCellData.QueryType ? this.props.selectedCellData.QueryType.value : "QueryTemplate",
          });
          this.props.loader();
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    handleConfirm = () => {
      const form = this.props.form;
      let error = false;
      // if (this.state.rabbitmq_type === "") {
      //  this.setState({ rabbitmq_type_err: true });
      // this.props.form.validateFields((err, values) => { });
      //  Alert.warning("please fill all required Fields");
      //  return;
      // } else {
      form.validateFields((err) => {
        if (err) {
          error = true;
          return Alert.error("Please fill required fields.");
        }
      });
      if (error) {
        return;
      }
      if (this.state.sourcetype == "") {
        return Alert.error("Please fill required fields.");
      }
      let resp = {
        Title: form.getFieldValue("Title"),
        Description: form.getFieldValue("Description"),
        DatabaseType: this.props.selectedCellData.Method.value,
        OracleSourceId: form.getFieldValue("OracleSourceId"),
        RabbitmqQueueName: form.getFieldValue("RabbitmqQueueName"),
        KafkaTopicName: form.getFieldValue("KafkaTopicName"),
        RabbitmqSourceId: form.getFieldValue("RabbitmqSourceId"),
        KafkaSourceId: form.getFieldValue("KafkaSourceId"),
        MysqlSourceId: form.getFieldValue("MysqlSourceId"),
        MssqlSourceId: form.getFieldValue("MssqlSourceId"),
        MongoSourceId: form.getFieldValue("MongoSourceId"),
        RedisSourceId: form.getFieldValue("RedisSourceId"),
        PostgresSourceId: form.getFieldValue("PostgresSourceId"),
        CassandraSourceId: form.getFieldValue("CassandraSourceId"),

        QueryType: this.state.BodySelectedMenu,
        publishDataSelected: this.state.publishDataSelected,
        MongoQueryTemplate: form.getFieldValue("MongoQueryTemplate"),
        OracleQueryTemplate: form.getFieldValue("OracleQueryTemplate"),
        MysqlQueryTemplate: form.getFieldValue("MysqlQueryTemplate"),
        PostgresQueryTemplate: form.getFieldValue("PostgresQueryTemplate"),
        CassandraQueryTemplate: form.getFieldValue("CassandraQueryTemplate"),
        MssqlQueryTemplate: form.getFieldValue("MssqlQueryTemplate"),
        RedisQueryTemplate: form.getFieldValue("RedisQueryTemplate"),
        WrittenQuery: form.getFieldValue("WrittenQuery"),
        AceEditorValue: this.state.AceEditorValue,
        ExpectedKafkaReponse: this.state.ExpectedKafkaReponse,
        RabbitmqType: form.getFieldValue("RabbitmqType"),
        KafkaType: form.getFieldValue("KafkaType"),
        kafkaValidation: form.getFieldValue("kafkaValidation"),
        KafkaWaitingTime: form.getFieldValue("KafkaWaitingTime"),
        PollingInterval: form.getFieldValue("PollingInterval"),
        ExpectedIncrement: form.getFieldValue("ExpectedIncrement"),
        // ExpectedKafkaReponse: this.state.ExpectedKafkaReponse,
      };

      if (this.state.sourcetype === "oracle") {
        resp["OracleDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "rabbitmq") {
        resp["RabbitmqSourceName"] = this.state.source_name;
      } else if (this.state.sourcetype === "mysql") {
        resp["MysqlDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "redis") {
        resp["RedisDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "mssql") {
        resp["MssqlDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "mongodb") {
        resp["MongoDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "postgres") {
        resp["PostgresDatabase"] = this.state.source_name;
      } else if (this.state.sourcetype === "cassandra") {
        resp["CassandraDatabase"] = this.state.source_name;
      }

      this.props.handleConfirm(resp);

      this.hideModal();
      //}
    };

    handleChange = (e) => {
      this.setState({ rabbitmq_type: e.target.value, rabbitmq_type_err: false });
    };

    hideModal = () => {
      this.props.form.resetFields();
      this.props.handleCancel();
      this.setState({
        registeredDatabase: "",
        BodySelectedMenu: "QueryTemplate",
        rabbitmq_type_err: false,
        rabbitmq_type: "",
        publishDataSelected: "None",
        AceEditorValue: [],
        ExpectedKafkaReponse: [],

        AceEditorValidation: [],
        sourcetype: "",
        source_name: "",
      });
    };

    BodySelectionMenu = (Selected) => {
      let publishDataSelected = this.state.publishDataSelected;
      if (Selected === "None") {
        publishDataSelected = "None";
      } else if (Selected === "JSON") {
        publishDataSelected = "JSON";
      } else if (Selected === "TEXT") {
        publishDataSelected = "TEXT";
      }
      this.setState({ publishDataSelected: publishDataSelected });
    };
    handleSourceChange = (value, e, type) => {
      this.setState({
        sourcetype: type,
        source_name: e.props.children,
      });
    };

    RenderDatabase = () => {
      console.log(this.props.selectedCellData.Method.value);
      const { getFieldDecorator } = this.props.form;
      if (this.props.selectedCellData.Method) {
        if (this.props.selectedCellData.Method.value === "oracle") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("OracleSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.OracleSourceId ? this.props.selectedCellData.OracleSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "oracle")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "oracle") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
              {/* <Form.Item label="Select Database">
                {getFieldDecorator("OracleDatabase", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.selectedCellData.OracleDatabase
                    ? this.props.selectedCellData.OracleDatabase.value
                    : ""
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                        if (
                          Data.id ===
                          this.props.form.getFieldValue("OracleSourceId")
                        ) {
                          return (
                            <Select.Option key={index} value={Data.database}>
                              {Data.database}
                            </Select.Option>
                          );
                        }
                      })
                      : ""}
                  </Select>
                )}
              </Form.Item> */}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "rabbitmq") {
          const form = this.props.form;

          return (
            <div>
              <Row>
                <Col xs={12}>
                  <div className="sidebar-body-regular-row">
                    <Form.Item label="Select Source">
                      {getFieldDecorator("RabbitmqSourceId", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.props.selectedCellData.RabbitmqSourceId ? this.props.selectedCellData.RabbitmqSourceId.value : "",
                      })(
                        <Select onChange={(val, e) => this.handleSourceChange(val, e, "rabbitmq")}>
                          {this.state.source.length > 0
                            ? this.state.source.map((Data, index) => {
                                if (Data.database_type === "rabbitmq") {
                                  return (
                                    <Select.Option key={index} value={Data.id}>
                                      {Data.source_name}
                                    </Select.Option>
                                  );
                                }
                              })
                            : ""}
                        </Select>
                        // <Select>
                        //   {this.state.registeredDatabase.length > 0
                        //     ? this.state.registeredDatabase.map((Data, index) => {
                        //       if (Data.database_type === "rabbitmq") {
                        //         return (
                        //           <Select.Option
                        //             key={index}
                        //             value={Data.queue_name}
                        //           >
                        //             {Data.queue_name}
                        //           </Select.Option>
                        //         );
                        //       }
                        //     })
                        //     : ""}
                        // </Select>
                      )}
                    </Form.Item>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="sidebar-body-regular-row">
                    <Form.Item label="Queue Name">
                      {getFieldDecorator("RabbitmqQueueName", {
                        rules: [
                          {
                            required: true,
                            message: "Queue",
                          },
                        ],
                        initialValue: this.props.selectedCellData.RabbitmqQueueName ? this.props.selectedCellData.RabbitmqQueueName.value : "",
                      })(<Input />)}
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Row className="col-margin">
                <Col>
                  <Form.Item label="Type">
                    {getFieldDecorator("RabbitmqType", {
                      rules: [
                        {
                          required: true,
                          message: "Please input your type!",
                        },
                      ],
                      initialValue: this.props.selectedCellData.RabbitmqType ? this.props.selectedCellData.RabbitmqType.value : "",
                    })(
                      <select className={this.state.rabbitmq_type_err ? "select-env-err select-env" : "select-env"}>
                        <option value="">select type</option>
                        <option value="pub">Publisher</option>
                        <option value="sub">Subscriber</option>
                      </select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {form.getFieldValue("RabbitmqType") === "pub" ? (
                <Row className="col-margin">
                  <div className="sidebar-body-regular-row-body-menu-container">
                    <div className="sidebar-body-regular-row-body-menu">
                      <div
                        onClick={() => this.BodySelectionMenu("None")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "None" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        None
                      </div>
                      <div
                        onClick={() => this.BodySelectionMenu("JSON")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "JSON" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        JSON
                      </div>
                      <div
                        onClick={() => this.BodySelectionMenu("TEXT")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "TEXT" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        TEXT
                      </div>
                    </div>
                  </div>
                </Row>
              ) : (
                ""
              )}
              {this.RenderBodySelectedMenu()}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "kafka") {
          const form = this.props.form;

          return (
            <div>
              <Row>
                <Col xs={12}>
                  <div className="sidebar-body-regular-row">
                    <Form.Item label="Select Source">
                      {getFieldDecorator("KafkaSourceId", {
                        rules: [
                          {
                            required: true,
                          },
                        ],
                        initialValue: this.props.selectedCellData.KafkaSourceId ? this.props.selectedCellData.KafkaSourceId.value : "",
                      })(
                        <Select onChange={(val, e) => this.handleSourceChange(val, e, "rabbitmq")}>
                          {this.state.source.length > 0
                            ? this.state.source.map((Data, index) => {
                                if (Data.database_type === "kafka") {
                                  return (
                                    <Select.Option key={index} value={Data.id}>
                                      {Data.source_name}
                                    </Select.Option>
                                  );
                                }
                              })
                            : ""}
                        </Select>
                      )}
                    </Form.Item>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="sidebar-body-regular-row">
                    <Form.Item label="Topic Name">
                      {getFieldDecorator("KafkaTopicName", {
                        rules: [
                          {
                            required: true,
                            message: "Queue",
                          },
                        ],
                        initialValue: this.props.selectedCellData.KafkaTopicName ? this.props.selectedCellData.KafkaTopicName.value : "",
                      })(<Input />)}
                    </Form.Item>
                  </div>
                </Col>
              </Row>
              <Row className="col-margin">
                <Col>
                  <Form.Item label="Type">
                    {getFieldDecorator("KafkaType", {
                      rules: [
                        {
                          required: true,
                          message: "Please input your type!",
                        },
                      ],
                      initialValue: this.props.selectedCellData.KafkaType ? this.props.selectedCellData.KafkaType.value : "",
                    })(
                      <select className={this.state.rabbitmq_type_err ? "select-env-err select-env" : "select-env"}>
                        <option value="">select type</option>
                        <option value="pub">Publisher</option>
                        <option value="sub">Consumer</option>
                      </select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {form.getFieldValue("KafkaType") === "sub" ? (
                <div>
                  <Row className="col-margin">
                    <Col xs={8}>
                      <div className="sidebar-body-regular-row">
                        <Form.Item label="Maximum Timeout(min)">
                          {getFieldDecorator("KafkaWaitingTime", {
                            rules: [
                              {
                                required: true,
                              },
                            ],
                            initialValue: this.props.selectedCellData.KafkaWaitingTime ? this.props.selectedCellData.KafkaWaitingTime.value : "",
                          })(<Input type="number" />)}
                        </Form.Item>
                      </div>
                    </Col>
                    <Col xs={8}>
                      <div className="sidebar-body-regular-row">
                        <Form.Item label="Polling Interval(s)">
                          {getFieldDecorator("PollingInterval", {
                            rules: [
                              {
                                required: true,
                              },
                            ],
                            initialValue: this.props.selectedCellData.PollingInterval ? this.props.selectedCellData.PollingInterval.value : "",
                          })(<Input type="number" />)}
                        </Form.Item>
                      </div>
                    </Col>
                    <Col xs={8}>
                      <div className="sidebar-body-regular-row">
                        <Form.Item label="Expected message Increment">
                          {getFieldDecorator("ExpectedIncrement", {
                            rules: [
                              {
                                required: true,
                              },
                            ],
                            initialValue: this.props.selectedCellData.ExpectedIncrement ? this.props.selectedCellData.ExpectedIncrement.value : "",
                          })(<Input type="number" />)}
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                  <Row className="col-margin">
                    <Col>
                      <Form.Item label="Validation">
                        {getFieldDecorator("kafkaValidation", {
                          rules: [
                            {
                              required: true,
                              message: "Please input your type!",
                            },
                          ],
                          initialValue: this.props.selectedCellData.kafkaValidation ? this.props.selectedCellData.kafkaValidation.value : "",
                        })(
                          <select className={this.state.rabbitmq_type_err ? "select-env-err select-env" : "select-env"}>
                            <option disabled value="">
                              Validation Type
                            </option>
                            <option value="response">Response Validation</option>
                            <option value="index">Index validation</option>
                          </select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  {form.getFieldValue("kafkaValidation") === "response" ? (
                    <Row className="col-margin">
                      <Col>
                        <div className="sidebar-body-regular-row ace-editor-container">
                          <span className="custom-ace-editor-label">Expected Response</span>
                          <AceEditor
                            className="animated fadeIn"
                            mode={this.state.publishDataSelected.toLowerCase()}
                            theme="monokai"
                            onValidate={(e) => this.setState({ AceEditorValidation: e })}
                            onChange={(value) => this.setState({ ExpectedKafkaReponse: value })}
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            style={{ width: "100%", height: "300px", borderRadius: "10px" }}
                            value={`${this.state.ExpectedKafkaReponse}`}
                            setOptions={{
                              enableBasicAutocompletion: true,
                              enableLiveAutocompletion: true,
                              enableSnippets: true,
                              showLineNumbers: true,
                              tabSize: 2,
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
              {form.getFieldValue("KafkaType") === "pub" ? (
                <Row className="col-margin">
                  <div className="sidebar-body-regular-row-body-menu-container">
                    <div className="sidebar-body-regular-row-body-menu">
                      <div
                        onClick={() => this.BodySelectionMenu("None")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "None" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        None
                      </div>
                      <div
                        onClick={() => this.BodySelectionMenu("JSON")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "JSON" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        JSON
                      </div>
                      <div
                        onClick={() => this.BodySelectionMenu("TEXT")}
                        className={"sidebar-body-regular-row-body-menu-items " + (this.state.publishDataSelected === "TEXT" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                      >
                        TEXT
                      </div>
                    </div>
                  </div>
                </Row>
              ) : (
                ""
              )}
              {this.RenderBodySelectedMenu()}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mysql") {
          // let source_value = "";
          // if (this.props.selectedCellData.MysqlSourceId) {
          //   for (let s of this.state.source) {
          //     if (parseInt(this.props.selectedCellData.MysqlSourceId.value) === s["id"]) {
          //       source_value = s["id"];
          //     }
          //   }
          // }

          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("MysqlSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MysqlSourceId ? this.props.selectedCellData.MysqlSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "mysql")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "mysql") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
              {/* <Form.Item label="Select Database">
                {getFieldDecorator("MysqlDatabase", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.selectedCellData.MysqlDatabase
                    ? this.props.selectedCellData.MysqlDatabase.value
                    : ""
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                        if (
                          Data.id ===
                          this.props.form.getFieldValue("MysqlSourceId")
                        ) {
                          return (
                            <Select.Option key={index} value={Data.database}>
                              {Data.database}
                            </Select.Option>
                          );
                        }
                      })
                      : ""}
                  </Select>
                )}
              </Form.Item> */}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "redis") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("RedisSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.RedisSourceId ? this.props.selectedCellData.RedisSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "redis")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "redis") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                  // <Select>
                  //   {this.state.registeredDatabase.length > 0
                  //     ? this.state.registeredDatabase.map((Data, index) => {
                  //       if (Data.database_type === "redis") {
                  //         return (
                  //           <Select.Option key={index} value={Data.id}>
                  //             {Data.source_name}
                  //           </Select.Option>
                  //         );
                  //       }
                  //     })
                  //     : ""}
                  // </Select>
                )}
              </Form.Item>
              {/* <Form.Item label="Select Database">
                {getFieldDecorator("RedisDatabase", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.selectedCellData.RedisDatabase
                    ? this.props.selectedCellData.RedisDatabase.value
                    : ""
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                        if (
                          Data.id ===
                          this.props.form.getFieldValue("RedisSourceId")
                        ) {
                          return (
                            <Select.Option key={index} value={Data.database}>
                              {Data.database}
                            </Select.Option>
                          );
                        }
                      })
                      : ""}
                  </Select>
                )}
              </Form.Item> */}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mssql") {
          // let source_value = "";
          // if (this.props.selectedCellData.MysqlSourceId) {
          //   for (let s of this.state.source) {
          //     if (parseInt(this.props.selectedCellData.MysqlSourceId.value) === s["id"]) {
          //       source_value = s["id"];
          //     }
          //   }
          // }

          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("MssqlSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MssqlSourceId ? this.props.selectedCellData.MssqlSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "mssql")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "mssql") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
              {/* <Form.Item label="Select Database">
                {getFieldDecorator("MysqlDatabase", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.selectedCellData.MysqlDatabase
                    ? this.props.selectedCellData.MysqlDatabase.value
                    : ""
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                        if (
                          Data.id ===
                          this.props.form.getFieldValue("MysqlSourceId")
                        ) {
                          return (
                            <Select.Option key={index} value={Data.database}>
                              {Data.database}
                            </Select.Option>
                          );
                        }
                      })
                      : ""}
                  </Select>
                )}
              </Form.Item> */}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mongodb") {
          // let source_value = "";
          // if (this.props.selectedCellData.MysqlSourceId) {
          //   for (let s of this.state.source) {
          //     if (parseInt(this.props.selectedCellData.MysqlSourceId.value) === s["id"]) {
          //       source_value = s["id"];
          //     }
          //   }
          // }

          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("MongoSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MongoSourceId ? this.props.selectedCellData.MongoSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "mongodb")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "mongodb") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
              {/* <Form.Item label="Select Database">
                {getFieldDecorator("MysqlDatabase", {
                  rules: [
                    {
                      required: true
                    }
                  ],
                  initialValue: this.props.selectedCellData.MysqlDatabase
                    ? this.props.selectedCellData.MysqlDatabase.value
                    : ""
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                        if (
                          Data.id ===
                          this.props.form.getFieldValue("MysqlSourceId")
                        ) {
                          return (
                            <Select.Option key={index} value={Data.database}>
                              {Data.database}
                            </Select.Option>
                          );
                        }
                      })
                      : ""}
                  </Select>
                )}
              </Form.Item> */}
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "postgres") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("PostgresSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.PostgresSourceId ? this.props.selectedCellData.PostgresSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "postgres")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "postgres") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "cassandra") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Source">
                {getFieldDecorator("CassandraSourceId", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.CassandraSourceId ? this.props.selectedCellData.CassandraSourceId.value : "",
                })(
                  <Select onChange={(val, e) => this.handleSourceChange(val, e, "cassandra")}>
                    {this.state.source.length > 0
                      ? this.state.source.map((Data, index) => {
                          if (Data.database_type === "cassandra") {
                            return (
                              <Select.Option key={index} value={Data.id}>
                                {Data.source_name}
                              </Select.Option>
                            );
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        }
      }
    };

    RenderQuery = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.props.selectedCellData.Method) {
        if (this.props.selectedCellData.Method.value !== "rabbitmq" && this.props.selectedCellData.Method.value !== "kafka") {
          return (
            <Collapse.Panel header="QUERY" key="2">
              <div className="sidebar-body-regular-row-body-menu-container">
                <div className="sidebar-body-regular-row-body-menu">
                  <div
                    onClick={() => this.BodySelectedMenu("QueryTemplate")}
                    className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "QueryTemplate" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                  >
                    Use Template
                  </div>
                  <div
                    onClick={() => this.BodySelectedMenu("WriteQuery")}
                    className={"sidebar-body-regular-row-body-menu-items " + (this.state.BodySelectedMenu === "WriteQuery" ? "sidebar-body-regular-row-body-menu-items-active" : "")}
                  >
                    Raw Query
                  </div>
                </div>
              </div>
              {this.state.BodySelectedMenu === "QueryTemplate" ? (
                this.RenderQueryTemplate()
              ) : this.state.BodySelectedMenu === "WriteQuery" ? (
                <div className="sidebar-body-regular-row animated fadeIn">
                  <Form.Item label="Write Query">
                    {getFieldDecorator("WrittenQuery", {
                      initialValue: this.props.selectedCellData.WrittenQuery ? this.props.selectedCellData.WrittenQuery.value : "",
                    })(<TextArea rows={3} />)}
                  </Form.Item>
                </div>
              ) : (
                ""
              )}
            </Collapse.Panel>
          );
        }
      }
    };

    BodySelectedMenu = (Selected) => {
      const form = this.props.form;
      let BodySelectedMenu = this.state.BodySelectedMenu;
      if (Selected === "QueryTemplate") {
        BodySelectedMenu = "QueryTemplate";
        form.resetFields("WrittenQuery");
      } else if (Selected === "WriteQuery") {
        BodySelectedMenu = "WriteQuery";
        form.resetFields("QueryTemplate");
      }
      this.setState({ BodySelectedMenu: BodySelectedMenu });
    };

    RenderQueryTemplate = () => {
      const { getFieldDecorator } = this.props.form;
      if (this.props.selectedCellData.Method) {
        if (this.props.selectedCellData.Method.value === "oracle") {
          return (
            <div className="sidebar-body-regular-row animated fadeIn">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("OracleQueryTemplate", {
                  initialValue: this.props.selectedCellData.OracleQueryTemplate ? this.props.selectedCellData.OracleQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "oracle") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("OracleSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mysql") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("MysqlQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MysqlQueryTemplate ? this.props.selectedCellData.MysqlQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "mysql") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("MysqlSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "postgres") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("PostgresQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.PostgresQueryTemplate ? this.props.selectedCellData.PostgresQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "postgres") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("PostgresSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "cassandra") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("CassandraQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.CassandraQueryTemplate ? this.props.selectedCellData.CassandraQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "cassandra") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("CassandraSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "redis") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("RedisQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.RedisQueryTemplate ? this.props.selectedCellData.RedisQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "redis") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("RedisSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mssql") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("MssqlQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MssqlQueryTemplate ? this.props.selectedCellData.MssqlQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "mssql") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("MssqlSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        } else if (this.props.selectedCellData.Method.value === "mongodb") {
          return (
            <div className="sidebar-body-regular-row">
              <Form.Item label="Select Query Template">
                {getFieldDecorator("MongoQueryTemplate", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: this.props.selectedCellData.MongoQueryTemplate ? this.props.selectedCellData.MongoQueryTemplate.value : "",
                })(
                  <Select>
                    {this.state.registeredDatabase.length > 0
                      ? this.state.registeredDatabase.map((Data, index) => {
                          if (Data.database_type === "mongodb") {
                            if (Data.sourceregistration.id == this.props.form.getFieldValue("MongoSourceId")) {
                              return Data.datasources.map((Query) => {
                                return (
                                  <Select.Option key={index} value={Query.query}>
                                    {Query.query}
                                  </Select.Option>
                                );
                              });
                            }
                          }
                        })
                      : ""}
                  </Select>
                )}
              </Form.Item>
            </div>
          );
        }
      }
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Drawer size="md" placement="right" show={this.props.visible} onHide={this.hideModal} onEnter={this.SidebarEnter}>
          <div className="animated fadeIn slow">
            <div className="sidebar-header-container">
              <div className="sidebar-header-title">{this.props.selectedCellData.Method && this.props.selectedCellData.Method.value === "kafka" ? "Configure Kafka" : "Configure Database"}</div>
              <div className="sidebar-header-btn-container">
                <div className="source-register-sidebar-btn-container">
                  <Link
                    to={{
                      pathname: `/dashboard/${window.location.pathname.split("/")[2]}/data-sources`,
                    }}
                    className="source-register-sidebar-btn"
                  >
                    <i className="fa fa-plus" />
                    {this.props.selectedCellData.Method ? (this.props.selectedCellData.Method.value === "rabbitmq" ? " Add Queue" : " Add Source/Query") : ""}
                  </Link>
                </div>
                <div onClick={this.hideModal} className="sidebar-header-btn-close">
                  <i className="fa fa-close" />
                </div>
                <div onClick={this.handleConfirm} className="sidebar-header-btn-confirm">
                  <i className="fa fa-check" />
                </div>
              </div>
            </div>

            <Form layout="vertical">
              <div className="sidebar-body-first-row">
                <Form.Item>
                  {getFieldDecorator("Title", {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                    initialValue: this.props.selectedCellData.Title ? this.props.selectedCellData.Title.value : "",
                  })(<Input placeholder="Title" autoFocus />)}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator("Description", {
                    initialValue: this.props.selectedCellData.Description ? this.props.selectedCellData.Description.value : "",
                  })(<Input placeholder="Description" />)}
                </Form.Item>
              </div>
              {this.state.registeredDatabase ? (
                <Collapse
                  className="antd-collapse-container animated fadeIn"
                  bordered={true}
                  defaultActiveKey={["1", "2"]}
                  expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                >
                  {this.props.selectedCellData.Method && this.props.selectedCellData.Method.value === "kafka" ? (
                    <div style={{ padding: 20 }}>{this.RenderDatabase()}</div>
                  ) : (
                    <Collapse.Panel header="DATABASES" key="1">
                      {this.RenderDatabase()}
                    </Collapse.Panel>
                  )}

                  <div className="sidebar-body-divider" />
                  {this.RenderQuery()}
                </Collapse>
              ) : (
                ""
              )}
            </Form>
          </div>
        </Drawer>
      );
    }
  }
);

export default SourceSidebar;
