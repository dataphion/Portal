import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/TestcaseSteps.scss";
import { Link } from "react-router-dom";
import Header from "../../../Components/Header";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import MetaDataModal from "../../../Components/MetaDataModal";
import NewTestcasesGroupModal from "../../../Components/NewTestcasesGroupModal";
import AllGroupModal from "../../../Components/AllGroupModal";
import ViewGroupModal from "../../../Components/ViewGroupModal";
import ImagesModal from "../../../Components/ImagesModal";
import Loader from "../../../Components/Loader";
import { Switch, Checkbox, Menu, Dropdown, Icon } from "antd";
import { Alert, Whisper, Tooltip } from "rsuite";
import constants from "../../../constants";
import { Context } from "../../Context";
import _ from "lodash";
import socketIOClient from "socket.io-client";
import AddNewTestcaseSteps from "../../../Components/AddNewTestcaseSteps";
const { SubMenu } = Menu;
import KeyboardEventHandler from "react-keyboard-event-handler";
import AddnewExistingSteps from "../../../Components/AddNewExistingSteps";
const socket = socketIOClient(constants.socket_url);

export default class MobileTestcaseSteps extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      allData: [],
      groupIds: [],
      stepsData: [],
      imageModal: false,
      metaDataModal: false,
      modalInformation: [],
      loadModalImages: [],
      deleteConfirmation: false,
      deleteTestCaseId: "",
      modalSelectedMenu: "highlightedImage",
      loader: false,
      isCard: true,
      stepsDataGroupModal: false,
      stepsDataGroup: [],
      viewGroupModal: false,
      viewGroupModalInformation: [],
      openUrlLoader: false,
      playback_start: false,
      visible: false,
      addnewSteps: false,
      allGroupModal: false,
      beforeStepIndex: "",
      afterStepIndex: "",
      current_step: null,
      currentViewImage: null,
      addnewExistingSteps: false,
    };
  }

  showMetaData = (step) => {
    if (step === "next") {
      if (this.state.current_step < this.state.stepsData.length - 1) {
        this.setState(
          {
            current_step: this.state.current_step + 1,
            modalInformation: this.state.stepsData[this.state.current_step + 1].objectrepository,
          },
          () => {
            this.myRef.current.updateProps();
          }
        );
      }
    } else if (step === "previous") {
      if (this.state.current_step > 1) {
        this.setState(
          {
            current_step: this.state.current_step - 1,
            modalInformation: this.state.stepsData[this.state.current_step - 1].objectrepository,
          },
          () => {
            this.myRef.current.updateProps();
          }
        );
      }
    }
  };

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      this.loadSteps();
      //socket code for record
      socket.on(sessionStorage.getItem("id") + "_record", (data) => {
        const testcase_id = window.location.pathname.split("/")[5];

        if (
          data.testcase.id == testcase_id &&
          data.testcase.sequence_number !== "1"
          //  && data.testcase.sequence_number.split(".").length === 1
        ) {
          this.setState({
            stepsData: [...this.state.stepsData, data.testcase],
            openUrlLoader: false,
          });
        }
      });
      //socket code for play back proptector
      socket.on(window.location.pathname.split("/")[5] + "_play_back", (data) => {
        const testcase_id = window.location.pathname.split("/")[5];
        //condition to check it has same testcase id and start only on playback
        if (data.testcase_id == testcase_id) {
          let new_step_data = this.state.stepsData;

          for (let find_id_sequence in new_step_data) {
            //condition for check after open url
            //condition for check objectrepo id is same
            if (new_step_data[find_id_sequence].objectrepository.id === data.id) {
              if (data.status === "started") {
                new_step_data[find_id_sequence].openUrlLoader = true;
                this.setState({
                  stepsData: new_step_data,
                });
              }
              if (data.status === "completed") {
                // new_step_data[0].playback = false;
                // new_step_data[0].openUrlLoader = false;
                new_step_data[find_id_sequence].playback = true;
                new_step_data[find_id_sequence].openUrlLoader = false;
                this.setState({
                  stepsData: new_step_data,
                  openUrlLoader: false,
                });
              }
            }
          }
        }
      });
    } else {
      this.props.history.push("/login");
    }
  }

  loadSteps = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{applications(where:
          {user:{id:"${sessionStorage.getItem("id")}"},
          id:"${window.location.pathname.split("/")[2]}"})
          {name,testcases(where:
            {id:"${window.location.pathname.split("/")[5]}"}){id,name,description
            feature{name},

            testcasecomponents(where:{type:"mobile"}){id,sequence_number,
                objectrepository{id,url,action,thumbnail_url,element_id,element_type,custom_attributes,element_value,element_xpaths,element_css,element_attributes,description,browser_height,browser_width,tag,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder}
                testcasegroup{
                  id,
                  name,
                  testcasecomponents{
                    id,sequence_number,
                    objectrepository{id,url,thumbnail_url,element_id,element_type,custom_attributes,element_value,element_xpaths,element_css,element_attributes,description,browser_height,browser_width,tag,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder}
                  }
                }
            }
            testcasegroups{
              id,
              name,
              testcasecomponents{
                id,sequence_number,
                objectrepository{id,url,action,thumbnail_url,element_id,element_type,custom_attributes,element_value,element_xpaths,element_css,element_attributes,description,browser_height,browser_width,tag,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder}
              }
            }
          }
        }
      }`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        const respSteps = response.data.applications[0].testcases[0].testcasecomponents;
        const allGroups = response.data.applications[0].testcases[0].testcasegroups;

        if (respSteps.length > 0) {
          // Filter other group record
          const allSteps = [];
          // explicitly increment sequence number
          let sequence_id = 1;
          for (const data of respSteps) {
            if (data.objectrepository) {
              allSteps.push({
                id: data.id,
                sequence_number: Number(data.sequence_number),
                // sequence_number: sequence_id,
                objectrepository: data.objectrepository,
              });
              sequence_id++;
            } else if (data.name && data.testcasecomponents) {
              allSteps.push({
                id: data.id,
                name: data.name,
                testcasecomponents: data.testcasecomponents,
              });
            } else if (data.group_name === "from_other" && data.testcasegroup) {
              const filtered = [];
              for (const gdata of data.testcasegroup.testcasecomponents) {
                if (gdata.objectrepository) {
                  filtered.push({
                    id: gdata.id,
                    sequence_number: gdata.sequence_number,
                    objectrepository: gdata.objectrepository,
                  });
                }
              }
              allSteps.push({
                id: data.id,
                group_name: "from_other",
                sequence_number: Number(data.sequence_number),
                // sequence_number: sequence_id,
                name: data.testcasegroup.name,
                testcasecomponents: filtered,
              });
              sequence_id++;
            }
          }

          // Filter self group record
          const groupIds = [];
          for (const i in allGroups) {
            groupIds.push(allGroups[i].id);
            const id = _.findIndex(allSteps, function (o) {
              return o.id === allGroups[i].testcasecomponents[0].id;
            });
            allGroups[i].sequence_number = Number(allGroups[i].testcasecomponents[0].sequence_number);
            allGroups[i].group_name = "self";
            const groupStep = allGroups[i].testcasecomponents;
            allGroups[i].testcasecomponents = [];
            for (const s in groupStep) {
              if (groupStep[s].objectrepository) {
                allGroups[i].testcasecomponents.push({
                  id: groupStep[s].id,
                  sequence_number: groupStep[s].sequence_number,
                  objectrepository: groupStep[s].objectrepository,
                });
              }
            }
            if (id === -1) {
              allSteps.splice(allSteps.length, allGroups[i].testcasecomponents.length, allGroups[i]);
            } else {
              allSteps.splice(id, allGroups[i].testcasecomponents.length, allGroups[i]);
            }
          }

          const sortedAllSteps = _.orderBy(allSteps, ["sequence_number"], ["asc"]);

          this.setState({
            loader: false,
            allData: response.data.applications[0],
            stepsData: sortedAllSteps,
            groupIds: groupIds,
          });
        } else {
          Alert.warning("Steps not available.");
          this.props.history.push({
            pathname: `/dashboard/${window.location.pathname.split("/")[2]}/test-cases`,
          });
        }
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  getCreateGroupStep = (sequence, id) => {
    let stepsDataGroup = this.state.stepsDataGroup;
    if (stepsDataGroup.length === 0) {
      stepsDataGroup.push({ sequence, id });
    } else {
      let index = _.findIndex(stepsDataGroup, function (o) {
        return o.id === id;
      });
      if (index > -1) {
        stepsDataGroup.splice(index, stepsDataGroup.length);
      } else {
        if (parseInt(stepsDataGroup[stepsDataGroup.length - 1].sequence, 10) + 1 === parseInt(sequence, 10)) {
          stepsDataGroup.push({ sequence, id });
        } else {
          Alert.error("Group is always in sequence");
        }
      }
    }
    this.setState({ stepsDataGroup: stepsDataGroup });
  };

  renderAction = (action) => {
    if (action === "tap") {
      return "TAP";
    } else if (action === "sendkey") {
      return "INPUT TEXT";
    } else if (action === "custom") {
      return "CUSTOM";
    } else if (["up", "left", "select", "right", "down", "back", "home"].includes(action)) {
      return "REMOTE";
    }
  };

  loadModalImages = (id) => {
    this.setState({ loader: true, imageModal: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{testcasecomponents(where:{id:"${id}"}){objectrepository{height,width,highlighted_image_url,element_snapshot,page_url}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          loadModalImages: response.data.testcasecomponents[0].objectrepository,
          loader: false,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  showImage = (step) => {
    if (step === "next") {
      // debugger;
      if (this.state.currentViewImage < this.state.stepsData.length - 1) {
        this.setState(
          {
            currentViewImage: this.state.currentViewImage + 1,
          },
          () => {
            this.loadModalImages(this.state.stepsData[this.state.currentViewImage].id);
          }
        );
      }
    } else if (step === "previous") {
      if (this.state.currentViewImage > 1) {
        this.setState(
          {
            currentViewImage: this.state.currentViewImage - 1,
          },
          () => {
            this.loadModalImages(this.state.stepsData[this.state.currentViewImage].id);
          }
        );
      }
    }
  };

  modalSelectedMenu = (Selected) => {
    let modalSelectedMenu = this.state.modalSelectedMenu;
    if (Selected === "highlightedImage") {
      modalSelectedMenu = "highlightedImage";
    } else if (Selected === "elementSnapshot") {
      modalSelectedMenu = "elementSnapshot";
    } else if (Selected === "pageImage") {
      modalSelectedMenu = "pageImage";
    }
    this.setState({ modalSelectedMenu: modalSelectedMenu });
  };

  delete = () => {
    this.setState({ loader: true });
    if (this.state.deleteTestCaseId) {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `mutation{deleteTestcasecomponent(input:{where:{id:"${this.state.deleteTestCaseId}"}}){testcasecomponent{id}}}`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          this.setState({
            loader: false,
            deleteConfirmation: false,
            deleteTestCaseId: "",
            viewGroupModal: false,
          });
          this.loadSteps();
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    }
  };

  triggerPlayback = async function () {
    socket.emit("native_agent_playback_send", { testcase_id: Number(window.location.pathname.split("/")[5]) });
  }.bind(this);

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  _render_metadata_modal = () => {
    if (this.state.metaDataModal) {
      return (
        <React.Fragment>
          <MetaDataModal
            metaDataModal={this.state.metaDataModal}
            onHide={() =>
              this.setState({
                metaDataModal: false,
                modalInformation: [],
                viewGroupModal: false,
                current_step: null,
              })
            }
            ref={this.myRef}
            loadTestcase={(e) => this.loadSteps()}
            modalInformation={this.state.modalInformation}
          />
          <i className="fa fa-angle-double-right"></i>
        </React.Fragment>
      );
    }
  };

  handleMenuClick = (e, before, after) => {
    if (e.key === "1.1") {
      const message = {
        type: "insert_middle",
        id: window.location.pathname.split("/")[5],
        step: Number(after),
      };
      chrome.runtime.sendMessage(constants.extension_id, message, (response) => {
        if (!response.status === "success") {
          Alert.error("Remote execution failed");
        }
      });
    } else if (e.key === "1.2") {
      this.setState({ addnewSteps: true, beforeStepIndex: before, afterStepIndex: after });
    } else if (e.key === "1.3") {
      this.setState({ addnewExistingSteps: true, beforeStepIndex: before, afterStepIndex: after });
    } else if (e.key === "2") {
      this.setState({
        allGroupModal: true,
        beforeStepIndex: before,
        afterStepIndex: after,
      });
    } else if (e.key === "3") {
    } else if (e.key === "4") {
    } else if (e.key === "5") {
    }
    this.setState({ visible: false });
  };

  handleVisibleChange = (flag, index) => {
    if (index === "new") {
      this.setState({ visible: flag });
    } else {
      let stepsData = this.state.stepsData;
      stepsData[index]["visible"] = flag;
      this.setState({ stepsData: stepsData });
    }
  };

  render() {
    const menu = (
      <Menu>
        <Menu.Item>1st menu item</Menu.Item>
        <Menu.Item>2nd menu item</Menu.Item>
        <Menu.Item>3rd menu item</Menu.Item>
      </Menu>
    );
    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            <div className="main-container animated fadeIn">
              {context.state.smallSidebar ? <Header /> : <DashboardSidebar />}
              <div className="body-container" style={!this.state.isCard ? { background: "#3c6382" } : {}}>
                <div className="filter-panel-container">
                  <div className="breadcrumbs-container">
                    <i className="fa fa-map-marker" />
                    <Link to="/">APPLICATIONS</Link>
                    <div className="breadcrumbs-items">{this.state.allData.name ? ">" : ""}</div>
                    <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/test-cases`} className="breadcrumbs-items">
                      {this.state.allData.name}
                    </Link>
                    <div className="breadcrumbs-items">{this.state.allData.name ? ">" : ""}</div>
                    <div className="breadcrumbs-items">{this.state.allData.testcases ? this.state.allData.testcases[0].name : ""}</div>
                  </div>
                  <div className="filter-panel-right-part">
                    {this.state.stepsDataGroup.length > 0 ? (
                      <div onClick={() => this.setState({ stepsDataGroupModal: true })} className="negative-button animated fadeInRight">
                        <i className="fa fa-group" />
                        Create Group
                      </div>
                    ) : null}
                    {/* <div
                      // onClick={this.triggerExtension}
                      onClick={this.triggerPlayback}
                      className="negative-button"
                    >
                      <Dropdown overlay={menu}>
                        <div className="ant-dropdown-link">
                          Device Type <Icon type="down" />
                        </div>
                      </Dropdown>
                    </div> */}
                    <div
                      // onClick={this.triggerExtension}
                      onClick={this.triggerPlayback}
                      className="positive-button"
                    >
                      <i className="fa fa-play" />
                      Run Steps
                    </div>
                  </div>
                </div>
                <div className="filter-panel-information-container">
                  <div className="filter-panel-information-text">{`Total ${this.state.stepsData.length} Steps`}</div>
                  {this.state.allData.testcases ? (
                    <div className="filter-panel-information-uri animated zoomIn faster">
                      <div className="filter-panel-information-uri-big">{this.state.allData.testcases[0].name}</div>
                      {/* <div className="filter-panel-information-uri-small">{this.state.allData.testcases[0].testcasecomponents[0].objectrepository.url}</div> */}
                    </div>
                  ) : null}
                  <div className="filter-panel-information-text">
                    <Switch
                      onChange={() =>
                        this.setState({
                          isCard: !this.state.isCard,
                        })
                      }
                      checkedChildren="TEXT VIEW"
                      unCheckedChildren="UI VIEW"
                    />
                  </div>
                </div>
                {this.state.allData.testcases && this.state.allData.testcases[0].description ? (
                  <div className="description-container">
                    <div className="description">{this.state.allData.testcases[0].description}</div>
                  </div>
                ) : null}
                <div className={"container-fluid " + (!this.state.isCard ? "animated fadeIn" : "")} style={{ padding: "30px 30px 0 30px" }}>
                  <div className="row">
                    {this.state.stepsData.length > 0
                      ? this.state.isCard
                        ? this.state.stepsData.map((details, index) => {
                            return (
                              <div key={index} className="col-md-2 animated zoomIn faster">
                                <div className={"testcase-container " + (details.testcasecomponents ? "testcase-container-first" : "")}>
                                  {!details.testcasecomponents ? (
                                    details.objectrepository ? (
                                      details.objectrepository.thumbnail_url ? (
                                        <img src={constants.image_host + details.objectrepository.thumbnail_url} height="100%" width="100%" />
                                      ) : (
                                        <img
                                          src="https://www.emergerstrategies.com/wp-content/themes/cannyon_/media/_frontend/img/grid-no-image.png"
                                          height="100%"
                                          width="100%"
                                        />
                                      )
                                    ) : (
                                      <img
                                        src="https://www.emergerstrategies.com/wp-content/themes/cannyon_/media/_frontend/img/grid-no-image.png"
                                        height="100%"
                                        width="100%"
                                      />
                                    )
                                  ) : null}
                                  <div className={details.sequence_number !== 1 && details.openUrlLoader ? "lds-dual-ring" : " "}>
                                    <div
                                      className={
                                        "testcase-container-index-count " +
                                        (details.playback ? "testcase-container-right-tick" : "") +
                                        (details.openUrlLoader ? "overwirte-background" : " ")
                                      }
                                    >
                                      {details.sequence_number}
                                    </div>
                                  </div>

                                  {!details.testcasecomponents ? (
                                    <div className="testcase-container-group-check">
                                      <Whisper placement="top" trigger="hover" speaker={this.Tooltip("Create Group")}>
                                        <div>
                                          <Checkbox onChange={() => this.getCreateGroupStep(details.sequence_number, details.id)} />
                                        </div>
                                      </Whisper>
                                    </div>
                                  ) : null}
                                  {details.testcasecomponents ? (
                                    <div className="testcase-container-first-header">
                                      <div
                                        className="fa fa-users"
                                        style={{
                                          fontSize: "25px",
                                          marginRight: "10px",
                                        }}
                                      />
                                      GROUP
                                    </div>
                                  ) : null}
                                  <div className="testcase-container-footer">
                                    <div className="testcase-container-footer-tools">
                                      {!details.testcasecomponents && details.objectrepository ? (
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("View Images")}>
                                          <div
                                            onClick={() => {
                                              this.setState({
                                                currentViewImage: index,
                                              });
                                              this.loadModalImages(details.id);
                                            }}
                                            className="testcase-container-footer-tool-btn"
                                          >
                                            <i className="fa fa-picture-o" />
                                          </div>
                                        </Whisper>
                                      ) : null}
                                      {!details.testcasecomponents && details.objectrepository ? (
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("View Meta Data")}>
                                          <div
                                            onClick={() => {
                                              this.setState({
                                                current_step: index,
                                                metaDataModal: true,
                                                modalInformation: details.objectrepository,
                                              });
                                            }}
                                            className="testcase-container-footer-tool-btn"
                                          >
                                            <i className="fa fa-file-text" />
                                          </div>
                                        </Whisper>
                                      ) : null}
                                      {details.testcasecomponents ? (
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("View Group")}>
                                          <div
                                            onClick={() =>
                                              this.setState({
                                                viewGroupModal: true,
                                                viewGroupModalInformation: details,
                                              })
                                            }
                                            className="testcase-container-footer-tool-btn"
                                          >
                                            <i className="fa fa-eye" />
                                          </div>
                                        </Whisper>
                                      ) : (
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("Delete Step")}>
                                          <div
                                            onClick={() =>
                                              this.setState({
                                                deleteConfirmation: true,
                                                deleteTestCaseId: details.id,
                                              })
                                            }
                                            className="testcase-container-footer-tool-btn delete"
                                          >
                                            <i className="fa fa-trash" />
                                          </div>
                                        </Whisper>
                                      )}
                                    </div>
                                    <div className="testcase-container-footer-description">
                                      {details.testcasecomponents
                                        ? details.name.toUpperCase()
                                        : details.objectrepository
                                        ? details.objectrepository.action
                                          ? `Perform ${details.objectrepository.action.toUpperCase()}`
                                          : "Autofocus"
                                        : "No discription"}
                                    </div>
                                  </div>
                                </div>
                                {details.sequence_number !== 1 ? (
                                  <div
                                    className={
                                      details.visible ? "testcase-steps-right-arrow-container-on-hover" : "testcase-steps-right-arrow-container"
                                    }
                                  >
                                    <Dropdown
                                      overlay={
                                        <Menu
                                          onClick={(e) =>
                                            this.handleMenuClick(
                                              e,
                                              this.state.stepsData[index - 1].sequence_number,
                                              this.state.stepsData[index].sequence_number
                                            )
                                          }
                                        >
                                          <SubMenu title="Add Element">
                                            <Menu.Item key="1.1">
                                              <i
                                                className="fa fa-play"
                                                aria-hidden="true"
                                                style={{
                                                  marginRight: "10px",
                                                }}
                                              />
                                              Record Element
                                            </Menu.Item>
                                            <Menu.Item key="1.2">
                                              <i
                                                className="fa fa-plus"
                                                aria-hidden="true"
                                                style={{
                                                  marginRight: "10px",
                                                }}
                                              />
                                              Create Element
                                            </Menu.Item>
                                            <Menu.Item key="1.3">
                                              <i
                                                className="fa fa-plus"
                                                aria-hidden="true"
                                                style={{
                                                  marginRight: "10px",
                                                }}
                                              />
                                              Add From Existing
                                            </Menu.Item>
                                          </SubMenu>
                                          <Menu.Item key="2">Add Group</Menu.Item>
                                          <Menu.Item key="3">Element Visible</Menu.Item>
                                          <Menu.Item key="4">Compare Element Value</Menu.Item>
                                          <Menu.Item key="5">Data Source</Menu.Item>
                                        </Menu>
                                      }
                                      onVisibleChange={(flag) => {
                                        this.handleVisibleChange(flag, index);
                                      }}
                                      visible={details.visible}
                                    >
                                      {details.visible ? (
                                        <i className="fa fa-plus circle-icon-add" />
                                      ) : (
                                        <i className="fa fa-caret-right right-arrow" />
                                      )}
                                    </Dropdown>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        : this.state.stepsData.map((details, index) => (
                            <div
                              key={index}
                              onClick={() =>
                                this.setState({
                                  metaDataModal: details.testcasecomponents ? false : true,
                                  modalInformation: details.objectrepository,
                                })
                              }
                              className="list-view-container animated fadeInUp faster"
                            >
                              <div className="list-view-index-counter">{details.sequence_number}</div>
                              <div className="list-view-action-tag">
                                {details.testcasecomponents ? "GROUP" : this.renderAction(details.objectrepository.action)}
                              </div>
                              <div className="list-view-description">
                                {details.testcasecomponents
                                  ? `${details.name} (${details.testcasecomponents.length} Steps)`
                                  : details.objectrepository.action
                                  ? `Perform action ${details.objectrepository.action}`
                                  : "Autofocus"}
                              </div>
                              <div className="list-view-hover-btn" />
                            </div>
                          ))
                      : ""}
                    {this.state.stepsData.length > 0 && this.state.isCard ? (
                      <div className={this.state.visible ? "testcase-steps-right-arrow-container-last" : "testcase-steps-right-arrow-container-last"}>
                        <Dropdown
                          overlay={
                            <Menu onClick={(e) => this.handleMenuClick(e, this.state.stepsData[this.state.stepsData.length - 1].sequence_number, "")}>
                              <SubMenu title="Add Element">
                                <Menu.Item key="1.1">
                                  <i
                                    className="fa fa-play"
                                    aria-hidden="true"
                                    style={{
                                      marginRight: "10px",
                                    }}
                                  />
                                  Record Element
                                </Menu.Item>
                                <Menu.Item key="1.2">
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                    style={{
                                      marginRight: "10px",
                                    }}
                                  />
                                  Create Element
                                </Menu.Item>
                                <Menu.Item key="1.3">
                                  <i
                                    className="fa fa-plus"
                                    aria-hidden="true"
                                    style={{
                                      marginRight: "10px",
                                    }}
                                  />
                                  Add From Existing
                                </Menu.Item>
                              </SubMenu>
                              <Menu.Item key="2">Add Group</Menu.Item>
                              <Menu.Item key="3">Element Visible</Menu.Item>
                              <Menu.Item key="4">Compare Element Value</Menu.Item>
                              <Menu.Item key="5">Data Source</Menu.Item>
                            </Menu>
                          }
                          onVisibleChange={(flag) => this.handleVisibleChange(flag, "new")}
                          visible={this.state.visible}
                        >
                          {this.state.visible ? <i className="fa fa-plus circle-icon-add" /> : <i className="fa fa-caret-right right-arrow" />}
                        </Dropdown>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div
                onClick={context.toggelSidebar}
                style={context.state.smallSidebar ? { left: "56px" } : {}}
                className="dashboard-sidebar-select-button"
              >
                <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
              </div>
            </div>
            <ImagesModal
              imageModal={this.state.imageModal}
              modalSelectedMenu={this.state.modalSelectedMenu}
              modalSelectedMenuAction={this.modalSelectedMenu}
              loadModalImages={this.state.loadModalImages}
              onHide={() =>
                this.setState({
                  imageModal: false,
                  modalSelectedMenu: "highlightedImage",
                  loadModalImages: [],
                  loader: false,
                  currentViewImage: null,
                })
              }
            />
            {this._render_metadata_modal()}
            {this.state.metaDataModal ? (
              <div>
                {this.state.current_step === 1 ? null : (
                  <div className="flat-btn-container">
                    <button className="float-btn" onClick={(e) => this.showMetaData("previous")}>
                      <i className="fa fa-angle-double-left" style={{ color: "#ff9879", textShadow: "1px 1px 1px #ccc", fontSize: "2.0em" }}></i>
                    </button>
                  </div>
                )}
                {this.state.current_step === this.state.stepsData.length - 1 ? null : (
                  <div className="flat-btn-container">
                    <button className="float-btn-right" onClick={(e) => this.showMetaData("next")}>
                      <i className="fa fa-angle-double-right" style={{ color: "#ff9879", textShadow: "1px 1px 1px #ccc", fontSize: "2.0em" }}></i>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            {this.state.imageModal ? (
              <div>
                {this.state.currentViewImage === 1 ? null : (
                  <div className="flat-btn-container">
                    <button className="float-btn" onClick={(e) => this.showImage("previous")}>
                      <i className="fa fa-angle-double-left" style={{ color: "#ff9879", textShadow: "1px 1px 1px #ccc", fontSize: "2.0em" }}></i>
                    </button>
                  </div>
                )}
                {this.state.currentViewImage === this.state.stepsData.length - 1 ? null : (
                  <div className="flat-btn-container">
                    <button className="float-btn-right" onClick={(e) => this.showImage("next")}>
                      <i className="fa fa-angle-double-right" style={{ color: "#ff9879", textShadow: "1px 1px 1px #ccc", fontSize: "2.0em" }}></i>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            <ViewGroupModal
              groupIds={this.state.groupIds}
              viewGroupModal={this.state.viewGroupModal}
              onHide={() =>
                this.setState({
                  viewGroupModal: false,
                  viewGroupModalInformation: [],
                })
              }
              loadSteps={this.loadSteps}
              viewGroupModalInformation={this.state.viewGroupModalInformation}
              imageModal={(e) => this.loadModalImages(e)}
              modalInformation={(details) =>
                this.setState({
                  metaDataModal: true,
                  modalInformation: details,
                })
              }
              sessionUrl={this.state.allData.testcases ? this.state.allData.testcases[0].testcasecomponents[0].objectrepository.url : ""}
              deleteCard={(e) =>
                this.setState({
                  deleteConfirmation: true,
                  deleteTestCaseId: e,
                })
              }
            />
            <NewTestcasesGroupModal
              stepsDataGroupModal={this.state.stepsDataGroupModal}
              stepsDataGroup={this.state.stepsDataGroup}
              onHide={() =>
                this.setState({
                  stepsDataGroupModal: false,
                  stepsDataGroup: [],
                  loader: false,
                })
              }
              loader={() => this.setState({ loader: true })}
              loadSteps={this.loadSteps}
            />
            <AddnewExistingSteps
              addnewExistingSteps={this.state.addnewExistingSteps}
              beforeStepIndex={this.state.beforeStepIndex}
              loadSteps={this.loadSteps}
              afterStepIndex={this.state.afterStepIndex}
              onHide={() => this.setState({ addnewExistingSteps: false, beforeStepIndex: "", afterStepIndex: "" })}
            />
            <AllGroupModal
              allGroupModal={this.state.allGroupModal}
              onHide={() =>
                this.setState({
                  allGroupModal: false,
                  beforeStepIndex: "",
                  afterStepIndex: "",
                })
              }
              groupIds={this.state.groupIds}
              loadSteps={this.loadSteps}
              stepsData={this.state.stepsData}
              beforeStepIndex={this.state.beforeStepIndex}
              afterStepIndex={this.state.afterStepIndex}
            />
            <AddNewTestcaseSteps
              addnewSteps={this.state.addnewSteps}
              beforeStepIndex={this.state.beforeStepIndex}
              loadSteps={this.loadSteps}
              afterStepIndex={this.state.afterStepIndex}
              onHide={() => this.setState({ addnewSteps: false, beforeStepIndex: "", afterStepIndex: "" })}
            />
            <DeletePopupModal
              deleteConfirmation={this.state.deleteConfirmation}
              onHide={() =>
                this.setState({
                  deleteConfirmation: false,
                  deleteTestCaseId: "",
                })
              }
              delete={this.delete}
            />
            <KeyboardEventHandler
              handleKeys={["all"]}
              onKeyEvent={(key, e) => {
                if (this.state.currentViewImage !== null) {
                  if (key === "right") {
                    this.showImage("next");
                  } else if (key === "left") {
                    this.showImage("previous");
                  }
                } else if (this.state.current_step !== null) {
                  if (key === "right") {
                    this.showMetaData("next");
                  } else if (key === "left") {
                    this.showMetaData("previous");
                  }
                }
              }}
            />
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
