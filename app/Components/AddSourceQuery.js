import React from "react";
import { Form, Input } from "antd";
import { Table, Alert, Modal } from "rsuite";
const { Column, HeaderCell, Cell } = Table;
import constants from "../constants";
import axios from "axios";
import TextArea from "antd/lib/input/TextArea";

const AddSourceQuery = Form.create()(
  class extends React.Component {
    state = {
      responseData: [],
    };

    getCurrentData = () => {
      const form = this.props.form;
      return {
        ip: this.props.sourceDetails.ip,
        port: this.props.sourceDetails.port,
        username: this.props.sourceDetails.username,
        password: this.props.sourceDetails.password,
        database: this.props.sourceDetails.database,
        // database_type: this.props.source_type,
        database_type: sessionStorage.getItem("source_type"),
        title: form.getFieldValue("QueryTitle"),
        query: form.getFieldValue("Query"),
        dbregistration: { id: window.location.pathname.split("/")[5] },
      };
    };

    testQuery = () => {
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
        .post(constants.executequery, formData)
        .then((response) => {
          if (response.data.status === "success") {
            Alert.success("Query execute successfully.");
            if (sessionStorage.getItem("source_type") === "mysql") {
              this.setState({ responseData: response.data.data.rows });
            } else if (sessionStorage.getItem("source_type") === "mssql") {
              this.setState({ responseData: response.data.data[0].recordset });
            }
          } else {
            Alert.error(response.data.error.message, 10000);
          }
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
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

      let formData = this.getCurrentData();
      axios
        .post(constants.executequery, formData)
        .then((response) => {
          if (response.data.status === "success") {
            this.setState({ queryResponse: response.data.data.rows });
            if (Object.keys(this.props.UpdateRequestData).length === 0) {
              axios
                .post(constants.datasource, formData)
                .then((response) => {
                  this.handleCancel();
                  this.props.getQueryTemplates();
                })
                .catch((error) => {
                  Alert.error("Something went wrong");
                  console.log(error);
                });
            } else {
              axios
                .put(constants.datasource + `/${this.props.UpdateRequestData.id}`, formData)
                .then((response) => {
                  this.handleCancel();
                  this.props.getQueryTemplates();
                })
                .catch((error) => {
                  Alert.error("Something went wrong");
                  console.log(error);
                });
            }
          } else {
            Alert.error(response.data.error.message, 10000);
          }
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    };

    getData() {
      const { responseData, sortColumn, sortType } = this.state;
      if (sortColumn && sortType) {
        return responseData.sort((a, b) => {
          let x = a[sortColumn];
          let y = b[sortColumn];
          if (typeof x === "string") {
            x = x.charCodeAt();
          }
          if (typeof y === "string") {
            y = y.charCodeAt();
          }
          if (sortType === "asc") {
            return x - y;
          } else {
            return y - x;
          }
        });
      }
      return responseData;
    }

    handleSortColumn = (sortColumn, sortType) => {
      this.setState({
        loading: true,
      });
      setTimeout(() => {
        this.setState({
          sortColumn,
          sortType,
          loading: false,
        });
      }, 500);
    };

    handleCancel = () => {
      this.props.form.resetFields();
      this.props.ModalCancel();
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal show={this.props.ModalOpen} onHide={this.handleCancel} size="lg">
          <Modal.Header>
            <Modal.Title>Add Query Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form layout="vertical">
              <Form.Item label="Title">
                {getFieldDecorator("QueryTitle", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: Object.keys(this.props.UpdateRequestData).length > 0 ? this.props.UpdateRequestData.title : "",
                })(<Input autoFocus />)}
              </Form.Item>
              <Form.Item label="Query">
                {getFieldDecorator("Query", {
                  rules: [
                    {
                      required: true,
                    },
                  ],
                  initialValue: Object.keys(this.props.UpdateRequestData).length > 0 ? this.props.UpdateRequestData.query : "",
                })(<TextArea rows="6" />)}
              </Form.Item>
              <Table
                bordered
                autoHeight={true}
                headerHeight={40}
                data={this.getData()}
                sortColumn={this.state.sortColumn}
                sortType={this.state.sortType}
                onSortColumn={this.handleSortColumn}
                loading={this.state.loading}
              >
                {this.state.responseData.map((data, mainIndex) => {
                  if (mainIndex === 0) {
                    return Object.keys(data).map((keyData, index) => {
                      return (
                        <Column key={index} width={200} sortable resizable>
                          <HeaderCell className="table-heading">{keyData}</HeaderCell>
                          <Cell dataKey={keyData} />
                        </Column>
                      );
                    });
                  }
                })}
              </Table>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={this.testQuery} className="negative-button" style={{ marginLeft: "10px" }}>
                <i className="fa fa-cog" />
                {" Test Query"}
              </div>
              <div onClick={this.handleSave} className="positive-button">
                <i className="fa fa-check" />
                {Object.keys(this.props.UpdateRequestData).length === 0 ? " Add Query" : " Update Query"}
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    }
  }
);

export default AddSourceQuery;
