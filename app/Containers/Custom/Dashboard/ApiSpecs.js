import React from "react";
import { Alert, Tooltip, Whisper } from "rsuite";
import Loader from "../../../Components/Loader";
import AddSwaggerModal from "../../../Components/AddSwaggerModal";
import AddCollectionModal from "../../../Components/AddCollectionModal";

import ConflictConfirmationModal from "../../../Components/ConflictConfirmationModal";
import { Table, Menu, Dropdown, Button } from "antd";
import constants from "../../../constants";
import { Link } from "react-router-dom";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import ApiTransformation from "../../../Components/ApiTransformation";
import { runInContext } from "lodash";

export default class ApiSpecs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteConfirmation: false,
      apiSpecsId: "",
      conflictdata: {
        data: [],
      },
      searchText: "",
      addedPack: [],
      loader: false,
      addSwaggerModal: false,
      addCollectionModal: false,
      addApiTransformationModal: false,
      conflictConfirmation: false,
      import_selection: "import",
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      window.scrollTo(0, 0);
      this.loadAddedPack();
    } else {
      this.props.history.push("/login");
    }
  }

  importSelection = (type) => {
    if (type === "swagger") {
      this.setState({ addSwaggerModal: true });
    } else if (type === "collection") {
      this.setState({ addCollectionModal: true });
    }
    // this.setState({ import_selection: e.target.value });
  };

  showconflict = (data) => {
    console.log(data);
    data.status == "success" ? this.setState({ conflictConfirmation: true, conflictdata: data }) : data.status == "nochanges" ? Alert.success("No changes.") : "";
  };

  loadAddedPack = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{applications(where:{user:{id:"${sessionStorage.getItem("id")}"}id:"${window.location.pathname.split("/")[2]}"}){endpointpacks{id,name,upload_type}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("endpoints pack", response);
        let packs = [];
        if (response.data.applications[0].endpointpacks.length > 0) {
          for (const pack of response.data.applications[0].endpointpacks) {
            if (pack.upload_type !== "custom") {
              packs.push(pack);
            }
          }
        }

        this.setState({
          loader: false,
          addedPack: packs,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  delete = () => {
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `mutation{deleteEndpointpack(input:{where:{id:"${this.state.apiSpecsId}"}}){endpointpack{id}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({ deleteConfirmation: false, apiSpecsId: "" });
        this.loadAddedPack();
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  render() {
    this.state.addedPack;
    let filteredData = [];
    if (this.state.searchText.trim().length > 0) {
      for (const data of this.state.addedPack) {
        if (data.name.includes(this.state.searchText) || data.upload_type.includes(this.state.searchText)) {
          filteredData.push(data);
        }
      }
    } else {
      filteredData = this.state.addedPack;
    }

    const columns = [
      {
        sorter: true,
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        sorter: true,
        title: "Upload Type",
        dataIndex: "upload_type",
        key: "type",
        sorter: (a, b) => a.type.localeCompare(b.type),
      },
      {
        title: "Action",
        dataIndex: "id",
        key: "x",
        render: (id) => (
          <div className="table-action-btn-container">
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Update</Tooltip>}>
              <div
                className="table-action-btn"
                onClick={() =>
                  this.setState({
                    apiSpecsId: id,
                    addSwaggerModal: true,
                  })
                }
              >
                <i className="fa fa-edit" />
              </div>
            </Whisper>
            <Whisper placement="top" trigger="hover" speaker={<Tooltip>Delete</Tooltip>}>
              <div className="table-action-btn" onClick={() => this.setState({ apiSpecsId: id, deleteConfirmation: true })}>
                <i className="fa fa-trash" />
              </div>
            </Whisper>
          </div>
        ),
      },
    ];
    console.log(this.state.addCollectionModal);

    const menu = (
      <Menu>
        <Menu.Item onClick={() => this.importSelection("swagger")}>
          <i class="fa fa-file" aria-hidden="true" style={{ marginRight: 5 }}></i>
          Swagger
        </Menu.Item>
        <Menu.Item onClick={() => this.importSelection("collection")}>
          <i class="fa fa-file" aria-hidden="true" style={{ marginRight: 5 }}></i>
          Postman Collection
        </Menu.Item>
      </Menu>
    );

    return (
      <React.Fragment>
        <div className="body-container animated fadeIn">
          <div className="filter-panel-container">
            <div className="breadcrumbs-container">
              <i className="fa fa-map-marker" />
              <Link to="/">APPLICATIONS</Link>
              <div className="breadcrumbs-items">></div>
              <div className="breadcrumbs-items">API SPECS</div>
            </div>
            <div style={{ display: "flex" }}>
              <div className="filter-panel-right-part">
                <div onClick={() => this.setState({ addApiTransformationModal: true })} className="positive-button transformation-btn">
                  <i className="fa fa-exchange" style={{ marginRight: 10 }} />
                  Transformation
                </div>
              </div>
              <div className="filter-panel-right-part">
                {/* <div onClick={() => this.setState({ addSwaggerModal: true })} className="positive-button">
                  <i className="fa fa-plus" />
                  Add Specs
                </div> */}
                {/* <select name="import-selection" value={this.state.import_selection} id="import-selection" className="import-dropdown" onChange={this.importSelection}>
                  <option value="import">Import Files</option>
                  <option value="swagger">Swagger</option>
                  <option value="collection">Postman Collection</option>
                </select> */}
                <Dropdown overlay={menu} placement="bottomRight" arrow className="import-dropdown">
                  <Button>Import </Button>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="testcases-body">
            <div className="right-part">
              <div className="testcase-filter" style={{ justifyContent: "flex-end" }}>
                <div className="testcase-filter-panel-search-container">
                  <div className="testcase-filter-panel-search-btn">
                    <i className="fa fa-search" />
                  </div>
                  <input autoFocus type="text" placeholder="Search name here" name="search" value={this.state.searchText} onChange={(e) => this.setState({ searchText: e.target.value })} />
                </div>
              </div>
              <div className="testcases-table">
                <Table dataSource={filteredData} columns={columns} rowKey="id" />
              </div>
            </div>
          </div>
        </div>
        <ApiTransformation addApiTransformationModal={this.state.addApiTransformationModal} onHide={() => this.setState({ addApiTransformationModal: false })}></ApiTransformation>
        <AddSwaggerModal
          addSwaggerModal={this.state.addSwaggerModal}
          onHide={() => this.setState({ addSwaggerModal: false, apiSpecsId: "", import_selection: "import" })}
          spec_id={this.state.apiSpecsId}
          loadAddedPack={this.loadAddedPack}
          showconflict={(e) => this.showconflict(e)}
        />
        <AddCollectionModal
          addCollectionModal={this.state.addCollectionModal}
          onHide={() => this.setState({ addCollectionModal: false, apiSpecsId: "", import_selection: "import" })}
          spec_id={this.state.apiSpecsId}
          loadAddedPack={this.loadAddedPack}
          // showconflict={(e) => this.showconflict(e)}
        />
        <DeletePopupModal deleteConfirmation={this.state.deleteConfirmation} onHide={() => this.setState({ deleteConfirmation: false, apiSpecsId: "" })} delete={this.delete} />
        <Loader status={this.state.loader} />
        <ConflictConfirmationModal
          conflictConfirmation={this.state.conflictConfirmation}
          onHide={() => this.setState({ conflictConfirmation: false, conflictdata: { data: [] } })}
          conflictdata={this.state.conflictdata}
        />
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
