import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/DataSources.scss";
import AddDataSources from "../../../Components/AddDataSources";
import AddEnvironmentConfiguration from "../../../Components/AddEnvironmentConfiguration";
import { Alert, Tooltip, Whisper, Grid, Row, Col } from "rsuite";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import Loader from "../../../Components/Loader";
import { Table, Divider, Modal, Button } from "antd";
import constants from "../../../constants";
import { Link } from "react-router-dom";
import axios from "axios";
import ReactDOMServer from "react-dom/server";
import ReactHtmlParser from "react-html-parser";

const { confirm } = Modal;

export default class DataSources extends React.Component {
  constructor(props) {
    super(props);
    this.addConfigurationRef = React.createRef();
    this.state = {
      sourcesData: [],
      table_sourcesData: [],
      deleteConfirmation: false,
      ModalOpen: false,
      ConfigModalOpen: false,
      DatabaseType: "oracle",
      loader: false,
      UpdateRequestData: {},
      SelectedDatabaseBtn: "oracle",
      searchText: "",
      sourceId: "",
      opened_record: {},
      Selected_row: "",
      html: null,
      expandedRowKeys: [],
      Environments_list: [],
      database_type: "",
      EditConfigurationData: {},
      deletion_type: "",
      deletion_id: "",
      record_expanded_src: {},
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

  onExpandedRowsChange = (rows) => {
    let current_row = rows.reverse();

    this.setState({
      expandedRowKeys: [current_row[0]],
    });
  };

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      window.scrollTo(0, 0);
      this.getSourceRegistrations();
      this.getSourceRegistrationsDetails();
      this.getEnvironments();
    } else {
      this.props.history.push("/login");
    }
  }

  getEnvironments = () => {
    let _this = this;
    axios.get(constants.environments).then((environment) => {
      let list = [];
      if (environment["status"] === 200) {
        for (let env of environment["data"]) {
          list.push({ id: env["id"], environment: env["type"] });
        }
        if (list.length > 0) {
          this.setState({ Environments_list: list });
        }
      }
    });
  };

  getSourceRegistrations = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{dbregistrations(where:{database_type:"${this.state.SelectedDatabaseBtn}"}){id,source_name,ip,port,username,database,queue_name,}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          loader: false,
          sourcesData: response.data.dbregistrations,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
      });
  };

  getSourceRegistrationsDetails = () => {
    this.setState({ loader: true });
    axios.get(`${constants.application}/${window.location.pathname.split("/")[2]}`).then((response) => {
      let results = [];
      // debugger
      for (let i in response.data.sourceregistrations) {
        if (this.state.SelectedDatabaseBtn === response.data.sourceregistrations[i]["type"])
          results.push({
            key: i,
            id: response.data.sourceregistrations[i]["id"],
            source_name: response.data.sourceregistrations[i]["name"],
            type: response.data.sourceregistrations[i]["type"],
            description: response.data.sourceregistrations[i]["description"],
          });
      }

      this.setState({ table_sourcesData: results, loader: false });
    });
  };

  sourceEdit = (id) => {
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{dbregistrations(where:{id:"${id}"}){id,source_name,ip,port,username,password,database,queue_name,database_type}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          UpdateRequestData: response.data.dbregistrations[0],
          DatabaseType: response.data.dbregistrations[0].database_type,
          ModalOpen: true,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
      });
  };

  sourceDelete = () => {
    this.setState({ loader: true });

    if (this.state.deletion_type === "delete-source") {
      // getting all register DBs in this source
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `query{
              sourceregistration(id:${this.state.deletion_id}){
                dbregistrations{
                  id
                }
              }
            }`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          for (let db of response.data.sourceregistration.dbregistrations) {
            //  delete all DBs inside this source
            axios.delete(`${constants.dbregistrations}/${db["id"]}`);
          }
          //  delete source
          axios.delete(`${constants.sourceregistration}/${this.state.deletion_id}`);
          let _this = this;
          setTimeout(function () {
            _this.getSourceRegistrationsDetails();
            _this.setState({ deleteConfirmation: false, loader: false });
            Alert.success("Successfully deleted!");
          }, 1000);
        });
    } else if (this.state.deletion_type === "delete-envConfiguration") {
      let _this = this;
      // delete this DB
      axios.delete(`${constants.dbregistrations}/${this.state.deletion_id}`);

      // update rows after deletion
      // settimeout used to fetch updated data from DB, as it takes some time to update database
      setTimeout(function () {
        _this.renderSubTable(_this.state.record_expanded_src["expanded"], _this.state.record_expanded_src["record"]);
        _this.setState({ loader: false });
        Alert.success("Successfully deleted!");
      }, 1000);

      this.setState({ deleteConfirmation: false });
    }
  };

  SelectedDatabaseBtn = (e) => {
    console.log(e.target.value);

    this.setState({ SelectedDatabaseBtn: e.target.value }, function () {
      // this.getSourceRegistrations();
      this.getSourceRegistrationsDetails();
    });
  };

  renderSubTable = (expanded, record) => {
    // store expanded row
    let record_expanded_row = {
      expanded: expanded,
      record: record,
    };

    sessionStorage.setItem("source_type", record["type"]);
    this.setState({ database_type: record["type"], record_expanded_src: record_expanded_row, loader: true });
    if (expanded) {
      let url = `${constants.sourceregistration}/${record.id}`;
      let results = [];

      // axios.get(url).then(response => {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `query{
              sourceregistration(id:${record.id}){
                id,
                name,
                dbregistrations{,
                  id
                  ip,
                  port,
                  username,
                  password,
                  database,
                  queue_name,
                  database_type,
                  source_name,
                  environments{
                    id
                    type
                    urls
                  }
                }
              }
            }`,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          for (let reg of response["data"]["sourceregistration"]["dbregistrations"]) {
            let envi = "";
            for (let env of this.state.Environments_list) {
              if (reg["environments"][0]["id"] === env["id"].toString()) {
                envi = env["environment"];
                results.push({
                  ip: reg["ip"],
                  port: reg["port"],
                  username: reg["username"],
                  database: reg["database"],
                  Queuename: reg["queue_name"],
                  environment: envi,
                  id: reg["id"],
                });
              }
            }
          }

          let html = ReactDOMServer.renderToStaticMarkup(
            <Grid fluid>
              <Row className="show-grid header-row">
                <Col xs={4}>Ip</Col>
                <Col xs={4}>Port</Col>
                {record["type"] !== "redis" ? <Col xs={4}>Username</Col> : ""}
                {/* {
                  record['type'] === 'rabbitmq' ?
                    <Col xs={4}>Queue Name</Col> : ""

                } */}
                <Col xs={6}>Environment</Col>
                <Col xs={4}>Action</Col>
                <Col hidden>id</Col>
              </Row>
              {/* <Divider /> */}

              {results.map((data, index) => {
                return (
                  <div key={index}>
                    <Row className="show-grid dt-rows nested-table-row">
                      <Col xs={4} className="grid-style">
                        {data["ip"]}
                      </Col>
                      <Col xs={4} className="grid-style">
                        {data["port"]}
                      </Col>
                      {record["type"] !== "redis" ? (
                        <Col xs={4} className="grid-style">
                          {data["username"]}
                        </Col>
                      ) : (
                        ""
                      )}
                      {/* {
                        record['type'] === 'rabbitmq' ?
                          <Col xs={4} className="grid-style">
                            {data["Queuename"]}
                          </Col> : ""
                      } */}
                      <Col xs={6} className="grid-style">
                        {data["environment"]}
                      </Col>
                      <Col xs={1} className="grid-style">
                        <Whisper placement="top" trigger="hover" speaker={<Tooltip>Add Query</Tooltip>}>
                          <div
                            className="table-action-btn"
                            // onClick={() =>
                            //   this.props.parentData.history.push({
                            //     pathname: `data-sources/query/${id}`,
                            //     parentData: this.props
                            //   })
                            // }
                          >
                            <i className="fa fa-plus" />
                          </div>
                        </Whisper>
                      </Col>
                      <Col hidden className="grid-style">
                        {data["id"]}
                      </Col>
                    </Row>
                    {/* <Divider /> */}
                  </div>
                );
              })}
            </Grid>
          );

          if (results.length > 0) {
            this.setState({ html: html, loader: false });
          } else {
            this.setState({ loader: false, html: `<p style={{ margin: 0 }}>no data found</p>` });
          }
        });
    } else {
      this.setState({ html: null, record_expanded_src: {}, loader: false });
    }
  };

  // showConfirm = (id) => {
  //   confirm({
  //     title: 'Do you want to delete these Configuration?',
  //     // content: 'When clicked the OK button, this dialog will be closed after 1 second',
  //     onOk() {
  //       axios.delete(`${constants.dbregistrations}/${id}`)
  //     },
  //     onCancel() { },
  //   });
  // }

  // DeleteSource = (id) => {
  //   let _this = this

  //   confirm({
  //     title: 'Do you want to delete these Source?',
  //     // content: 'When clicked the OK button, this dialog will be closed after 1 second',
  //     onOk() {
  //       _this.setState({ loader: true })
  //       axios.delete(`${constants.sourceregistration}/${id}`)
  //       setTimeout(function () {
  //         _this.getSourceRegistrationsDetails()
  //         _this.setState({ loader: false })
  //       }, 1000);
  //     },
  //     onCancel() { },
  //   });
  // }

  deletePopUp = (deletion_id, type) => {
    this.setState({ deletion_id: deletion_id, deletion_type: type, deleteConfirmation: true });
  };

  render() {
    let _this = this;

    function transform(node, index) {
      if (node.name === "i") {
        return (
          <div className="action-btns">
            {/* <Whisper placement="top" trigger="hover" speaker={<Tooltip>Add Query</Tooltip>} key={node + index}>
              <div
                className="table-action-btn btn-space"
                onClick={() => {
                  let id = node["parent"]["parent"]["parent"]["children"][4]["children"][0]["data"] || node["parent"]["parent"]["parent"]["children"][5]["children"][0]["data"];

                  _this.props.parentData.history.push({
                    pathname: `data-sources/query/${id}`,
                    parentData: _this.props,
                    source_type: _this.state.database_type,
                  });
                }}
              >
                <i className="fa fa-plus" />
              </div>
            </Whisper> */}
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Edit</Tooltip>} key={"edit" + node + index}>
              <div
                className="table-action-btn"
                onClick={() => {
                  let id = node["parent"]["parent"]["parent"]["children"][4]["children"][0]["data"] || node["parent"]["parent"]["parent"]["children"][5]["children"][0]["data"];
                  axios.get(`${constants.dbregistrations}/${id}`).then((response) => {
                    let data = response["data"];
                    console.log("data", data);
                    let editConfigurationData = {
                      env: data["environments"][0]["id"],
                      ip: data["ip"],
                      port: data["port"],
                      password: data["password"],
                      username: data["username"],
                      database: data["database"],
                      sourceregistration: data["sourceregistration"]["id"],
                      update_id: id,
                    };
                    let record = {
                      description: data["sourceregistration"]["description"],
                      id: data["sourceregistration"]["id"],

                      source_name: data["sourceregistration"]["name"],
                      type: data["sourceregistration"]["type"],
                    };
                    _this.setState({
                      ConfigModalOpen: true,
                      // db_modification_id: id
                      editConfigurationData: editConfigurationData,
                      opened_record: record,
                    });
                  });
                }}
              >
                <i className="fa fa-edit" />
              </div>
            </Whisper>
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>} key={"del" + node + index}>
              <div
                className="table-action-btn btn-space"
                onClick={() => {
                  // let id = node['parent']['parent']['parent']['children'][5]['children'][0]['data']
                  let id = node["parent"]["parent"]["parent"]["children"][4]["children"][0]["data"] || node["parent"]["parent"]["parent"]["children"][5]["children"][0]["data"];
                  _this.deletePopUp(id, "delete-envConfiguration");
                }}
              >
                <i className="fa fa-trash" />
              </div>
            </Whisper>
          </div>
        );
      }
    }

    let filteredData = [];
    if (this.state.searchText.trim().length > 0) {
      for (const data of this.state.sourcesData) {
        if (
          data.source_name.includes(this.state.searchText) ||
          data.ip.includes(this.state.searchText) ||
          data.port.includes(this.state.searchText) ||
          data.username.includes(this.state.searchText) ||
          data.database.includes(this.state.searchText) ||
          data.queue_name.includes(this.state.searchText)
        ) {
          filteredData.push(data);
        }
      }
    } else {
      filteredData = this.state.sourcesData;
    }

    let expended_rows = this.state.expandedRowKeys;

    const columns = [
      {
        sorter: true,
        title: "Source Name",
        dataIndex: "source_name",
        key: "source_name",
        sorter: (a, b) => {
          // this.setState({expandedRowKeys: []})
          expended_rows = [];
          return a.source_name.length - b.source_name.length;
        },
      },
      {
        sorter: true,
        title: "Type",
        dataIndex: "type",
        key: "type",
        sorter: (a, b) => {
          expended_rows = [];
          return a.type.length - b.type.length;
        },
      },
      {
        sorter: true,
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: (a, b) => {
          expended_rows = [];
          a.description.length - b.description.length;
        },
      },
      {
        title: "Action",
        dataIndex: "id",
        key: "x",
        render: (text, record) => {
          return (
            <div className="table-action-btn-container">
              <Whisper placement="top" trigger="hover" speaker={<Tooltip>Configuration</Tooltip>}>
                <div
                  className="table-action-btn"
                  onClick={(e) => {
                    this.setState({
                      editConfigurationData: {},
                      ConfigModalOpen: true,
                      opened_record: record,
                    });
                  }}
                >
                  <i className="fa fa-plus" />
                </div>
              </Whisper>
              <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>}>
                <div
                  className="table-action-btn"
                  onClick={(e) => {
                    this.deletePopUp(record["id"], "delete-source");
                  }}
                >
                  <i className="fa fa-trash" />
                </div>
              </Whisper>
            </div>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">DATA PLATFORM</div>
            </div>
            <div className="filter-panel-right-part">
              <div
                onClick={() =>
                  this.setState({
                    ModalOpen: true,
                    UpdateRequestData: {},
                    DatabaseType: this.state.SelectedDatabaseBtn,
                  })
                }
                className="positive-button"
              >
                <i className="fa fa-plus" />
                Register Source
              </div>
            </div>
          </div>
          <div className="testcases-body">
            <div className="right-part">
              <div className="testcase-filter">
                {/* <div className="testcase-buttons-menu"> */}
                <div style={{ width: "100%" }}>
                  <div className="label-required-box filter-source-container">
                    <label className="data-source-label filter-source-label">Filter Data Sources</label>
                  </div>
                  <select autoFocus className="source-database-filter" value={this.state.SelectedDatabaseBtn} onChange={(e) => this.SelectedDatabaseBtn(e)}>
                    <option disabled value="selected_data_source" selected>
                      Filter
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

                {/* <div
                    onClick={() => this.SelectedDatabaseBtn("oracle")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "oracle" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Oracle
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("rabbitmq")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "rabbitmq" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    RabbitMQ
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("mysql")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "mysql" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    MySQL
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("redis")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "redis" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Redis
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("mongodb")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "mongodb" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    MongoDB
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("mssql")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "mssql" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    MSSQL
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("postgres")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "postgres" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Postgres
                  </div>
                  <div
                    onClick={() => this.SelectedDatabaseBtn("cassandra")}
                    className={"testcase-buttons-menu-items " + (this.state.SelectedDatabaseBtn === "cassandra" ? "testcase-buttons-menu-items-active" : "")}
                  >
                    Cassandra
                  </div> */}
                {/* </div> */}
                <div className="testcase-filter-panel-search-container">
                  <div className="testcase-filter-panel-search-btn">
                    <i className="fa fa-search" />
                  </div>
                  <input autoFocus type="text" placeholder="Search testcases here" name="search" value={this.state.searchText} onChange={(e) => this.setState({ searchText: e.target.value })} />
                </div>
              </div>
              <div className="testcases-table">
                <Table
                  dataSource={this.state.table_sourcesData}
                  columns={columns}
                  // rowKey="id"
                  expandedRowRender={(record) => (
                    <div
                      className="content"
                      // dangerouslySetInnerHTML={{ __html: this.state.html }}
                    >
                      {ReactHtmlParser(this.state.html, { transform })}
                    </div>
                  )}
                  onExpand={(expanded, record) => this.renderSubTable(expanded, record)}
                  expandedRowKeys={expended_rows}
                  onExpandedRowsChange={this.onExpandedRowsChange}
                />
              </div>
            </div>
          </div>
        </div>
        <AddDataSources
          updateData={this.getSourceRegistrationsDetails}
          ModalOpen={this.state.ModalOpen}
          DatabaseType={this.state.DatabaseType}
          SelectDatabase={(e) => {
            console.log("database type ---->", e.target.value);

            this.setState({ DatabaseType: e.target.value });
          }}
          ModalCancel={() => this.setState({ ModalOpen: false })}
          getSourceRegistrations={this.getSourceRegistrations}
          UpdateRequestData={this.state.UpdateRequestData}
        />
        <DeletePopupModal deleteConfirmation={this.state.deleteConfirmation} onHide={() => this.setState({ deleteConfirmation: false, sourceId: "" })} delete={this.sourceDelete} />
        <AddEnvironmentConfiguration
          ref={this.addConfigurationRef}
          editConfigurationData={this.state.editConfigurationData}
          ConfigModalOpen={this.state.ConfigModalOpen}
          ConfigModalCancel={() => {
            // update new rows
            let _this = this;
            if (this.state.record_expanded_src.hasOwnProperty("expanded")) {
              this.setState({ loader: true });
              setTimeout(function () {
                // re-render subtable
                _this.renderSubTable(_this.state.record_expanded_src["expanded"], _this.state.record_expanded_src["record"]);
                _this.setState({ loader: false });
              }, 1000);
            }

            this.setState({ ConfigModalOpen: false });
          }}
          record={this.state.opened_record}
        />
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
