import React from "react";
import "../../../Assets/Styles/Custom/Dashboard/DataSourcesQuery.scss";
import { Link } from "react-router-dom";
import Header from "../../../Components/Header";
import DashboardSidebar from "../../../Components/DashboardSidebar";
import DeletePopupModal from "../../../Components/DeletePopupModal";
import Loader from "../../../Components/Loader";
import { Icon, Collapse } from "antd";
import AddSourceQuery from "../../../Components/AddSourceQuery";
import { Tooltip, Whisper, Alert } from "rsuite";
import axios from "axios";
import constants from "../../../constants";
import { Context } from "../../Context";

export default class DataSourcesQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      deleteConfirmation: false,
      QueryId: "",
      QueryTemplates: [],
      ModalOpen: false,
      UpdateRequestData: {},
    };
  }

  componentDidMount() {
    if (sessionStorage.getItem("id")) {
      this.getQueryTemplates();
    } else {
      this.props.history.push("/login");
    }
  }

  getQueryTemplates = () => {
    this.setState({ loader: true });
    fetch(constants.graphql, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `{dbregistrations(where:{id:"${
          window.location.pathname.split("/")[5]
        }"}){ip,port,username,password,database,queue_name,database_type,source_name,datasources{id,title,query,test_response}}}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          QueryTemplates: response.data.dbregistrations[0],
          loader: false,
        });
      })
      .catch((error) => {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  editQueryTemplate = (Id) => {
    const that = this;
    axios
      .get(constants.datasource + `/${Id}`)
      .then(function (response) {
        that.setState({ UpdateRequestData: response.data, ModalOpen: true });
      })
      .catch(function (error) {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  deleteQueryTemplate = () => {
    this.setState({ loader: true });
    const that = this;
    axios
      .delete(constants.datasource + `/${this.state.QueryId}`)
      .then(function (response) {
        that.setState({
          deleteConfirmation: false,
          QueryId: "",
          loader: false,
        });
        that.getQueryTemplates();
      })
      .catch(function (error) {
        Alert.error("Something went wrong");
        console.log(error);
      });
  };

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
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
                    <Link to={`/dashboard/${window.location.pathname.split("/")[2]}/data-sources`} className="breadcrumbs-items">
                      DATA SOURCES
                    </Link>
                    <div className="breadcrumbs-items">></div>
                    <div className="breadcrumbs-items">{this.state.QueryTemplates.database ? this.state.QueryTemplates.database : ""}</div>
                  </div>
                  <div className="filter-panel-right-part">
                    <div
                      onClick={() =>
                        this.setState({
                          ModalOpen: true,
                          UpdateRequestData: {},
                        })
                      }
                      className="positive-button"
                    >
                      <i className="fa fa-plus" />
                      Add Template
                    </div>
                  </div>
                </div>
                <div className="container-fluid" style={{ padding: "30px 30px 0 30px" }}>
                  <Collapse
                    bordered={false}
                    defaultActiveKey={["0"]}
                    expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                  >
                    {this.state.QueryTemplates.datasources ? (
                      this.state.QueryTemplates.datasources.map((Data, index) => (
                        <Collapse.Panel header={Data.title} key={index} className="query-template-accordion">
                          <div className="query-template-accordion-data">
                            <p>{Data.query}</p>
                            <div className="query-template-accordion-data-btn-container">
                              <Whisper placement="top" trigger="hover" speaker={this.Tooltip("Edit")} onClick={() => this.editQueryTemplate(Data.id)}>
                                <div className="query-template-accordion-data-btn">
                                  <Icon type="edit" />
                                </div>
                              </Whisper>
                              <Whisper
                                placement="top"
                                trigger="hover"
                                speaker={this.Tooltip("Delete")}
                                onClick={() =>
                                  this.setState({
                                    deleteConfirmation: true,
                                    QueryId: Data.id,
                                  })
                                }
                              >
                                <div className="query-template-accordion-data-btn">
                                  <Icon type="delete" />
                                </div>
                              </Whisper>
                            </div>
                          </div>
                        </Collapse.Panel>
                      ))
                    ) : (
                      <div className="rs-table-body-info" style={{ position: "unset", lineHeight: "300px" }}>
                        No data found
                      </div>
                    )}
                  </Collapse>
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
            <AddSourceQuery
              ModalOpen={this.state.ModalOpen}
              ModalCancel={() => this.setState({ ModalOpen: false })}
              getQueryTemplates={this.getQueryTemplates}
              sourceDetails={this.state.QueryTemplates}
              UpdateRequestData={this.state.UpdateRequestData}
            />
            <DeletePopupModal
              deleteConfirmation={this.state.deleteConfirmation}
              onHide={() =>
                this.setState({
                  deleteConfirmation: false,
                  QueryId: "",
                })
              }
              delete={this.deleteQueryTemplate}
            />
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
