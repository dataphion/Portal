import React from "react";
import ReactDOM from "react-dom";
import "../../../Assets/Styles/Custom/Dashboard/TestcaseApi.scss";
import NewCell from "../../Custom/GraphTools/NewCell";
import ApiSidebar from "../../Custom/GraphTools/Sidebar/ApiSidebar";
import ControlSidebar from "../../Custom/GraphTools/Sidebar/ControlSidebar";
import SourceSidebar from "../../Custom/GraphTools/Sidebar/SourceSidebar";
import LogsSidebar from "../../Custom/GraphTools/Sidebar/LogsSidebar";
import { Notification, Alert, Modal, Row, Col } from "rsuite";
import Toolsbar from "../GraphTools/Toolsbar";
import LeftPanelElements from "../GraphTools/LeftPanelElements";
import constants from "../../../constants";
import axios from "axios";
import Loader from "../../../Components/Loader";
import { Link } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { Form, Input } from "antd";
import { Icon } from "rsuite";
import Graph from "react-graph-vis";
// var kafka = require("kafka-node");
import {
  mxGraph,
  mxGraphHandler,
  mxGuide,
  mxEdgeHandler,
  mxRubberband,
  mxDragSource,
  mxKeyHandler,
  mxClient,
  mxConnectionHandler,
  mxUtils,
  mxEvent,
  mxImage,
  mxConstraintHandler,
  mxUndoManager,
  mxConnectionConstraint,
  mxCellState,
  mxPoint,
  mxCompactTreeLayout,
  mxOutline,
  mxCodec,
  mxCellHighlight,
} from "mxgraph-js";
import { reject } from "lodash";
const undoManager = new mxUndoManager();
var ALLOW_EDGE = true;

class mxCellAttributeChange extends React.Component {
  constructor(cell, attribute, value) {
    console.log(value);
    super();
    this.cell = cell;
    this.attribute = attribute;
    this.value = value;
    this.previous = value;
  }
  execute() {
    if (this.cell !== null) {
      var tmp = this.cell.getAttribute(this.attribute);
      if (this.previous == null) {
        this.cell.value.removeAttribute(this.attribute);
      } else {
        this.cell.setAttribute(this.attribute, this.previous);
      }
      this.previous = tmp;
    }
  }
}

const TestcaseApi = Form.create()(
  class TestcaseApi extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        graph: {},
        layout: {},
        dragElt: null,
        sidebarModal: false,
        currentNode: null,
        executionLogs: {},
        selectedCellData: "",
        apiExecuteStatus: "",
        conditionChilds: [],
        createdGraphData: [],
        graphId: "",
        selectedPanel: "api",
        loader: false,
        profileContainer: false,
        selected_environment: "",
        Environments_list: [],
        select_env_err: false,
        visible: false,
        relvisible: false,
        relationgraph: {},
        conflictconfirmation: false,
      };
    }

    componentDidMount() {
      if (sessionStorage.getItem("id")) {
        this.LoadGraph();
        this.getEnvironments();
      } else {
        this.props.history.push("/login");
      }
    }

    getEnvironments = async () => {
      const api_req = await fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{applications(where:
            {user:{id:"${sessionStorage.getItem("id")}"},
            id:"${window.location.pathname.split("/")[2]}"}){
              id,
              environments {
                id
                type
                urls
                dbregistrations {
                  id
                  database_type
                  source_name
                }
              }

            }}`,
        }),
      });
      const api_resp = await api_req.json();
      let list = [];
      // if (environment["status"] === 200) {
      for (let env of api_resp.data.applications[0].environments) {
        list.push({ id: env["id"], environment: env["type"] });
      }
      if (list.length > 0) {
        this.setState({ Environments_list: list });
      }

      // let list = [];
      // if (environment["status"] === 200) {
      //   for (let env of environment['data']['environments']) {
      //     list.push({ id: env["id"], environment: env["type"] });
      //   }
      //   if (list.length > 0) {
      //     this.setState({ Environments_list: list });
      //   }
      // }
    };

    // This function is for load graph and load all graph require functions
    LoadGraph = () => {
      // console.log("load grapgh function called --->");
      var container = ReactDOM.findDOMNode(this.refs.divGraph);
      // Checks if the browser is supported
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error("Browser is not supported!", 200, false);
      } else {
        var graph = new mxGraph(container);

        var outlineContainer = document.getElementById("dashboard_outline_container");
        this.outline = new mxOutline(graph, outlineContainer);
        this.outline.updateOnPan = true;
        this.setState(
          {
            graph: graph,
            dragElt: this.getEditPreview(),
          },
          () => {
            const layout = new mxCompactTreeLayout(graph, false);
            this.setState({ layout });
            this.setLayoutSetting(layout);
            this.loadGlobalSetting();
            this.setGraphSetting();
            this.settingConnection();
          }
        );
        mxEvent.disableContextMenu(container);

        // Trigger event after selection
        graph.getSelectionModel();
        // .addListener(mxEvent.CHANGE, this.selectionChange);
        graph.addListener(mxEvent.DOUBLE_CLICK, this.selectionChanged);
      }

      //Load Created All Graph
      this.setState({ loader: true });
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"},id:"${window.location.pathname.split("/")[2]}"}){name,testcases(where:{id:"${
            window.location.pathname.split("/")[5]
          }"}){name,
            flow{
              graph_xml,id
              endpoints{
                id
                conflict
                conflict_message,
                endpoint,
                method
              }
            }
          }}}`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log("response --->", response.data.applications[0].testcases[0].flow);
          if (response.data.applications[0].testcases[0].flow) {
            this.setState({
              graphId: response.data.applications[0].testcases[0].flow.id,
            });
            try {
              var loadGraph = mxUtils.parseXml(response.data.applications[0].testcases[0].flow.graph_xml);
              var codec = new mxCodec(loadGraph);
              codec.decode(loadGraph.documentElement, graph.getModel());
            } finally {
            }
          }
          this.setState({
            loader: false,
            createdGraphData: response.data.applications[0],
          });
        });
      // .catch((error) => {
      //   Alert.error("Something went wrong");
      //   console.log(error);
      // });

      // Socket for real time
      const socket = socketIOClient(constants.socket_url);
      socket.on("broadcast", (data) => {
        this.setState({ apiExecuteStatus: "inProgress" });
        if (data.status === "started") {
          // Add execution started class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.add("layout-execution-started");
        } else if (data.status === "successfull") {
          // Remove execution started class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.remove("layout-execution-started");
          // Remove execution fail class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.remove("layout-execution-fail");
          // Add execution successfull class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.add("layout-execution-successfull");
        } else if (data.status === "fail") {
          // Remove execution successfull class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.remove("layout-execution-successfull");
          // Remove execution started class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.remove("layout-execution-started");
          // Add execution fail class in cell
          document.getElementById(`graph-cell-${data.id}`).classList.add("layout-execution-fail");
          // this.setState({ apiExecuteStatus: "completed" });
          // Alert.error("Layout execution failed.");
        } else if (data.status === "completed") {
          mxGraphHandler.prototype.moveEnabled = true;
          this.setState({ apiExecuteStatus: "completed" });
          Alert.success("Layout execution completed.");
        } else if (data.status === "failed") {
          mxGraphHandler.prototype.moveEnabled = true;
          this.setState({ apiExecuteStatus: "completed" });
          Alert.error("Layout execution failed.");
        }
        // Api call for show log
        console.log("data ------->", data);
        if (data.status === "successfull" || data.status === "fail") {
          console.log("execution id", data.testcaseexecutionid);
          console.log("node id", data.id);
          console.log("index", data.index);
          fetch(constants.graphql, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },

            body: JSON.stringify({
              query: `{
                testcaseexecutions(where: { id: "${data.testcaseexecutionid}" }) {
                  flowsteps(where: { node_id: "${data.id}" , index:"${data.index}"}) {
                    node_id
                    name
                    index
                    url
                    request
                    status_code
                    response
                    conditions_result
                    source_result
                  }
                }
              }`,
            }),
          })
            .then((response) => response.json())
            .then((response) => {
              console.log(response.data);
              let executionResponse = this.state.executionLogs;
              if (data.type === "testcase") {
                executionResponse[`ui_execution${data.id}`] = { status: data.status, node_id: data.id, testcaseexecutionid: data.testcaseexecutionid, name: `ui_execution-${data.id}` };
              } else {
                if (response.data.testcaseexecutions.length > 0) {
                  console.log(response.data.testcaseexecutions[0].flowsteps[0]);
                  executionResponse[`${response.data.testcaseexecutions[0].flowsteps[0].name}_${response.data.testcaseexecutions[0].flowsteps[0].index}`] =
                    response.data.testcaseexecutions[0].flowsteps[0];
                }
                console.log(executionResponse);
                this.setState({ executionLogs: executionResponse });
                // }
              }
            })
            .catch((error) => {
              Alert.error("Something went wrong");
              console.log(error);
            });
        }
      });
    };

    getEditPreview = () => {
      var dragElt = document.createElement("div");
      dragElt.style.border = "dashed black 1px";
      dragElt.style.width = "230px";
      dragElt.style.height = "69px";
      dragElt.style.borderRadius = "10px";
      return dragElt;
    };

    setLayoutSetting = (layout) => {
      layout.parallelEdgeSpacing = 10;
      layout.useBoundingBox = false;
      layout.edgeRouting = false;
      layout.levelDistance = 60;
      layout.nodeDistance = 10;
      layout.parallelEdgeSpacing = 10;
      layout.isVertexMovable = function (cell) {
        return true;
      };
      layout.localEdgeProcessing = function (node) {};
    };

    loadGlobalSetting = () => {
      // Enable alignment lines to help locate
      mxGraphHandler.prototype.guidesEnabled = true;
      // Alt disables guides
      mxGuide.prototype.isEnabledForEvent = function (evt) {
        return !mxEvent.isAltDown(evt);
      };
      // Specifies if waypoints should snap to the routing centers of terminals
      mxEdgeHandler.prototype.snapToTerminals = true;
      mxConstraintHandler.prototype.pointImage = new mxImage("https://uploads.codesandbox.io/uploads/user/4bf4b6b3-3aa9-4999-8b70-bbc1b287a968/-q_3-point.gif", 5, 5);
    };

    setGraphSetting = (clicked) => {
      const { graph } = this.state;
      const that = this;
      graph.gridSize = 10;
      graph.setPanning(true);
      graph.setTooltips(true);
      graph.setConnectable(true);
      graph.setCellsEditable(false);
      graph.setEnabled(true);
      graph.setHtmlLabels(true);
      graph.cellsResizable = false;
      graph.centerZoom = true;
      graph.autoSizeCellsOnAdd = false;
      const keyHandler = new mxKeyHandler(graph);
      keyHandler.getFunction = function (evt) {
        if (evt !== null) {
          return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey) ? this.controlKeys[evt.keyCode] : this.normalKeys[evt.keyCode];
        }
        return null;
      };

      const listener = function (sender, evt) {
        undoManager.undoableEditHappened(evt.getProperty("edit"));
      };
      graph.getModel().addListener(mxEvent.UNDO, listener);
      graph.getView().addListener(mxEvent.UNDO, listener);
      // undoManager.size = 2;

      // Mouse handler
      mxEvent.addMouseWheelListener(function (evt, up) {
        for (const i in evt.path) {
          if (evt.path[i].className === "graph-board") {
            if (up) {
              graph.zoomIn();
            } else {
              graph.zoomOut();
            }
          }
        }
      });

      graph.addMouseListener({
        mouseDown: function (sender, evt) {
          if (that.state.apiExecuteStatus === "inProgress") {
            Alert.warning("Editable mode disabled while executing.", 10000);
          }
        },
        mouseMove: function (sender, evt) {},
        mouseUp: function (sender, evt) {},
      });

      // Keyboard Shorcut Delete (Delete Key)
      keyHandler.bindKey(46, function (evt) {
        graph.removeCells();
      });

      // Keyboard Shorcut Zoom (+) (Control + Plus Key or Command + Plus Key)
      keyHandler.bindControlKey(187, function (evt) {
        graph.zoomIn();
      });

      // Keyboard Shorcut Zoom (-) (Control + Minus or Command + Minus Key)
      keyHandler.bindControlKey(189, function (evt) {
        graph.zoomOut();
      });

      // Keyboard Shorcut Restore (Control + R or Command + 0)
      keyHandler.bindControlKey(48, function (evt) {
        graph.zoomActual();
      });

      // Keyboard Shorcut Undo (Control + Z or Command + Z)
      keyHandler.bindControlKey(90, function (evt) {
        undoManager.undo();
      });

      // Keyboard Shorcut Undo (Control + Y or Command + Y)
      keyHandler.bindControlKey(89, function (evt) {
        undoManager.redo();
      });

      if (clicked === "undo") {
        undoManager.undo();
      } else if (clicked === "redo") {
        undoManager.redo();
      } else if (clicked === "zoomIn") {
        graph.zoomIn();
      } else if (clicked === "zoomOut") {
        graph.zoomOut();
      } else if (clicked === "zoomFit") {
        graph.zoomActual();
      }

      new mxRubberband(graph);
      graph.getTooltipForCell = function (cell) {
        if (cell.value !== "Edge") {
          if (cell.value.attributes.Type.value === "api") {
            if (cell.getAttribute("Method") === "uitestcase") {
              return (
                "<div class='tooltip-row-container'>" +
                "<div class='tooltip-heading'>Title: </div>" +
                "<div class='tooltip-value' style='text-transform: capitalize'>" +
                cell.getAttribute("Title") +
                "</div>" +
                "</div>" +
                "<div class='tooltip-row-container'>" +
                "<div class='tooltip-heading'>Testcase: </div>" +
                "<div class='tooltip-value'>" +
                cell.getAttribute("UiTestcaseName") +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                "<div class='tooltip-row-container'>" +
                "<div class='tooltip-heading'>Title: </div>" +
                "<div class='tooltip-value' style='text-transform: capitalize'>" +
                cell.getAttribute("Title") +
                "</div>" +
                "</div>" +
                "<div class='tooltip-row-container'>" +
                "<div class='tooltip-heading'>Uri: </div>" +
                "<div class='tooltip-value'>" +
                cell.getAttribute("Uri") +
                "</div>" +
                "</div>"
              );
            }
          } else if (cell.value.attributes.Type.value === "source") {
            return (
              "<div class='tooltip-row-container'>" +
              "<div class='tooltip-heading'>Title: </div>" +
              "<div class='tooltip-value'>" +
              cell.getAttribute("Title") +
              "</div>" +
              "</div>" +
              "<div class='tooltip-row-container'>" +
              "<div class='tooltip-heading'>Database: </div>" +
              "<div class='tooltip-value'>" +
              cell.getAttribute(
                cell.getAttribute("DatabaseType") === "oracle"
                  ? "OracleDatabase"
                  : cell.getAttribute("DatabaseType") === "rabbitmq"
                  ? "RabbitmqQueueName"
                  : cell.getAttribute("DatabaseType") === "mysql"
                  ? "MysqlDatabase"
                  : cell.getAttribute("DatabaseType") === "redis"
                  ? "RedisDatabase"
                  : cell.getAttribute("DatabaseType") === "postgres"
                  ? "PostgresDatabase"
                  : cell.getAttribute("DatabaseType") === "cassandra"
                  ? "CassandraDatabase"
                  : cell.getAttribute("DatabaseType") === "kafka"
                  ? "KafkaTopicName"
                  : ""
              ) +
              "</div>" +
              "</div>"
            );
          }
        }
      };

      graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        return that.createPopupMenu(graph, menu, cell, evt);
      };

      graph.convertValueToString = function (cell) {
        if (mxUtils.isNode(cell.value) && cell.value.nodeName.toLowerCase() === "taskobject") {
          if (!cell.getAttribute("custom_api")) {
            if (cell.getAttribute("EndpointId")) {
              that.highlightcell(cell).then((response) => {
                cell.value.setAttribute("Conflict", response);
              });
            }
          }

          let CreateCell = new NewCell();
          let CreatedCell = CreateCell.NewCell(graph, cell);

          return CreatedCell;
        }
        return "";
      };
    };

    highlightcell = (cell) => {
      return new Promise((resolve, reject) => {
        const { graph } = this.state;
        const that = this;
        fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: `{
              endpoints(where:{id:"${cell.getAttribute("EndpointId")}"}){
                id
                conflict
                conflict_message
              }
            }`,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.data.endpoints[0].conflict) {
              var highlight = new mxCellHighlight(graph, "#ff7675", 2);
              highlight.highlight(graph.view.getState(cell));
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      });
    };

    createPopupMenu = (graph, menu, cell, evt, value) => {
      const that = this;
      if (cell) {
        if (cell.edge === true || cell.edge === 1) {
          menu.addItem("Delete Connection", null, function () {
            graph.removeCells([cell]);
            mxEvent.consume(evt);
            that.showNotification("error", "Connection Deleted");
          });
        } else {
          menu.addItem("Properties", null, function () {
            that.selectionChanged(graph, value);
          });
          menu.addItem("Delete", null, function () {
            graph.removeCells([cell]);
            mxEvent.consume(evt);
            that.showNotification("error", "Element Deleted");
          });
        }
      }
    };

    showNotification = (type, Massage) => {
      let Description = "";
      if (type === "error") {
        if (navigator.platform === "MacIntel") {
          Description = "Press Command + Z to Undo";
        } else {
          Description = "Press Control + Z to Undo";
        }
      }
      Notification[type]({
        placement: "bottomRight",
        title: Massage,
        description: Description,
      });
    };

    settingConnection = () => {
      const { graph } = this.state;
      mxConstraintHandler.prototype.intersects = function (icon, point, source, existingEdge) {
        return !source || existingEdge || mxUtils.intersects(icon.bounds, point);
      };

      var mxConnectionHandlerUpdateEdgeState = mxConnectionHandler.prototype.updateEdgeState;
      mxConnectionHandler.prototype.updateEdgeState = function (pt, constraint) {
        try {
          // if (ALLOW_EDGE) {
          if (pt !== null && this.previous !== null) {
            var constraints = this.graph.getAllConnectionConstraints(this.previous);
            var nearestConstraint = null;
            var dist = null;
            for (var i = 0; i < constraints.length; i++) {
              var cp = this.graph.getConnectionPoint(this.previous, constraints[i]);
              if (cp !== null) {
                var tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

                if (dist === null || tmp < dist) {
                  nearestConstraint = constraints[i];
                  dist = tmp;
                }
              }
            }
            if (nearestConstraint !== null) {
              this.sourceConstraint = nearestConstraint;
            }
          }
          mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
          // } else {
          //   this.reset();
          //   mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
          // }
        } catch (error) {}
      };
      if (graph.connectionHandler.connectImage === null) {
        graph.connectionHandler.isConnectableCell = function (cell) {
          return false;
        };
        mxEdgeHandler.prototype.isConnectableCell = function (cell) {
          return graph.connectionHandler.isConnectableCell(cell);
        };
      }

      graph.getAllConnectionConstraints = function (terminal) {
        if (terminal && this.model.isVertex(terminal.cell)) {
          // if (terminal.cell.value.getAttribute("Method") === "conditions") {
          // if (terminal.cell.hasOwnProperty("edges") && terminal.cell.edges.length > 1) {
          //   return null;
          // }
          return [
            new mxConnectionConstraint(new mxPoint(0.5, 0), true),
            new mxConnectionConstraint(new mxPoint(0, 0.5), true),
            new mxConnectionConstraint(new mxPoint(1, 0.5), true),
            new mxConnectionConstraint(new mxPoint(0.5, 1), true),
          ];
          // }

          return [new mxConnectionConstraint(new mxPoint(0.5, 0), true), new mxConnectionConstraint(new mxPoint(0.5, 1), true)];
        }
        return null;
      };
      // graph.connectionHandler.addListener(mxEvent.START, function(sender, evt) {
      //   let cell_id = evt.properties.state.cell.id;
      //   if (
      //     evt.properties.state.cell.hasOwnProperty("edges") &&
      //     evt.properties.state.cell.edges.length === 1 &&
      //     cell_id === evt.properties.state.cell.edges[0].source.id &&
      //     evt.properties.state.cell.value.getAttribute("Method") !== "conditions"
      //   ) {
      //     ALLOW_EDGE = false;
      //   } else {
      //     ALLOW_EDGE = true;
      //   }
      // });
      // graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt) {
      //   let cell_id = evt.properties.target.id;
      //   if (evt.properties.cell.target.edges.length === 1) {
      //     return;
      //   }
      //   if (cell_id === evt.properties.cell.target.edges[0].target.id) {
      //     graph.removeCells([evt.properties.cell]);
      //     // break
      //   }
      // });

      graph.setAllowDanglingEdges(false);
      graph.setDisconnectOnMove(false);

      // Connect preview
      graph.connectionHandler.createEdgeState = function (me) {
        var edge = graph.createEdge(null, null, "Edge", null, null, "edgeStyle=orthogonalEdgeStyle;strokeColor=#cccccc;strokeWidth=3;rounded=1");

        return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
      };
    };

    createDragElement = () => {
      const { graph } = this.state;
      const tasksDrag = ReactDOM.findDOMNode(this.refs.mxSidebar).querySelectorAll(".graph-left-panel-draggable-element");
      Array.prototype.slice.call(tasksDrag).forEach((ele) => {
        const value = ele.getAttribute("value");
        // console.log(value);

        let ds = mxUtils.makeDraggable(ele, this.graphF, (graph, evt, target, x, y) => this.funct(graph, evt, target, x, y, value), this.state.dragElt, null, null, graph.autoscroll, true);
        ds.isGuidesEnabled = function () {
          return graph.graphHandler.guidesEnabled;
        };
        ds.createDragElement = mxDragSource.prototype.createDragElement;
      });
    };

    graphF = (evt) => {
      const { graph } = this.state;
      var x = mxEvent.getClientX(evt);
      var y = mxEvent.getClientY(evt);
      var elt = document.elementFromPoint(x, y);
      if (mxUtils.isAncestorNode(graph.container, elt)) {
        return graph;
      }
      return null;
    };

    funct = (graph, evt, target, x, y, value) => {
      // console.log(value);

      var doc = mxUtils.createXmlDocument();
      var obj = doc.createElement("TaskObject");
      if (JSON.parse(value).EndpointPackId) {
        obj.setAttribute("EndpointPackId", JSON.parse(value).EndpointPackId);
      }
      if (JSON.parse(value).EndpointId) {
        obj.setAttribute("EndpointId", JSON.parse(value).EndpointId);
      }
      if (JSON.parse(value).Uri) {
        obj.setAttribute("Uri", JSON.parse(value).Uri);
      }
      obj.setAttribute("custom_api", JSON.parse(value).custom_api);
      obj.setAttribute("Method", JSON.parse(value).Method);
      obj.setAttribute("Title", "");
      obj.setAttribute("Type", JSON.parse(value).Type);
      var parent = graph.getDefaultParent();

      let cell = graph.insertVertex(parent, target, obj, x, y, 229, 67, "rounded=1;fillColor=#cccccc;strokeColor=none;");
      graph.setSelectionCell(cell);
      this.selectionChanged(graph, value);
    };

    selectionChanged = (graph, value) => {
      const cell = graph.getSelectionCell();
      if (cell && cell.value !== "Edge") {
        // console.log(cell);

        this.setState({
          sidebarModal: true,
          currentNode: cell,
          selectedCellData: cell.value.attributes,
        });
        if (cell.getAttribute("Type") === "api") {
          this.setState({ selectedPanel: "api" });
        } else if (cell.getAttribute("Type") === "controls") {
          this.setState({ selectedPanel: "controls" });
          const allCells = this.PostXMLorJSON("conditionCheck");
          const conditionChilds = [];
          for (const key of allCells[cell.id].children) {
            conditionChilds.push({
              id: allCells[key].id,
              name: allCells[key].properties.Title,
            });
          }
          this.setState({
            conditionChilds: conditionChilds,
          });
        } else if (cell.getAttribute("Type") === "source") {
          this.setState({ selectedPanel: "source" });
        }
      }
    };

    getKafkaOffset = async (details) => {
      return new Promise(async (resolve, reject) => {
        try {
          // get resgistered kafka config
          let get_kafkadb_id = await axios.get(`${constants.sourceregistration}/${details.KafkaSourceId}`);
          console.log(get_kafkadb_id);
          console.log(get_kafkadb_id.data.dbregistrations[0].id);
          console.log("url -->", `${constants.dbregistrations}/${get_kafkadb_id.data.dbregistrations[0].id}`);
          let get_source_details = await axios.get(`${constants.dbregistrations}/${get_kafkadb_id.data.dbregistrations[0].id}`);
          let body = { kafkaTopic: details.KafkaTopicName, ip: get_source_details.data.ip, port: get_source_details.data.port, username: "", password: "", database_type: "kafkaOoffsetcheck" };
          let get_offset = await axios.post(`${constants.kafkaoffset}`, body);
          resolve(get_offset.data.offset_value);
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    };

    handleConfirm = async (fields) => {
      console.log(fields.AceEditorValue);
      console.log(JSON.stringify(fields.AceEditorValue));

      const { graph } = this.state;
      const cell = graph.getSelectionCell();

      this.applyHandler(graph, cell, "Title", fields.Title);
      this.applyHandler(graph, cell, "Description", fields.Description);
      if (cell.getAttribute("Type") === "api") {
        if (cell.getAttribute("Method") !== "uitestcase") {
          this.applyHandler(graph, cell, "Method", fields.Method);
          this.applyHandler(graph, cell, "Host_url", fields.Host_url);
          this.applyHandler(graph, cell, "Uri", fields.Uri);
          this.applyHandler(graph, cell, "PathParametersAdd", JSON.stringify(fields.PathParametersAdd));
          this.applyHandler(graph, cell, "QueryParametersAdd", JSON.stringify(fields.QueryParametersAdd));
          this.applyHandler(graph, cell, "AuthorizationUsername", fields.AuthorizationUsername);
          this.applyHandler(graph, cell, "AuthorizationPassword", fields.AuthorizationPassword);
          this.applyHandler(graph, cell, "HeadersAdd", JSON.stringify(fields.HeadersAdd));
          this.applyHandler(graph, cell, "BodySelectedMenu", fields.BodySelectedMenu);
          this.applyHandler(graph, cell, "BodyFormDataAdd", JSON.stringify(fields.BodyFormDataAdd));
          this.applyHandler(graph, cell, "AceEditorValue", JSON.stringify(fields.AceEditorValue));
        } else {
          this.applyHandler(graph, cell, "UiTestcase", fields.UiTestcase);
          this.applyHandler(graph, cell, "UiTestcaseName", fields.UiTestcaseName);
        }
      } else if (cell.getAttribute("Type") === "controls") {
        if (cell.getAttribute("Method") === "conditions") {
          this.applyHandler(graph, cell, "ConditionsAdd", JSON.stringify(fields.ConditionsAdd));
          this.applyHandler(graph, cell, "ConditionsParse", JSON.stringify(fields.ConditionsParse));
        } else if (cell.getAttribute("Method") === "iterator") {
          this.applyHandler(graph, cell, "ExecutionMode", fields.ExecutionMode);
        } else if (cell.getAttribute("Method") === "assertion") {
          this.applyHandler(graph, cell, "AssertionParse", JSON.stringify(fields.AssertionParse));
          this.applyHandler(graph, cell, "AssertionAdd", JSON.stringify(fields.AssertionAdd));
        } else if (cell.getAttribute("Method") === "variable") {
          this.applyHandler(graph, cell, "VariableAdd", JSON.stringify(fields.VariableAdd));
        }
      } else if (cell.getAttribute("Type") === "source") {
        // let latestOffset = 0;
        // if (fields.KafkaType === "sub") {
        //   //   // GET CURRENT OFFSET FOR KAFKA TOPIC
        //   let get_offset = await this.getKafkaOffset(fields.KafkaSourceId);
        //   console.log("get_source_details ----", get_offset);
        //   latestOffset = get_offset;
        // }
        // console.log("Consumer current offset: " + latestOffset);
        // this.applyHandler(graph, cell, "offsetValue", latestOffset);
        this.applyHandler(graph, cell, "AceEditorValue", JSON.stringify(fields.AceEditorValue));
        this.applyHandler(graph, cell, "DatabaseType", fields.DatabaseType);
        this.applyHandler(graph, cell, "OracleSourceId", fields.OracleSourceId);
        this.applyHandler(graph, cell, "OracleDatabase", fields.OracleDatabase);
        this.applyHandler(graph, cell, "RabbitmqSourceId", fields.RabbitmqSourceId);
        this.applyHandler(graph, cell, "KafkaSourceId", fields.KafkaSourceId);
        this.applyHandler(graph, cell, "ServerIp", fields.ServerIp);
        this.applyHandler(graph, cell, "SshPort", fields.SshPort);
        this.applyHandler(graph, cell, "pem_file_url", fields.pem_file_url);
        this.applyHandler(graph, cell, "uploadedFileName", fields.uploadedFileName);
        this.applyHandler(graph, cell, "ServerUsername", fields.ServerUsername);
        this.applyHandler(graph, cell, "ServerPassword", fields.ServerPassword);
        this.applyHandler(graph, cell, "ShellCommand", fields.ShellCommand);
        this.applyHandler(graph, cell, "ShellCommand", fields.ShellCommand);
        this.applyHandler(graph, cell, "RabbitmqQueueName", fields.RabbitmqQueueName);
        this.applyHandler(graph, cell, "KafkaTopicName", fields.KafkaTopicName);
        this.applyHandler(graph, cell, "RabbitmqType", fields.RabbitmqType);
        this.applyHandler(graph, cell, "KafkaType", fields.KafkaType);
        this.applyHandler(graph, cell, "kafkaValidation", fields.kafkaValidation);
        this.applyHandler(graph, cell, "KafkaWaitingTime", fields.KafkaWaitingTime);
        this.applyHandler(graph, cell, "PollingInterval", fields.PollingInterval);
        this.applyHandler(graph, cell, "ExpectedIncrement", fields.ExpectedIncrement);
        this.applyHandler(graph, cell, "rmqData", fields.AceEditorValue);
        this.applyHandler(graph, cell, "ExpectedKafkaReponse", fields.ExpectedKafkaReponse);
        this.applyHandler(graph, cell, "publishDataSelected", fields.publishDataSelected);

        this.applyHandler(graph, cell, "MysqlSourceId", fields.MysqlSourceId);
        this.applyHandler(graph, cell, "MysqlDatabase", fields.MysqlDatabase);
        this.applyHandler(graph, cell, "MssqlSourceId", fields.MssqlSourceId);
        this.applyHandler(graph, cell, "MssqlDatabase", fields.MssqlDatabase);
        this.applyHandler(graph, cell, "MongoSourceId", fields.MongoSourceId);
        this.applyHandler(graph, cell, "MongoDatabase", fields.MongoDatabase);
        this.applyHandler(graph, cell, "PostgresDatabase", fields.PostgresDatabase);
        this.applyHandler(graph, cell, "CassandraDatabase", fields.CassandraDatabase);
        this.applyHandler(graph, cell, "KafkaTopicName", fields.KafkaTopicName);
        this.applyHandler(graph, cell, "PostgresSourceId", fields.PostgresSourceId);
        this.applyHandler(graph, cell, "CassandraSourceId", fields.CassandraSourceId);

        this.applyHandler(graph, cell, "RedisSourceId", fields.RedisSourceId);
        this.applyHandler(graph, cell, "RedisDatabase", fields.RedisDatabase);
        this.applyHandler(graph, cell, "QueryType", fields.QueryType);
        this.applyHandler(graph, cell, "OracleQueryTemplate", fields.OracleQueryTemplate);
        this.applyHandler(graph, cell, "RabbimqQueryTemplate", fields.RabbimqQueryTemplate);
        this.applyHandler(graph, cell, "MysqlQueryTemplate", fields.MysqlQueryTemplate);
        this.applyHandler(graph, cell, "PostgresQueryTemplate", fields.PostgresQueryTemplate);
        this.applyHandler(graph, cell, "CassandraQueryTemplate", fields.CassandraQueryTemplate);
        this.applyHandler(graph, cell, "MssqlQueryTemplate", fields.MssqlQueryTemplate);
        this.applyHandler(graph, cell, "MongoQueryTemplate", fields.MongoQueryTemplate);
        this.applyHandler(graph, cell, "RedisQueryTemplate", fields.RedisQueryTemplate);
        this.applyHandler(graph, cell, "WrittenQuery", fields.WrittenQuery);
      }

      this.setState({ sidebarModal: false });
    };

    applyHandler = (graph, cell, name, newValue) => {
      console.log("apply handler ----->", newValue);
      graph.getModel().beginUpdate();
      try {
        const edit = new mxCellAttributeChange(cell, name, newValue);
        graph.getModel().execute(edit);
      } finally {
        graph.getModel().endUpdate();
      }
    };

    NamedNodeToJSON = (attributes) => {
      let respJson = {};
      for (let i = 0; i < attributes.length; i++) {
        let attr = attributes[i];
        try {
          respJson[attr.name] = JSON.parse(attr.value);
        } catch (error) {
          respJson[attr.name] = attr.value;
        }
      }

      // Converting array to JSON
      if (respJson.Type === "api" && respJson.Method !== "uitestcase") {
        const BodyFormDataAdd = {};
        const HeadersAdd = {};
        const PathParametersAdd = {};
        const QueryParametersAdd = {};
        // Add automatic header depends on body type
        if (respJson.BodySelectedMenu === "FormData") {
          if (respJson.BodyFormDataAdd.length > 0) {
            HeadersAdd["Content-Type"] = "form/url-encoded";
            respJson.BodyFormDataAdd.map((data) => {
              if (data.BodyFormDataType === "File") {
                HeadersAdd["Content-Type"] = "multipart/form-data";
              }
            });
          }
        }
        if (respJson.AceEditorValue && respJson.AceEditorValue.length > 0) {
          if (respJson.BodySelectedMenu === "XML") {
            HeadersAdd["Content-Type"] = "application/xml";
          } else if (respJson.BodySelectedMenu === "JSON") {
            HeadersAdd["Content-Type"] = "application/json";
            respJson.AceEditorValue = JSON.parse(respJson.AceEditorValue);
          }
        }

        for (const data of respJson.BodyFormDataAdd) {
          BodyFormDataAdd[data.BodyFormDataKey] = data.BodyFormDataValue;
        }

        for (const data of respJson.HeadersAdd) {
          HeadersAdd[data.HeadersKey] = data.HeadersValue;
        }

        for (const data of respJson.PathParametersAdd) {
          PathParametersAdd[data.PathParametersKey] = data.PathParametersValue;
        }

        for (const data of respJson.QueryParametersAdd) {
          QueryParametersAdd[data.QueryParametersKey] = data.QueryParametersValue;
        }

        respJson.BodyFormDataAdd = BodyFormDataAdd;
        respJson.HeadersAdd = HeadersAdd;
        respJson.PathParametersAdd = PathParametersAdd;
        respJson.QueryParametersAdd = QueryParametersAdd;
      }

      return respJson;
    };

    PostXMLorJSON = async (purpose) => {
      console.log("purpose --->", purpose);
      const { graph } = this.state;
      let allCells = {};
      for (const cell of graph.getChildVertices(graph.getDefaultParent())) {
        let tmpCell = { children: [], parent: [] };
        tmpCell.id = cell.id;
        if (cell.edges) {
          for (const edge of cell.edges) {
            if (edge.source.id === tmpCell.id) {
              //Outgoing link. This id will be child if available
              if (edge.target) {
                tmpCell.children.push(edge.target.id);
              }
            } else {
              //Incoming link.
              tmpCell.parent.push(edge.source.id);
            }
          }
        }
        if (tmpCell.parent.length === 0) {
          allCells.root = cell.id;
        }
        try {
          tmpCell.properties = this.NamedNodeToJSON(cell.value.attributes);
          allCells[tmpCell.id] = tmpCell;
        } catch (error) {
          Alert.error("Something went wrong");
          console.log(error);
        }
      }

      // console.log("api cells --->", allCells);

      if (purpose === "graphSave" || purpose === "graphRun") {
        let endpointids = [];
        for (const key of Object.keys(allCells)) {
          if (typeof allCells[key] === "object") {
            if (allCells[key].id === allCells.root && allCells[key].children.length <= 0) {
              return Alert.warning("Don't allow elements without children!");
            } else if (allCells[key].id !== allCells.root && allCells[key].parent.length <= 0) {
              return Alert.warning("Don't allow elements without parent!");
            } else if ((allCells[key].children.length > 1 || allCells[key].parent.length > 1) && allCells[key]["properties"]["Method"] !== "conditions") {
              return Alert.warning("Don't allow multiple parent or children to one component!");
            }
          }

          if (typeof allCells[key] === "object" && allCells[key]["properties"]["Type"] === "controls") {
            if (allCells[key]["properties"]["Method"] === "conditions") {
              for (const key of allCells[key]["properties"]["ConditionsParse"]) {
                if (!key.selected_condition_id) {
                  return Alert.warning("Condition must have path, Where it's true!");
                }
              }
            }
          }

          // ---------------CUSTOM APIS REGISTER ENDPOINS_ID & ENDPOINTSPACK_ID -------------------------
          if (typeof allCells[key] === "object" && allCells[key]["properties"]["Type"] === "api" && allCells[key]["properties"]["Method"] !== "uitestcase") {
            //  console.log(typeof allCells[key]["properties"]["custom_api"]);
            if (allCells[key]["properties"]["custom_api"]) {
              // check if entry exist
              let getEndpointsPack = await axios.get(constants.endpointpacks);
              // let endpoints = await axios.get(constants.endpoints);
              // console.log(endpoints);

              let pack_id_found = false;
              let pack_id = null;
              let endpoint_id_found = false;
              let endpoint_id = null;
              // debugger
              for (const pack of getEndpointsPack.data) {
                if (allCells[key]["properties"]["Host_url"] === pack["host_url"] && parseInt(window.location.pathname.split("/")[2]) === pack["application"]["id"]) {
                  pack_id = pack["id"];
                  pack_id_found = true;

                  for (const endpoint of pack["endpoints"]) {
                    if (endpoint["endpoint"] === allCells[key]["properties"]["Uri"] && endpoint["method"] === allCells[key]["properties"]["Method"]) {
                      endpoint_id = endpoint["id"];
                      endpoint_id_found = true;
                      break;
                    }
                  }
                  break;
                }
              }

              if (!pack_id_found || pack_id === null) {
                // entry in endpointpack
                let body = {
                  name: "custom_api",
                  upload_type: "custom",
                  host_url: allCells[key]["properties"]["Host_url"],
                  application: window.location.pathname.split("/")[2],
                };
                const post_endpointpack = await axios.post(`${constants.endpointpacks}`, body);
                pack_id = post_endpointpack.data.id;
              }
              let endpoint_uri = allCells[key]["properties"]["Uri"];
              // if (allCells[key]["properties"]["Uri"] === allCells[key]["properties"]["Host_url"]) {
              //   endpoint_uri = "/";
              // }
              if (!endpoint_id_found || endpoint_id === null) {
                // entry in endpoints
                let endpoint_body = {
                  method: allCells[key]["properties"]["Method"],
                  // endpoint: allCells[key]["properties"]["Uri"],
                  endpoint: endpoint_uri,
                  endpointpack: pack_id,
                  responses: null,
                  tags: null,
                  consumes: null,
                  produces: null,
                  parameters: null,
                };
                const post_endpoint = await axios.post(constants.endpoints, endpoint_body);
                endpoint_id = post_endpoint.data.id;
              }

              // update allcell flow object
              allCells[key]["properties"]["EndpointPackId"] = pack_id;
              allCells[key]["properties"]["EndpointId"] = endpoint_id;
              endpointids.push(endpoint_id);
              // -------------------------------------REGISTERED-------------------
            } else {
              endpointids.push(allCells[key]["properties"]["EndpointId"]);
            }

            // --------------------

            if (allCells[key]["properties"]["Conflict"]) {
              if (!this.state.conflictconfirmation) {
                return this.setState({ conflictconfirmation: true });
              } else {
                this.setState({ conflictconfirmation: false });
              }
            }
          }
          console.log("type of allcells", typeof allCells[key]);
          if (typeof allCells[key] === "object") {
            console.log(allCells[key]["properties"]["Method"]);
          }
          // console.log("methods ---->", typeof allCells[key]);
          if (typeof allCells[key] === "object" && allCells[key]["properties"]["Method"] === "uitestcase") {
            console.log("testcases --->");
            allCells[key]["properties"]["Type"] = "testcase";
          }
        }
        console.log("allCells ---->", allCells);
        this.graphSave(allCells, purpose, endpointids);
      }
      return allCells;
    };

    findnode = (allCells, node_name) => {
      for (const key in allCells) {
        if (allCells[key].hasOwnProperty("properties")) {
          if (allCells[key]["properties"]["Title"] == node_name && allCells[key]["properties"]["Type"] == "api") {
            return {
              id: allCells[key]["properties"]["EndpointId"],
              name: allCells[key]["properties"]["Uri"],
              method: allCells[key]["properties"]["Method"],
            };
          }
        }
      }
      return null;
    };

    capturegroups = async (connect) => {
      const pattern = /\{\{(\w+)\.(\w+)\.?(.*?)\}\}/gim;
      let test = pattern.exec(connect);
      return test;
    };

    PostRelationGraph = async (allCells) => {
      const pattern = /\{\{(\w+)\.(\w+)\.?(.*?)\}\}/gim;
      let nodes = [];
      let edges = [];
      let relationgraph = {
        graph: {},
      };
      for (const key in allCells) {
        if (allCells[key].hasOwnProperty("properties")) {
          let properties = allCells[key]["properties"];
          let node_data = {
            id: allCells[key]["properties"]["EndpointId"] ? allCells[key]["properties"]["EndpointId"] : allCells[key]["id"],
            label: properties["Uri"] || properties["Title"],
            title: properties["Description"],
            node_id: allCells[key]["id"],
            method: allCells[key]["properties"]["Method"] ? allCells[key]["properties"]["Method"] : "",
            // image: url,
            // shape: "image",
            connections: [],
          };
          for (const prop_key in properties) {
            if (properties.hasOwnProperty(prop_key)) {
              const data = properties[prop_key];
              const connections = JSON.stringify(data).match(pattern) || [];
              for await (const connect of connections) {
                // const connect = connections[key]
                let connection_data = {
                  node_name: "",
                  node_request: "",
                  datakey: "",
                };
                const capturedgroups = await this.capturegroups(connect);
                if (capturedgroups !== undefined && capturedgroups !== null) {
                  connection_data["node_name"] = capturedgroups[1];
                  connection_data["node_request"] = capturedgroups[2];
                  connection_data["datakey"] = capturedgroups[3];
                  node_data.connections.push(connection_data);
                }
              }
            }
          }
          properties.hasOwnProperty("EndpointId") ? nodes.push(node_data) : "";
        }
      }
      // const api_nodes = []

      for (const node of nodes) {
        if (node.connections.length > 0) {
          for (const connection of node.connections) {
            let edge = {
              source: node.id,
              source_label: node.label,
              source_method: node.method,
              destination_method: "",
              destination: "",
              destination_label: "",
              node_request: "",
              data_key: "",
              node_name: "",
              application: this.props.location.pathname.split("/")[2],
            };
            if (connection.node_name == "parent") {
              if (allCells[node.node_id].parent[0] && allCells[allCells[node.node_id].parent[0]].properties.Type == "api") {
                edge.destination = allCells[allCells[node.node_id].parent[0]].properties.EndpointId;
                edge.node_request = connection.node_request;
                edge.node_name = connection.node_name;
                edge.data_key = connection.datakey;
                edge.destination_label = allCells[allCells[node.node_id].parent[0]].properties.Uri;
                edge.destination_method = allCells[allCells[node.node_id].parent[0]].properties.Method;
                edges.push(edge);
              }
            } else {
              let refparent = this.findnode(allCells, connection.node_name);

              if (refparent) {
                edge.destination = refparent.id;
                edge.node_request = connection.node_request;
                edge.node_name = connection.node_name;
                edge.data_key = connection.datakey;
                edge.destination_label = refparent.name;
                edge.destination_method = refparent.method;
                edges.push(edge);
              }
            }
          }
        }
      }
      for (let index = 1; index < edges.length; index++) {
        const edge = edges[index];
      }
      const options = {
        layout: {
          hierarchical: false,
        },
        edges: {
          color: "#000000",
        },
        height: "500px",
      };
      const events = {
        select: function (event) {
          var { nodes, edges } = event;
        },
      };
      const flags = new Set();
      const unique_nodes = nodes.filter((node) => {
        if (flags.has(node.id)) {
          return false;
        }
        flags.add(node.id);
        return true;
      });
      relationgraph.graph["nodes"] = unique_nodes;
      const unique_edges = [...new Set(edges.map((item) => item))];
      relationgraph.graph["edges"] = unique_edges;
      relationgraph["options"] = options;
      relationgraph["events"] = events;
      let relbodyData = {
        edges: unique_edges,
      };
      axios
        .post(constants.relationgraph + "/creates", relbodyData)
        .then((response) => {})
        .catch(function (error) {
          Alert.error("Something went wrong");
          console.log(error);
        });

      return relationgraph;
    };

    graphSave = async (allCells, purpose, endpointids) => {
      this.setState({ loader: true });

      // get relation data and store in db
      let relationgraph = await this.PostRelationGraph(allCells);

      const { graph } = this.state;
      const encoder = new mxCodec();
      let getXML = encoder.encode(graph.getModel());
      //Get all graph XML
      let graphXML = mxUtils.getXml(getXML);

      console.log("allcells --->", allCells);
      for (const prop in allCells) {
        if (allCells[prop].hasOwnProperty("properties")) {
          if (allCells[prop]["properties"]["KafkaType"]) {
            let current_offset = 0;
            if (allCells[prop]["properties"]["KafkaType"] === "sub") {
              //   // GET CURRENT OFFSET FOR KAFKA TOPIC
              let get_source_details = {
                KafkaTopicName: allCells[prop]["properties"]["KafkaTopicName"],
                KafkaSourceId: allCells[prop]["properties"]["KafkaSourceId"],
              };
              current_offset = await this.getKafkaOffset(get_source_details);
              console.log("get_source_details ----", current_offset);
              // latestOffset = get_offset;
              allCells[prop]["properties"]["offsetValue"] = current_offset;
            }
          }
        }
      }

      // let latestOffset = 0;
      // if (fields.KafkaType === "sub") {
      //   //   // GET CURRENT OFFSET FOR KAFKA TOPIC
      //   let get_offset = await this.getKafkaOffset(fields.KafkaSourceId);
      //   console.log("get_source_details ----", get_offset);
      //   latestOffset = get_offset;
      // }

      if (this.state.graphId === "") {
        const that = this;
        let bodyData = {
          graph_json: allCells,
          graph_xml: graphXML,
          endpoints: endpointids,
          testcase: this.props.location.pathname.split("/")[5],
        };
        axios
          .post(constants.flows, bodyData)
          .then((response) => {
            that.setState({ graphId: response.data.id, loader: false });
            if (purpose === "graphSave") {
              Alert.success("Layout saved successfully.");
            }
          })
          .catch(function (error) {
            Alert.error("Something went wrong");
            console.log(error);
          });
      } else {
        let bodyData = {
          graph_json: allCells,
          graph_xml: graphXML,
          endpoints: endpointids,
        };
        axios
          .put(constants.flows + `/${this.state.graphId}`, bodyData)
          .then((response) => {
            this.setState({ loader: false });
            // this.setState({ loader: false,relationgraph: relationgraph,relvisible:true });
            if (purpose === "graphSave") {
              Alert.success("Layout updated successfully.");
            }
          })
          .catch(function (error) {
            Alert.error("Something went wrong");
            console.log(error);
          });
      }

      if (purpose === "graphRun") {
        //Disable graph movement

        // call modal

        mxGraphHandler.prototype.moveEnabled = false;
        this.RemoveDynamicClass();

        fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: `{applications(where: { id: "${window.location.pathname.split("/")[2]}" }) {
            testsuites(where: { suite_name: "default" }) {
              testsessionexecutions {
                id
              }
            }
          }}`,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            const apiExecuteBody = {
              id: this.state.graphId,
              testsessionid: response.data.applications[0].testsuites[0].testsessionexecutions[0].id,
              testcaseid: window.location.pathname.split("/")[5],
              environment_id: this.state.selected_environment,
            };

            axios
              .post(constants.apiexecutehost, apiExecuteBody)
              .then((response) => {
                this.setState({
                  executionLogs: {},
                  loader: false,
                });
                Alert.success("Layout Execution started.");
              })
              .catch(function (error) {
                Alert.error("Something went wrong");
                console.log(error);
              });
          })
          .catch((error) => {
            Alert.error("Something went wrong");
            console.log(error);
          });
      }
    };

    RemoveDynamicClass = () => {
      let successfull = document.getElementsByClassName("layout-execution-successfull");
      while (successfull.length) successfull[0].className = successfull[0].className.replace(/\blayout-execution-successfull\b/g, "");
      let fail = document.getElementsByClassName("layout-execution-fail");
      while (fail.length) fail[0].className = fail[0].className.replace(/\blayout-execution-fail\b/g, "");
    };

    handleCancel = () => {
      this.setState({ sidebarModal: false, conditionChilds: [] });
      const { graph } = this.state;
      const cell = graph.getSelectionCell();
      if (cell && cell.value.attributes.Title.value === "") {
        graph.removeCells([this.state.currentNode]);
      }
    };

    RenderSidebar = () => {
      if (this.state.selectedPanel === "api") {
        return <ApiSidebar selectedCellData={this.state.selectedCellData} visible={this.state.sidebarModal} handleCancel={this.handleCancel} handleConfirm={this.handleConfirm} />;
      } else if (this.state.selectedPanel === "controls") {
        return (
          <ControlSidebar
            selectedCellData={this.state.selectedCellData}
            conditionChilds={this.state.conditionChilds}
            visible={this.state.sidebarModal}
            handleCancel={this.handleCancel}
            handleConfirm={this.handleConfirm}
          />
        );
      } else if (this.state.selectedPanel === "source") {
        return (
          <SourceSidebar
            selectedCellData={this.state.selectedCellData}
            visible={this.state.sidebarModal}
            handleCancel={this.handleCancel}
            handleConfirm={this.handleConfirm}
            loader={() => this.setState({ loader: !this.state.loader })}
          />
        );
      } else if (this.state.selectedPanel === "logs") {
        return (
          <LogsSidebar
            visible={this.state.sidebarModal}
            handleCancel={this.handleCancel}
            handleConfirm={this.handleConfirm}
            logs={this.state.executionLogs}
            clearLogs={() => this.setState({ executionLogs: {}, sidebarModal: false }, () => this.RemoveDynamicClass())}
          />
        );
      }
    };

    logout = () => {
      sessionStorage.clear();
      Alert.success("Logout successfully, Goodbye!");
    };

    selectEnvironment = () => {
      this.setState({ visible: true });
    };

    handleSave = () => {
      if (this.state.selected_environment === "") {
        this.setState({ select_env_err: true });
        Alert.warning("please select environment!");
        return;
      }
      this.setState({ visible: false });
      this.PostXMLorJSON("graphRun");
    };

    handleModalCancel = () => {
      this.setState({
        visible: false,
        relvisible: false,
        relationgraph: {},
        conflictconfirmation: false,
      });
    };

    handleChange = (e) => {
      this.setState({
        selected_environment: e.target.value,
        select_env_err: false,
      });
    };

    setrelationgraph = () => {
      return (
        <Modal title="Basic Modal" show={this.state.relvisible} onHide={this.handleModalCancel} className="config-modal">
          <Modal.Header>
            <Modal.Title>Relationship Graph</Modal.Title>
          </Modal.Header>
          <Modal.Body className="source-from">
            <Graph
              graph={this.state.relationgraph.graph}
              options={this.state.relationgraph.options}
              events={this.state.relationgraph.events}
              // getNetwork={network => {
              //   //  if you want access to vis.js network api you can set the state in a parent component using this property
              // }}
            />
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      );
    };

    conflictConfirmation = () => {
      return (
        <Modal show={this.state.conflictconfirmation} onHide={this.handleModalCancel} className="cconflict-modal">
          <Modal.Body className="cconflict-modal-body">
            <div className="cconflict-modal-body-container">
              <Icon
                icon="remind"
                style={{
                  color: "#ff6b6b",
                  fontSize: 24,
                }}
              />
              <div className="cconflict-modal-body-text">
                There are Endpoints with Conflict <br />
                Are you sure, You want to Save?
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleModalCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={() => this.PostXMLorJSON("graphSave")} className="positive-button">
                <i className="fa fa-check" />
                Save
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    };

    setEnvironment = () => {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal title="Basic Modal" show={this.state.visible} onHide={this.handleModalCancel} className="config-modal">
          <Modal.Header>
            <Modal.Title>Select Environment</Modal.Title>
          </Modal.Header>
          <Modal.Body className="source-from">
            <Form layout="vertical">
              <Form.Item label="Environment">
                {getFieldDecorator("environment", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your environment!",
                    },
                  ],
                })(
                  <select className={this.state.select_env_err ? "select-env-err select-env" : "select-env"} onChange={this.handleChange}>
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="sr-form-footer-btn-container">
              <div onClick={this.handleModalCancel} className="negative-button">
                <i className="fa fa-close" /> Cancel
              </div>
              <div onClick={this.handleSave} className="positive-button">
                <i className="fa fa-check" />
                Run
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      );
    };

    render() {
      // console.log("graph object ----->", this.state.graph);
      return (
        <React.Fragment>
          <div className="main-container animated fadeIn">
            <div className="graph-left-panel-container">
              <div className="dashboard-header-logo-container">
                <Link to="/" className="dashboard-header-logo" />
                <div className="dashboard-header-name-version-container">
                  {/* <div className="dashboard-header-name">
                    <span>AI</span> Tester
                  </div>
                  <div className="dashboard-header-version">v 1.0</div> */}
                </div>
              </div>
              <div ref="mxSidebar" className="graph-left-panel">
                <LeftPanelElements createDragElement={this.createDragElement} parentProps={this.props.location.pathname} selectedPanel={(e) => this.setState({ selectedPanel: e })} />
              </div>
              <div className="dashboard-sidebar-profile-container">
                <div
                  className="header-profile-container"
                  onMouseEnter={() => this.setState({ profileContainer: true })}
                  onClick={() =>
                    this.setState({
                      profileContainer: !this.state.profileContainer,
                    })
                  }
                >
                  <img
                    src={sessionStorage.getItem("profile") ? sessionStorage.getItem("profile") : "http://www.haverhill-ps.org/wp-content/uploads/sites/12/2013/11/user.png"}
                    width="100%"
                    height="100%"
                  />
                </div>
                <div className="dashboard-sidebar-profile-name">{`Hi, ${sessionStorage.getItem("username")}`}</div>
                <Link to="/profile" className="dashboard-sidebar-profile-btn">
                  <i className="fa fa-gear" />
                </Link>
              </div>
              <div
                onMouseLeave={() => this.setState({ profileContainer: false })}
                className={"hover-header-profile-container animated fadeIn " + (this.state.profileContainer ? " hidden-hover-header-profile-container" : "")}
              >
                <div className="hover-header-profile-body">
                  <Link to="/profile" className="hover-header-profile-body-row">
                    My Profile
                  </Link>
                  <Link to="/login" onClick={() => this.logout()} className="hover-header-profile-body-row">
                    Logout
                  </Link>
                </div>
                <div className="header-border" />
                <div className="hover-header-profile-header">
                  <div className="hover-header-profile-header-name">{`Hi, ${sessionStorage.getItem("username")}`}</div>
                  <div className="hover-header-profile-header-profile">
                    <img
                      src={sessionStorage.getItem("profile") ? sessionStorage.getItem("profile") : "http://www.haverhill-ps.org/wp-content/uploads/sites/12/2013/11/user.png"}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="body-container" style={{ overflow: "hidden", height: "100vh" }}>
              <div className="filter-panel-container">
                <div className="breadcrumbs-container">
                  <i className="fa fa-map-marker" />
                  <Link to="/">APPLICATIONS</Link>
                  <div className="breadcrumbs-items">{this.state.createdGraphData.name ? ">" : ""}</div>
                  <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/test-cases`} className="breadcrumbs-items">
                    {this.state.createdGraphData.name}
                  </Link>
                  <div className="breadcrumbs-items">{this.state.createdGraphData.name ? ">" : ""}</div>
                  <div className="breadcrumbs-items">{this.state.createdGraphData.testcases ? this.state.createdGraphData.testcases[0].name : ""}</div>
                </div>
                <div className="filter-panel-right-part">
                  <div
                    onClick={() =>
                      this.setState({
                        sidebarModal: true,
                        selectedPanel: "logs",
                      })
                    }
                    className="negative-button animated zoomIn faster"
                    style={{ marginRight: "10px" }}
                  >
                    <i className="fa fa-file-text" />
                    Logs
                  </div>
                  {this.state.apiExecuteStatus === "inProgress" ? (
                    <div className="negative-button animated fadeIn">
                      <i className="fas fa-sync fa-spin" />
                      Executing
                    </div>
                  ) : (
                    <div
                      // onClick={() => this.PostXMLorJSON("graphRun")}
                      onClick={() => this.selectEnvironment()}
                      className="negative-button animated zoomIn faster"
                    >
                      <i className="fa fa-play" />
                      Run
                    </div>
                  )}
                  <div onClick={() => this.PostXMLorJSON("graphSave")} className="positive-button">
                    <i className="fa fa-save" />
                    Save
                  </div>
                </div>
              </div>
              <div className="graph-board">
                <div className="graph-board-container" ref="divGraph" />
                <Toolsbar setGraphSetting={this.setGraphSetting} />
              </div>
            </div>
            {this.RenderSidebar()}
          </div>
          <Loader status={this.state.loader} />
          {this.setEnvironment()}
          {this.setrelationgraph()}
          {this.conflictConfirmation()}
        </React.Fragment>
      );
    }
  }
);

export default TestcaseApi;
