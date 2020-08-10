import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Whisper, Tooltip, Alert } from "rsuite";
import { Table } from "antd";
import _ from "lodash";
import Loader from "./Loader";
import constants from "../constants";
import DeletePopupModal from "./DeletePopupModal";
import axios from "axios";

export default class AllGroupModal extends React.Component {
  state = {
    allGroupModal: [],
    searchText: "",
    deleteConfirmation: false,
    groupId: "",
    loader: false,
    selfGroupOrNot: false,
  };

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  loadGroup = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{
            applications(where:{id:"${window.location.pathname.split("/")[2]}"}){
              testcasegroups{
                id,
                name,
                testcasecomponents{
                  id
                }
              }
            }
          }`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        const formatedAllGroup = [];
        for (const data of response.data.applications[0].testcasegroups) {
          formatedAllGroup.push({
            id: data.id,
            name: data.name,
            count: data.testcasecomponents.length,
          });
        }

        this.setState({
          allGroupModal: formatedAllGroup,
          loader: false,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  addGroup = (id) => {
    this.setState({ loader: true, selfGroupOrNot: false });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{testcasegroups(where:{id:"${id}"}){testcasecomponents(limit:1){id}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        for (const data of this.props.stepsData) {
          if (data.testcasecomponents) {
            for (const gdata of data.testcasecomponents) {
              if (response.data.testcasegroups[0].testcasecomponents[0].id === gdata.id) {
                this.setState({ loader: false });
                return Alert.warning("Group is already added");
              }
            }
          } else if (response.data.testcasegroups[0].testcasecomponents[0].id === data.id) {
            this.setState({ selfGroupOrNot: true });
          }
        }
        if (this.state.selfGroupOrNot) {
          const groupIds = this.props.groupIds;
          groupIds.push(id);
          const putData = {
            testcasegroups: [...new Set(groupIds)],
          };
          axios
            .put(constants.testcases + `/${window.location.pathname.split("/")[5]}`, putData)
            .then((response) => {
              this.setState({
                loader: false,
              });
              this.props.onHide();
              this.props.loadSteps();
              Alert.success("Group added successfully");
            })
            .catch((error) => {
              Alert.error("Something went wrong");
              console.log(error);
            });
        } else {
          const postData = {
            sequence_number: this.props.beforeStepIndex + 0.1,
            type: "ui",
            group_name: "from_other",
            testcase: window.location.pathname.split("/")[5],
            testcasegroup: id,
          };
          axios
            .post(constants.testcasecomponents, postData)
            .then((response) => {
              this.setState({
                loader: false,
              });
              this.props.onHide();
              this.props.loadSteps();
              Alert.success("Group added successfully");
            })
            .catch((error) => {
              Alert.error("Something went wrong");
              console.log(error);
            });
        }
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  deleteGroup = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `mutation{deleteTestcasegroup(input:{where:{id:"${this.state.groupId}"}}){testcasegroup{id}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          deleteConfirmation: false,
          groupId: "",
          loader: false,
        });
        this.loadGroup();
        this.props.loadSteps();
        Alert.success("Group deleted successfully");
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  render() {
    let filteredData = [];
    if (this.state.searchText.trim().length > 0) {
      for (const data of this.state.allGroupModal) {
        if (data.name.includes(this.state.searchText)) {
          filteredData.push(data);
        }
      }
    } else {
      filteredData = this.state.allGroupModal;
    }

    const columns = [
      {
        sorter: true,
        title: "Group Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: "Steps",
        dataIndex: "count",
        key: "count",
      },
      {
        title: "Acion",
        dataIndex: "id",
        key: "x",
        render: (id) => (
          <div className="table-action-btn-container">
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Add Group</Tooltip>}>
              <div className="table-action-btn" onClick={() => this.setState({ groupId: id }, this.addGroup(id))}>
                <i className="fa fa-plus" />
              </div>
            </Whisper>
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>}>
              <div className="table-action-btn" onClick={() => this.setState({ deleteConfirmation: true, groupId: id })}>
                <i className="fa fa-trash" />
              </div>
            </Whisper>
          </div>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Modal
          className="meta-data-modal-body"
          full
          onEntered={this.loadGroup}
          show={this.props.allGroupModal}
          onHide={this.props.onHide}
          onExit={() => this.setState({ stepsDataGroup: [] })}
        >
          <Modal.Header>
            <div className="view-group-modal">
              <div className="meta-data-modal-header-title">All Groups</div>
              <div className="group-modal-header-container">
                <div className="group-modal-header-btn">
                  <i className="fa fa-search" />
                </div>
                <input
                  type="text"
                  placeholder="Search group here"
                  name="search"
                  value={this.state.searchText}
                  onChange={(e) => this.setState({ searchText: e.target.value })}
                />
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="group-modal-body">
              <Table dataSource={filteredData} columns={columns} rowKey="id" />
            </div>
          </Modal.Body>
        </Modal>
        <DeletePopupModal
          deleteConfirmation={this.state.deleteConfirmation}
          onHide={() => this.setState({ deleteConfirmation: false, groupId: "" })}
          delete={this.deleteGroup}
        />
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
