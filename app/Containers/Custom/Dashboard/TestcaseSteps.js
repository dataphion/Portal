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
import { Switch, Checkbox, Menu, Dropdown } from "antd";
import { Alert, Whisper, Tooltip, Modal } from "rsuite";
import constants from "../../../constants";
import { Context } from "../../Context";
import _ from "lodash";
import socketIOClient from "socket.io-client";
import AddNewTestcaseSteps from "../../../Components/AddNewTestcaseSteps";
const { SubMenu } = Menu;
import KeyboardEventHandler from "react-keyboard-event-handler";
import DataDrivenModal from "../../../Components/DataDrivenModal";

export default class TestcaseSteps extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      allData: [],
      socket: socketIOClient(constants.socket_url),
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
      timeOutField: false,
      expected_condition: "",
      driven_data: null,
      browserModal: false,
      selected_browser: "",
      Browser_list: [
        {
          id: "chrome",
          name: "Google Chrome ",
        },
        {
          id: "firefox",
          name: "Firefox ",
        },
        {
          id: "MicrosoftEdge",
          name: "Microsoft Edge",
        },
      ],
      select_browser_err: false,
      group_steps: 0,
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
    console.log("Inside component did mount");
    if (sessionStorage.getItem("id")) {
      console.log("Session storage has ID..");

      this.loadSteps();
      //socket code for record

      this.state.socket.on("connect", function () {
        console.log("connected to Socket Server.... ");
      });

      this.state.socket.on("disconnect", function () {
        console.log("disconnected to Socket Server.... ");
      });
      const testcase_id = window.location.pathname.split("/")[5];
      this.state.socket.on(testcase_id + "_play_back", (data) => {
        console.log("Received message from Socket.io server");
        console.log(data);

        //condition to check it has same testcase id and start only on playback
        if (data.testcase_id == testcase_id) {
          let new_step_data = this.state.stepsData;
          for (let find_id_sequence in new_step_data) {
            //condition for check after open url
            //condition for check objectrepo id is same

            // ---------------------- IF TESTCASE GROUP FOUND IN RUNNING TESTCASE ----------
            if (!!new_step_data[find_id_sequence]["testcasecomponents"]) {
              let testcase_group = new_step_data[find_id_sequence]["testcasecomponents"];
              // new_step_data[find_id_sequence]["testcasecomponents"] = testcase_group;
              for (let g_seq_id in testcase_group) {
                if (testcase_group[g_seq_id].objectrepository.id === data.id) {
                  if (data.status === "started") {
                    new_step_data[find_id_sequence].openUrlLoader = true;
                    new_step_data[find_id_sequence].failedcase = false;
                    this.setState({
                      stepsData: new_step_data,
                    });
                  }
                  if (data.status === "completed") {
                    let group_steps = this.state.group_steps;
                    group_steps = group_steps - 1;
                    if (group_steps <= 0) {
                      new_step_data[find_id_sequence].playback = true;
                      new_step_data[find_id_sequence].openUrlLoader = false;
                      new_step_data[find_id_sequence].failedcase = false;
                    }
                    this.setState({ group_steps: group_steps, stepsData: new_step_data });
                  }
                  if (data.status === "failed") {
                    new_step_data[find_id_sequence].playback = false;
                    new_step_data[find_id_sequence].openUrlLoader = false;
                    new_step_data[find_id_sequence].failedcase = true;
                    this.setState({
                      stepsData: new_step_data,
                      openUrlLoader: false,
                    });
                  }
                }
              }
              // ----------------------------------------------------
            } else {
              if (new_step_data[find_id_sequence].objectrepository.id === data.id) {
                if (data.status === "started") {
                  new_step_data[find_id_sequence].openUrlLoader = true;
                  new_step_data[find_id_sequence].failedcase = false;
                  this.setState({
                    stepsData: new_step_data,
                  });
                }
                if (data.status === "completed") {
                  // new_step_data[0].playback = false;
                  // new_step_data[0].openUrlLoader = false;
                  new_step_data[find_id_sequence].playback = true;
                  new_step_data[find_id_sequence].openUrlLoader = false;
                  new_step_data[find_id_sequence].failedcase = false;
                  this.setState({
                    stepsData: new_step_data,
                    openUrlLoader: false,
                  });
                }
                if (data.status === "failed") {
                  new_step_data[find_id_sequence].playback = false;
                  new_step_data[find_id_sequence].openUrlLoader = false;
                  new_step_data[find_id_sequence].failedcase = true;
                  this.setState({
                    stepsData: new_step_data,
                    openUrlLoader: false,
                  });
                }
              }
            }
          }
        }
      });

      this.state.socket.on(sessionStorage.getItem("id") + "_record", (data) => {
        const testcase_id = window.location.pathname.split("/")[5];

        if (data.testcase.id == testcase_id && data.testcase.sequence_number !== "1") {
          this.setState({
            stepsData: [...this.state.stepsData, data.testcase],
            openUrlLoader: false,
          });
        }
      });
      //socket code for play back proptector
      console.log("Listening on Socket IO");
      console.log(window.location.pathname.split("/")[5] + "_play_back");
      console.log("----------------------");
      // this.state.socket.on(window.location.pathname.split("/")[5] + "_play_back", data => {
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
            feature{name},ddt_file{
              id,
              name
              ext
            },
            testcasecomponents(where:{type:"ui"}){id,sequence_number,group_name,
                objectrepository{id,url,alias_name,thumbnail_url,horizontal_anchor_text,vertical_anchor_text,object_by_lable,action,element_type,element_label,element_id,element_value,element_xpaths,element_css,element_health,element_attributes,description,nlu,browser_height,browser_width,tag,protocol,query_parameters,domain,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder,fileupload_url{name}, best_match, timeout, expected_condition}
                testcasegroup{
                  id,
                  name,
                  testcasecomponents{
                    id,sequence_number,group_name,
                    objectrepository{id,url,alias_name,thumbnail_url,horizontal_anchor_text,vertical_anchor_text,object_by_lable,action,element_type,element_label,element_id,element_value,element_xpaths,element_css,element_health,element_attributes,description,nlu,browser_height,browser_width,tag,protocol,query_parameters,domain,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder,fileupload_url{name}, best_match, timeout, expected_condition}
                  }
                }
            }
            testcasegroups{
              id,
              name,
              testcasecomponents{
                id,sequence_number,group_name,
                objectrepository{id,url,alias_name,thumbnail_url,horizontal_anchor_text,vertical_anchor_text,object_by_lable,action,element_type,element_label,element_id,element_value,element_xpaths,element_css,element_health,element_attributes,description,nlu,browser_height,browser_width,tag,protocol,query_parameters,domain,path,text,x_scroll,y_scroll,pixel_ratio,x_cord,y_cord,height,width,placeholder,fileupload_url{name}, best_match, timeout, expected_condition}
              }
            }
          }
        }
      }`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        let respSteps = response.data.applications[0].testcases[0].testcasecomponents;
        const allGroups = response.data.applications[0].testcases[0].testcasegroups;
        if (respSteps.length > 0) {
          // Filter other group record
          const allSteps = [];
          // explicitly increment sequence number
          let sequence_id = 1;
          // debugger;
          respSteps = _.orderBy(respSteps, ["sequence_number"], ["asc"]);
          for (const data of respSteps) {
            if (data.objectrepository) {
              allSteps.push({
                id: data.id,
                // sequence_number: Number(data.sequence_number),
                sequence_number: Number(data.sequence_number) % 1 == 0 ? (Number(data.sequence_number) == sequence_id ? Number(data.sequence_number) : sequence_id) : Number(data.sequence_number),
                original_sequence_number: Number(data.sequence_number),
                objectrepository: data.objectrepository,
              });
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
                sequence_number: Number(data.sequence_number) % 1 == 0 ? (Number(data.sequence_number) == sequence_id ? Number(data.sequence_number) : sequence_id) : Number(data.sequence_number),
                // original_sequence_number: Number(data.sequence_number),
                name: data.testcasegroup.name,
                testcasecomponents: filtered,
              });
            }
            if (Number(data.sequence_number) % 1 == 0) {
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
          // sort testcasecomponent to get first open_url

          this.setState({
            loader: false,
            allData: response.data.applications[0],
            stepsData: sortedAllSteps,
            groupIds: groupIds,
            driven_data: response.data.applications[0].testcases[0].ddt_file || null,
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
    if (action === "mouselclick") {
      return "LEFT CLICK";
    } else if (action === "mouserclick") {
      return "RIGHT CLICK";
    } else if (action === "mousedclick") {
      return "DOUBLE CLICK";
    } else if (action === "text_input") {
      return "TEXT INPUT";
    } else if (action === "dropdown") {
      return "DROPDOWN";
    } else if (action === "drag" || action === "drop") {
      return "DRAG & DROP";
    } else if (action === "custom") {
      return "CUSTOM";
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
        query: `{testcasecomponents(where:{id:"${id}"}){objectrepository{height,width,highlighted_image_url,element_snapshot,page_url, pixel_ratio}}}`,
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

  // triggerExtension = () => {
  //   const extension_id = constants.extension_id;
  //   const message = {
  //     type: "playback",
  //     id: window.location.pathname.split("/")[5]
  //   };
  // let new_stepdata = this.state.stepsData;
  // for (let index in this.state.stepsData) {
  //   new_stepdata[index].playback = false;
  // }
  // this.setState({
  //   stepsData: new_stepdata,
  //   openUrlLoader: true,
  //   playback_start: true
  // });
  //   chrome.runtime.sendMessage(extension_id, message, response => {
  //     if (!response.status === "successful") alert("Remote Execution Failed");
  //   });
  // };

  SelectBrowser = () => {
    this.setState({ browserModal: true });
  };

  handleChange = (e) => {
    this.setState({ selected_browser: e.target.value, select_browser_err: false });
  };

  handleModalCancel = () => {
    this.loadSteps();
    // this.setState({ showDttModal: false })
    this.setState({ browserModal: false, selected_browser: "", select_browser_err: false, showDttModal: false });
  };

  setBrowser = () => {
    return (
      <Modal title="Basic Modal" show={this.state.browserModal} onHide={this.handleModalCancel} className="config-modal">
        <Modal.Header>
          <Modal.Title>Select Browser</Modal.Title>
        </Modal.Header>
        <Modal.Body className="source-from">
          <select className={this.state.select_browser_err ? "select-env-err select-env" : "select-env"} onChange={this.handleChange}>
            <option value="">Select Browser</option>

            {this.state.Browser_list.map((data, index) => {
              return (
                <option key={index} value={data["id"]}>
                  {data["name"]}
                </option>
              );
            })}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <div className="sr-form-footer-btn-container">
            <div onClick={this.handleModalCancel} className="negative-button">
              <i className="fa fa-close" /> Cancel
            </div>
            <div onClick={this.triggerPlayback} className="positive-button">
              <i className="fa fa-check" />
              Run
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  triggerPlayback = async function () {
    if (!this.state.selected_browser) {
      Alert.warning("Please Select Browser");
      this.setState({ select_browser_err: true });
      return;
    } else {
    }

    // get selenium details
    const get_selenium_details = await fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{
          applications(
            where: {
              user: { id: "${sessionStorage.getItem("id")}"},
              id: "${window.location.pathname.split("/")[2]}"
            }
          ) {
            selenium_configure{
              id,
              host,
              port
            }
          }
        }`,
      }),
    });

    const selenium_address = await get_selenium_details.json();
    const get_testsessionexecution_id_req = await fetch(`${constants.graphql}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{
        applications(where:{id:"${window.location.pathname.split("/")[2]}"}){
          testsuites(where:{suite_name:"default"}){
            testsessionexecutions{
              id
            }
          }
        }
      }`,
      }),
    });

    const get_testsessionexecution_id_res = await get_testsessionexecution_id_req.json();
    const api_req = await fetch(`${constants.testcases}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        testcaseid: window.location.pathname.split("/")[5],
        testsessionid: 1,
        environment_id: "",
        browser: this.state.selected_browser,
        protractor_host: `http://${selenium_address.data.applications[0].selenium_configure.host}:${selenium_address.data.applications[0].selenium_configure.port}/wd/hub`,
      }),
    });

    const api_res = await api_req.json();

    if (api_res.status === "success") {
      let new_stepdata = this.state.stepsData;
      for (let index in this.state.stepsData) {
        new_stepdata[index].playback = false;
        new_stepdata[index].failedcase = false;
      }
      Alert.success("Testcase Started !");
      for (const test of this.state.stepsData) {
        if (!!test["testcasecomponents"]) {
          this.setState({ group_steps: test["testcasecomponents"].length });
        }
      }
      this.setState({ browserModal: false });
    } else {
      Alert.error("Remote Execution Failed");
    }
  }.bind(this);

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  _render_metadata_modal = () => {
    if (this.state.metaDataModal) {
      return (
        <div>
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
          {/* <i className="fa fa-angle-double-right"></i> */}
        </div>
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
    } else if (e.key === "2") {
      this.setState({
        allGroupModal: true,
        beforeStepIndex: before,
        afterStepIndex: after,
      });
    } else if (e.key === "3") {
      this.setState({ expected_condition: "visibilityOf", timeOutField: true, addnewSteps: true, beforeStepIndex: before, afterStepIndex: after });
    } else if (e.key === "4") {
    } else if (e.key === "5") {
    } else if (e.key === "6") {
      this.setState({ expected_condition: "invisibilityOf", timeOutField: true, addnewSteps: true, beforeStepIndex: before, afterStepIndex: after });
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
    // let sorted_testcasecomponents = [];
    // if (this.state.allData.length !== 0) {
    //   sorted_testcasecomponents = this.state.allData.testcases[0].testcasecomponents.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
    // }

    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            {this.setBrowser()}
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
                  <div className="filter-panel-right-part panel-size">
                    {this.state.stepsDataGroup.length > 0 ? (
                      <div onClick={() => this.setState({ stepsDataGroupModal: true })} className="negative-button animated fadeInRight">
                        <i className="fa fa-group" />
                        Create Group
                      </div>
                    ) : null}
                    <Whisper
                      placement="bottom"
                      trigger="hover"
                      speaker={this.Tooltip("run steps")}
                      // onClick={this.triggerExtension}
                      // onClick={this.triggerPlayback}
                      onClick={this.SelectBrowser}
                      // className="positive-button"
                    >
                      <i className="fa fa-play fa-lg fa-color-run" />
                      {/* Run Steps */}
                    </Whisper>
                    <Whisper
                      placement="bottom"
                      trigger="hover"
                      speaker={this.Tooltip("stop")}
                      // onClick={this.triggerPlayback}
                    >
                      <i className="fa fa-stop-circle fa-lg fa-color-stop" aria-hidden="true"></i>
                    </Whisper>
                    <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("data source")}>
                      <div
                        // onClick={this.triggerExtension}
                        onClick={() => {
                          this.setState({ showDttModal: true });
                        }}
                      >
                        <i className="fa fa-database fa-lg fa-color-ds" aria-hidden="true"></i>
                      </div>
                    </Whisper>
                    <div className="filter-panel-information-text fa-color">
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
                </div>
                <div className="filter-panel-information-container">
                  <div className="filter-panel-information-text">{`Total ${this.state.stepsData.length} Steps`}</div>
                  {this.state.allData.testcases ? (
                    <div className="filter-panel-information-uri animated zoomIn faster">
                      <div className="filter-panel-information-uri-big">{this.state.allData.testcases[0].name}</div>
                      {/* <div className="filter-panel-information-uri-small">{sorted_testcasecomponents.length !== 0 ? sorted_testcasecomponents[0].objectrepository.url : "-----"}</div> */}
                      <div className="filter-panel-information-uri-small">{this.state.stepsData.length !== 0 ? this.state.stepsData[0].objectrepository.url : "-----"}</div>
                    </div>
                  ) : null}
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
                                <div className={"testcase-container " + (details.testcasecomponents ? "testcase-container-first" : details.sequence_number === 1 ? "testcase-container-first" : "")}>
                                  {!details.testcasecomponents ? (
                                    details.sequence_number !== 1 ? (
                                      details.objectrepository ? (
                                        details.objectrepository.thumbnail_url ? (
                                          <img src={constants.image_host + details.objectrepository.thumbnail_url} height="100%" width="100%" />
                                        ) : (
                                          <img src="https://www.emergerstrategies.com/wp-content/themes/cannyon_/media/_frontend/img/grid-no-image.png" height="100%" width="100%" />
                                        )
                                      ) : (
                                        <img src="https://www.emergerstrategies.com/wp-content/themes/cannyon_/media/_frontend/img/grid-no-image.png" height="100%" width="100%" />
                                      )
                                    ) : null
                                  ) : null}
                                  {details.sequence_number === 1 ? (
                                    <div className={details.sequence_number === 1 && this.state.openUrlLoader === true ? "lds-dual-ring" : " "}>
                                      <div className={details.sequence_number === 1 && details.openUrlLoader ? "lds-dual-ring" : " "}>
                                        <div
                                          className={
                                            "testcase-container-index-count " + (details.playback ? "testcase-container-right-tick" : "") + (details.openUrlLoader ? "overwirte-background" : " ")
                                          }
                                        >
                                          {details.sequence_number}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className={details.sequence_number !== 1 && details.openUrlLoader ? "lds-dual-ring" : " "}>
                                      <div
                                        className={
                                          "testcase-container-index-count " +
                                          (details.playback ? "testcase-container-right-tick" : "") +
                                          (details.openUrlLoader ? "overwirte-background" : " ") +
                                          (details.failedcase ? "failed-test-background" : "")
                                        }
                                      >
                                        {details.sequence_number}
                                      </div>
                                    </div>
                                  )}

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
                                  ) : details.sequence_number === 1 ? (
                                    <div className="testcase-container-first-header">
                                      <div className="globe-icon" /> OPEN URL
                                    </div>
                                  ) : null}
                                  <div className="testcase-container-footer">
                                    <div className="testcase-container-footer-tools">
                                      {!details.testcasecomponents && details.sequence_number !== 1 && details.objectrepository ? (
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("View Images")}>
                                          <div
                                            onClick={() => {
                                              this.setState({
                                                currentViewImage: index,
                                                current_objectrepo_id: details.objectrepository.id,
                                              });
                                              this.loadModalImages(details.id);
                                            }}
                                            className="testcase-container-footer-tool-btn"
                                          >
                                            <i className="fa fa-picture-o" />
                                          </div>
                                        </Whisper>
                                      ) : null}
                                      {!details.testcasecomponents && details.sequence_number !== 1 && details.objectrepository ? (
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
                                        <Whisper placement="bottom" trigger="hover" speaker={this.Tooltip("View Groupp")}>
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
                                        : details.sequence_number === 1
                                        ? this.state.allData.testcases
                                          ? this.state.allData.testcases[0].testcasecomponents[0].objectrepository.url
                                          : ""
                                        : details.objectrepository
                                        ? details.objectrepository.description
                                          ? details.objectrepository.description
                                          : details.objectrepository.action === "text_validation" || details.objectrepository.action === "element_validation"
                                          ? "Validation"
                                          : "Autofocus"
                                        : "No discription"}
                                    </div>
                                  </div>
                                </div>
                                {details.sequence_number !== 1 ? (
                                  <div className={details.visible ? "testcase-steps-right-arrow-container-on-hover" : "testcase-steps-right-arrow-container"}>
                                    <Dropdown
                                      overlay={
                                        <Menu onClick={(e) => this.handleMenuClick(e, this.state.stepsData[index - 1].sequence_number, this.state.stepsData[index].sequence_number)}>
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
                                          </SubMenu>
                                          <Menu.Item key="2">Add Group</Menu.Item>
                                          <Menu.Item key="3">Element Visible</Menu.Item>
                                          <Menu.Item key="4">Compare Element Value</Menu.Item>
                                          <Menu.Item key="5">Data Source</Menu.Item>
                                          <Menu.Item key="6">Element Absent</Menu.Item>
                                        </Menu>
                                      }
                                      onVisibleChange={(flag) => {
                                        this.handleVisibleChange(flag, index);
                                      }}
                                      visible={details.visible}
                                    >
                                      {details.visible ? <i className="fa fa-plus circle-icon-add" /> : <i className="fa fa-caret-right right-arrow" />}
                                    </Dropdown>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        : this.state.stepsData.map((details, index) => {
                            if (details.sequence_number === 1) {
                              return (
                                <div key={index} className="list-view-container animated fadeInUp faster">
                                  <div className="list-view-index-counter">{details.sequence_number}</div>
                                  <div className="list-view-action-tag">OPEN URL</div>
                                  <div className="list-view-description">{this.state.allData.testcases[0].testcasecomponents[0].objectrepository.url}</div>
                                </div>
                              );
                            } else {
                              return (
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
                                  <div className="list-view-action-tag">{details.testcasecomponents ? "GROUP" : this.renderAction(details.objectrepository.action)}</div>
                                  <div className="list-view-description">
                                    {details.testcasecomponents
                                      ? `${details.name} (${details.testcasecomponents.length} Steps)`
                                      : details.objectrepository.description
                                      ? details.objectrepository.description
                                      : details.objectrepository.action === "text_validation" || details.objectrepository.action === "element_validation"
                                      ? "Validation"
                                      : "Autofocus"}
                                  </div>
                                  <div className="list-view-hover-btn" />
                                </div>
                              );
                            }
                          })
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
              <div onClick={context.toggelSidebar} style={context.state.smallSidebar ? { left: "56px" } : {}} className="dashboard-sidebar-select-button">
                <i className="fa fa-angle-left" style={context.state.smallSidebar ? { transform: "rotate(180deg)" } : {}} />
              </div>
            </div>
            <ImagesModal
              imageModal={this.state.imageModal}
              modalSelectedMenu={this.state.modalSelectedMenu}
              modalSelectedMenuAction={this.modalSelectedMenu}
              loadModalImages={this.state.loadModalImages}
              currentObjectRepositoryId={this.state.current_objectrepo_id}
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
            <DataDrivenModal showDttModal={this.state.showDttModal} file={this.state.driven_data} onHide={this.handleModalCancel} />
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
              onHide={() => this.setState({ expected_condition: "", addnewSteps: false, beforeStepIndex: "", afterStepIndex: "", timeOutField: false })}
              showTimeoutField={this.state.timeOutField}
              expected_condition={this.state.expected_condition}
            />
            {/* add steps with timeout configuration */}
            {/* <AddStepConfiguration
              addnewSteps={this.state.showConfiguration}
              beforeStepIndex={this.state.beforeStepIndex}
              loadSteps={this.loadSteps}
              afterStepIndex={this.state.afterStepIndex}
              onHide={() => this.setState({ showConfiguration: false, beforeStepIndex: "", afterStepIndex: "" })}
            /> */}
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
