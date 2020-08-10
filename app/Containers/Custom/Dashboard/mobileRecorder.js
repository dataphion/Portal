import React from "react";
import constants from "../../../constants";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import Loader from "../../../Components/Loader";
import Header from "../../../Components/Header";
import socketIOClient from "socket.io-client";
import { Empty, Input } from "antd";
import { Modal, Alert } from "rsuite";
const socket = socketIOClient(constants.socket_url);
import DashboardSidebar from "../../../Components/DashboardSidebar";
import Screenshot from "./Screenhot";
import { Context } from "../../Context";
import { Link } from "react-router-dom";
import "../../../Assets/Styles/Custom/Dashboard/TestcaseSteps.scss";
import "../../../Assets/Styles/Custom/Dashboard/MobileRecorder.scss";

export default class MobileRecorder extends React.Component {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {
      allData: "",
      isHovering: false,
      selected_switch: "tap",
      screenshot: null,
      sendKeyContainer: false,
      deleteConfirmation: false,
      sendKeyContent: "",
      loader: false,
      selected_element: null,
      search_text: "",
      warning_show: true,
      steps_data: [],
      playback_steps_data: [],
      loader: false,
      os: "",
      capabilities: {},
      remoteVisible: false,
      selected_active_step: "",
      ribbon_tile_value: "",
      tile_value: "",
      ribbon_tile: 0,
      current_view: "MY TV",
      focused_on: "",
      UImode: false,
      recordedItems: [],
      UImode: false,
    };
  }

  componentDidMount() {
    const { state } = this.context;
    if (state.connected_agent.length == 0) {
      this.props.history.push({
        pathname: `/dashboard/${window.location.pathname.split("/")[2]}/test-cases`,
      });
      return Alert.warning("Desktop agent is not connected.");
    }

    this.loadSteps();
  }

  handleMouseHover = () => {
    this.setState(this.toggleHoverState);
  };

  toggleHoverState = (state) => {
    return {
      isHovering: !state.isHovering,
    };
  };

  async loadSteps() {
    const query = `{testcases(where:{id:"${window.location.pathname.split("/")[5]}"}){name,mobile_platform,capabilities,application{id,name}
                      testcasecomponents{type,related_object_id,sequence_number,
                      objectrepository{id,action,element_xpaths,height,width,element_attributes,element_label,element_type,placeholder,x_cord,y_cord,pixel_ratio,element_value,text}}}}`;
    try {
      const testcase_req = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
      });
      const testcase_json = await testcase_req.json();
      const os = testcase_json.data.testcases[0].mobile_platform;
      const capabilities = testcase_json.data.testcases[0].capabilities;
      socket.emit("create_recording_session", {
        os,
        ip: sessionStorage.getItem("publicIP"),
        capabilities,
      });
      let tcc = testcase_json.data.testcases[0].testcasecomponents;
      const steps_data = [];
      if (tcc.length != 0) {
        tcc = tcc.sort(function (a, b) {
          var x = parseInt(a["sequence_number"], 10);
          var y = parseInt(b["sequence_number"], 10);

          return x < y ? -1 : x > y ? 1 : 0;
        });

        for (const data of tcc) {
          steps_data.push({
            id: data.objectrepository.id,
            title: data.objectrepository.element_type,
            desc: data.objectrepository.element_label,
            button: data.objectrepository.action.toUpperCase(),
            element_attributes: data.objectrepository.element_attributes,
          });
        }
      }
      this.setState({ steps_data, allData: testcase_json.data.testcases[0], os, capabilities });
    } catch (error) {
      console.log(error);
    }
  }

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

  updateContext = () => {
    if (this.state.selected_element.properties["resource-id"] == "com.sling:id/my_tv") {
      this.setState({
        current_view: "MY TV",
      });
    } else if (this.state.selected_element.properties["resource-id"] == "com.sling:id/on_now") {
      this.setState({
        current_view: "ON NOW",
      });
    } else if (this.state.selected_element.properties["resource-id"] == "com.sling:id/guide") {
      this.setState({
        current_view: "GUIDE",
      });
    } else if (this.state.selected_element.properties["resource-id"] == "com.sling:id/sports") {
      this.setState({
        current_view: "SPORTS",
      });
    } else if (this.state.selected_element.xpath == '//android.widget.ImageView[@content-desc="SEARCH"]') {
      this.setState({
        current_view: "SEARCH",
      });
    } else if (this.state.selected_element.xpath == '//android.widget.ImageView[@content-desc="SETTINGS"]') {
      this.setState({
        current_view: "SETTINGS",
      });
    } else if (this.state.focused_on == "TILE") {
      this.setState({
        current_view: "PREVIEW",
        focused_on: "",
      });
    }
  };

  sendSteps = async function (action) {
    this.setState({ loader: true });
    const sequence = this.state.steps_data.length;
    const selected_step = this.context.state.selected_step;
    const selected_step_screenshot = this.context.state.selected_step_screenshot;
    const selected_step_sendkey = this.context.state.selected_step_sendkey;

    // upload and link the latest image
    let fileupload_id;
    const createFileObjReq = await fetch(selected_step_screenshot.base64);
    const createFileObjRes = await createFileObjReq.blob();
    const createFileObj = new File([createFileObjRes], "file");

    let payloadData = new FormData();
    payloadData.append("files", createFileObj);
    const reqFileUpload = await fetch(constants.upload, {
      method: "POST",
      body: payloadData,
    });
    const resFileUpload = await reqFileUpload.json();
    fileupload_id = resFileUpload[0].id;

    // Create Object repository entry
    const createOR = await fetch(constants.objectrepositories, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        element_xpaths: [selected_step.XPath],
        height: selected_step.height,
        width: selected_step.width,
        element_label: selected_step.label,
        element_type: selected_step.type || selected_step.title,
        text: selected_step.text,
        placeholder: selected_step.value,
        element_css: selected_step.class,
        x_cord: selected_step.x,
        y_cord: selected_step.y,
        base_image: fileupload_id,
        element_attributes: selected_step,
        element_value: selected_step_sendkey,
        pixel_ratio: "3.00",
      }),
    });
    const orResp = await createOR.json();

    // get device type
    const getDeviceType = await fetch(constants.devicetype, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: this.context.state.mobile_platform,
      }),
    });
    const deviceTypeResp = await getDeviceType.json();

    await fetch(constants.testcasecomponents, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile",
        sequence_number: sequence,
        objectrepository: orResp.id,
        testcase: window.location.pathname.split("/")[5],
        devicetype: deviceTypeResp,
      }),
    });
    this.context.setStepSendkey(null);
    this.setState({ loader: false });
    return orResp.id;
  };

  toggleExpand = (index) => {
    const data = this.state.data;
    data[index]["expand"] = !data[index]["expand"];
    this.setState({ data });
  };

  getHovered = (item) => {
    if (this.state.isHovering) {
      return (
        <div className="context-sub-menu">
          <div className="menu-option" onClick={() => this.recordItem("click", item)}>
            Click
          </div>
          <div className="menu-option" onClick={() => this.recordItem("assert", item)}>
            Assert
          </div>
        </div>
      );
    } else {
      return <div className="context-sub-menu"></div>;
    }
  };

  recordItem = (action, item, subitem) => {
    let it = this.state.recordedItems;
    it.push({ action: action, value: item, subvalue: subitem });
    this.setState({
      recordedItems: it,
    });
  };

  getRecordedSteps = () => {
    if (this.state.recordedItems.length == 0) {
      return <div> No steps recorded </div>;
    }
    let s = [];
    for (var step of this.state.recordedItems) {
      let r = "";
      if (step.action == "click") {
        r += "Click on : " + step.value;
      } else if (step.action == "Goto Ribbon") {
        r += "Goto Ribbon : " + step.value;
      } else if (step.action == "Goto Tile") {
        r += "Goto Tile : " + step.value;
      } else {
        r += "Assert item : " + step.value;
      }
      s.push(r);
    }
    return s.map((val, index) => {
      return <div className="recorded-item">{val}</div>;
    });
  };

  getLinearOption = (item) => {
    // return(
    //   <div> Linear Menu Item </div>
    // )
    if (item == "Goto Ribbon") {
      return (
        <div
          className="context-menu"
          onClick={() => {
            this.setState(item);
          }}
          onClick={() => {
            this.setState({ ribbon_tile: 1 });
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="context-menu-text"> {item} </div>
        </div>
      );
    } else if (item == "Goto Tile") {
      return (
        <div
          className="context-menu"
          onClick={() => {
            this.setState(item);
          }}
          onClick={() => this.setState({ ribbon_tile: 2 })}
          style={{ cursor: "pointer" }}
        >
          <div className="context-menu-text"> {item} </div>
        </div>
      );
    }
    return (
      <div
        className="context-menu"
        onClick={() => {
          this.setState(item);
        }}
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseHover}
      >
        <div className="context-menu-text"> {item} </div>
        {this.getHovered(item)}
      </div>
    );
  };

  getNestedOption = (item) => {
    if (context_menus[item].nested) {
      let items = Object.keys(context_menus[item].nested);

      return items.map((it, index) => {
        return (
          <div style={{ background: "white" }}>
            <div className="parent-context-menu">
              <div className="context-menu-text"> {it} </div>
            </div>
            {context_menus[item].nested[it].map((k, idx) => {
              return (
                <div className="child-context-menu">
                  <div className="context-menu-text"> {k} </div>
                  <div>
                    <button onClick={() => this.recordItem("click", k)} className="button">
                      Click
                    </button>
                    <button onClick={() => this.recordItem("assert", k)} className="button">
                      Assert
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      });
    }
  };

  getCurrentOptions = () => {
    let options = context_menus[this.state.current_view];
    let vals = [];
    for (var opt of options.linear) {
      vals.push(opt);
    }
    return (
      <div>
        {vals.map((val, index) => {
          return this.getLinearOption(val);
        })}
        {this.getNestedOption(this.state.current_view)}
      </div>
    );
  };

  getElementProperties() {
    if (this.state.UImode) {
      let v = this.getCurrentOptions();
      return v;
    } else {
      if (this.state.selected_element) {
        return (
          <React.Fragment>
            <div className="metadata-top-container">
              <div className="metadata-title">{this.state.selected_element.title}</div>
              <div className="metadata-search-container">
                <div className="search-logo" />
                <input
                  type="text"
                  placeholder="Search"
                  onChange={(e) => this.setState({ search_text: e.target.value })}
                  value={this.state.search_text}
                />
              </div>
            </div>
            <div className="metadata-bottom-container">
              <div className="metadata-column-title">
                <div className="column-title-text">Property</div>
                <div className="column-title-text">Value</div>
              </div>
              <div className="metadata-data-container">
                {Object.keys(this.state.selected_element.properties).map((key, index) => {
                  if (key.toLowerCase().includes(this.state.search_text.toLowerCase())) {
                    return (
                      <div className="metadata-data-row" key={index}>
                        <div className="data-row-text">{key}</div>
                        <div className="data-row-text">{this.state.selected_element.properties[key]}</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        return <Empty />;
      }
    }
  }

  onElementSelected = (element) => {
    let selectedElement = {
      title: element.tagName,
      xpath: element.xpath,
      properties: {
        title: element.tagName,
        XPath: element.xpath,
      },
    };

    for (const i of Object.keys(element.attributes)) {
      selectedElement.properties[i] = element.attributes[i];
    }

    this.setState({ selected_element: selectedElement });
    this.context.setStepData(selectedElement.properties);
  };

  refreshDevice = () => {
    socket.emit("REFRESH", {
      ip: sessionStorage.getItem("publicIP"),
    });
  };

  async recordTapFocus(type) {
    // this.updateContext();

    if (this.state.selected_element) {
      socket.emit(type, {
        ip: sessionStorage.getItem("publicIP"),
        element: this.state.selected_element.xpath,
        element_props: this.state.selected_element.properties,
      });
      let val = this.state.steps_data;
      val.push({
        id: await this.sendSteps(type.toLowerCase()),
        title: this.state.selected_element.title,
        desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
        button: type,
        element_attributes: this.state.selected_element.properties,
      });
      this.setState({ steps_data: val });
    } else {
      return Alert.warning("Please select element.");
    }
  }
  async recordRibbonTile() {
    let type = this.state.ribbon_tile == 1 ? "RIBBON" : "TILE";
    let selected_element = this.state.selected_element;
    if (type == "RIBBON") {
      this.recordItem("Goto Ribbon", this.state.ribbon_tile_value);
    } else {
      this.recordItem("Goto Tile", this.state.ribbon_tile_value, this.state.tile_value);
    }

    if (selected_element) {
      selected_element.properties["ribbon_name"] = this.state.ribbon_tile_value;
      selected_element.properties["tile_name"] = this.state.tile_value;
    }

    ipcRenderer.send(type, {
      tile_name: this.state.tile_value,
      ribbon_name: this.state.ribbon_tile_value,
      element: this.state.selected_element.xpath,
      element_props: this.state.selected_element.properties,
    });

    this.setState(
      {
        focused_on: "TILE",
      },
      () => {
        this.updateContext();
      }
    );

    let val = this.state.steps_data;
    val.push({
      id: await this.sendSteps("go to " + type.toLowerCase()),
      title: this.state.selected_element.title,
      desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
      button: "GO TO " + type,
      element_attributes: this.state.selected_element.properties,
    });
    this.setState({ steps_data: val, ribbon_tile_value: "", ribbon_tile: 0, loader: false, selected_element });
  }

  playback = () => {
    socket.emit("PLAYBACK", {
      testcase_id: Number(window.location.pathname.split("/")[5]),
      os: this.state.os,
      capabilities: this.state.capabilities,
      ip: sessionStorage.getItem("publicIP"),
    });
  };

  render() {
    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            <div className="main-container animated fadeIn">
              {context.state.smallSidebar ? <Header /> : <DashboardSidebar />}
              <div className="body-container">
                <div className="filter-panel-container">
                  <div className="breadcrumbs-container">
                    <i className="fa fa-map-marker" />
                    <Link to="/">APPLICATIONS</Link>
                    <div className="breadcrumbs-items">></div>
                    <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/test-cases`} className="breadcrumbs-items">
                      {this.state.allData ? this.state.allData.application.name : ""}
                    </Link>

                    <div className="breadcrumbs-items">></div>
                    <div className="breadcrumbs-items">{this.state.allData ? this.state.allData.name : ""}</div>
                  </div>
                  <div className="filter-panel-right-part">
                    <div
                      // onClick={this.triggerExtension}
                      onClick={this.playback}
                      className="positive-button"
                    >
                      <i className="fa fa-play" />
                      Run Steps
                    </div>
                  </div>
                </div>
                <div className="filter-panel-information-container">
                  <div className="filter-panel-information-text">Total {this.state.steps_data.length} Steps</div>
                  {/* {this.state.allData.testcases ? ( */}
                  <div className="filter-panel-information-uri animated zoomIn faster">
                    <div className="filter-panel-information-uri-big">mobile testcase</div>
                    {/* <div className="filter-panel-information-uri-small">{sorted_testcasecomponents.length !== 0 ? sorted_testcasecomponents[0].objectrepository.url : "-----"}</div> */}
                    <div className="filter-panel-information-uri-small">{this.state.allData ? this.state.allData.name : ""}</div>
                  </div>
                  {/* ) : null} */}
                </div>
                <div>
                  {/* mobile recording design here */}
                  <div className="recording-container animated fadeIn">
                    <div className="recording-header-container">
                      <div className="left-part" id="left-part-recording">
                        <div className="toggle-switch-container animated fadeIn">
                          <div
                            onClick={() => {
                              this.recordTapFocus("TAP");
                            }}
                            className="actions-btn"
                          >
                            <div className="tap-switch-logo" />
                            Tap
                          </div>
                          <div onClick={() => this.recordTapFocus("FOCUS")} className="actions-btn">
                            <div className="swipe-switch-logo" />
                            Focus
                          </div>
                          <div onClick={() => this.setState({ sendKeyContainer: true })} className="actions-btn">
                            <div className="coordinates-switch-logo" />
                            Send Text
                          </div>
                          {/* <div className="actions-btn" onClick={() => this.setState({ ribbon_tile: 1 })}>
                              <div className="tap-switch-logo" />
                              Go to Ribbon
                            </div>
                            <div className="actions-btn" onClick={() => this.setState({ ribbon_tile: 2 })}>
                              <div className="tap-switch-logo" />
                              Go to Tile
                            </div>
                            <div className="actions-btn" onClick={() => this.resetFavorite()}>
                              <div className="tap-switch-logo" />
                              Reset Favorites
                            </div> */}
                        </div>
                      </div>
                      {/* <div className="center-part">
                        {!window.localStorage.getItem("testcase_id") ? (
                          <div className="header-button-container animated fadeIn" onClick={() => this.setState({ remoteVisible: true })}>
                            <div className="fa fa-mobile" style={{ marginRight: "10px", color: "#cbccd1" }} />
                            REMOTE
                          </div>
                        ) : null}
                      </div> */}
                      <div className="right-part">
                        <div className="header-button-container" onClick={() => this.refreshDevice()}>
                          <div className="refresh-header-button-logo" />
                          Refresh Screen
                        </div>
                        {/* <div
                          className="header-button-container"
                          style={this.state.UImode ? { background: "#fff", color: "#34374d" } : {}}
                          onClick={
                            () => this.setState({ UImode: !this.state.UImode }) // () => {
                            //   if (this.state.UImode) {
                            //     Sortable.create(document.getElementById("dr2"));
                            //     Sortable.create(document.getElementById("dr1"));
                            //   }
                            // })
                          }
                        >
                          UI Mode
                        </div>
                        <div
                          // onClick={this.quitSession}
                          className="header-quit-button"
                        >
                          <div className="header-quit-button-logo" />
                          QUIT SESSION
                        </div> */}
                      </div>
                    </div>
                    <div className="recording-body-container">
                      <div className="left-part" id="left-part-recording-preview">
                        <div className="recording-preview-container">
                          <Screenshot onElementSelected={this.onElementSelected} />
                        </div>
                      </div>
                      <div className="center-part">
                        <div className="center-button-container">
                          <div className="button">METADATA INFORMATION</div>
                        </div>
                        <div className="center-body-container">{this.getElementProperties()}</div>
                      </div>
                      <div className="right-part">
                        {/* <div className="recorded-step-top-part">
                          <div className="title">RECORDED STEPS</div>
                          <div className="counter">{this.state.steps_data.length}</div>
                        </div> */}
                        {this.state.steps_data.length > 0 ? (
                          <div className="recorded-warning-container" style={!this.state.warning_show ? { display: "none" } : {}}>
                            <div className="recorded-left-part">
                              <div className="recorded-warning-logo" />
                              <div className="recorded-warning-desc">Click on any element to inspect it’s metadata information.</div>
                            </div>
                            <div className="recorded-warning-close" onClick={() => this.setState({ warning_show: false })}>
                              <div className="recorded-warning-close-logo" />
                            </div>
                          </div>
                        ) : null}
                        <div className="steps-lists-container">
                          {this.state.steps_data.map((data, index) => (
                            <div
                              className="steps-lists-row"
                              id={`step-${data.id}`}
                              key={index}
                              onClick={() =>
                                this.setState({
                                  selected_element: {
                                    ...this.state.selected_element,
                                    properties: data.element_attributes,
                                  },
                                  selected_active_step: index,
                                })
                              }
                              style={this.state.selected_active_step === index ? { border: "1px solid #565b72" } : {}}
                            >
                              <div className="steps-drag-logo" />
                              <div className="steps-row-title">{data.title}</div>
                              <div className="steps-right-arrow" />
                              <div className="steps-row-desc">{data.desc}</div>
                              <div className="steps-row-button">{data.button}</div>
                              <div
                                className="steps-row-button"
                                style={{ background: "#ff6b6b", color: "#fff", cursor: "pointer", marginLeft: "5px", fontSize: "15px" }}
                                onClick={() =>
                                  this.setState({
                                    deleteConfirmation: true,
                                    deleteTestCaseId: data.id,
                                  })
                                }
                              >
                                <i className="fa fa-trash" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            <Modal
              show={this.state.sendKeyContainer}
              onHide={() => {
                this.setState({ sendKeyContainer: false, sendKeyContent: "" });
              }}
            >
              <Modal.Header>
                <Modal.Title>Enter your text</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Input autoFocus value={this.state.sendKeyContent} onChange={(e) => this.setState({ sendKeyContent: e.target.value })} />
              </Modal.Body>
              <Modal.Footer>
                <div className="sr-form-footer-btn-container">
                  <div
                    onClick={() => {
                      this.setState({ sendKeyContainer: false, sendKeyContent: "" });
                    }}
                    className="negative-button"
                  >
                    <i className="fa fa-close" /> Cancel
                  </div>
                  <div
                    onClick={async () => {
                      if (this.state.sendKeyContent) {
                        context.setStepSendkey(this.state.sendKeyContent);
                        socket.emit("SENDKEYS", {
                          ip: sessionStorage.getItem("publicIP"),
                          element: this.state.selected_element.xpath,
                          element_props: this.state.selected_element.properties,
                          text: this.state.sendKeyContent,
                        });
                        this.setState({ sendKeyContainer: false, sendKeyContent: "" });
                        let val = this.state.steps_data;
                        val.push({
                          id: await this.sendSteps("sendkey"),
                          title: this.state.selected_element.title,
                          desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
                          button: "SENDTEXT",
                          element_attributes: this.state.selected_element.properties,
                        });
                        this.setState({ steps_data: val });
                      }
                    }}
                    className="positive-button"
                  >
                    <i className="fa fa-check" />
                    Send
                  </div>
                </div>
              </Modal.Footer>
            </Modal>
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
