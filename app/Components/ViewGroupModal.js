import React from "react";
import "../Assets/Styles/Custom/Dashboard/MetaDataModal.scss";
import { Modal, Whisper, Tooltip, Alert } from "rsuite";
import _ from "lodash";
import Loader from "./Loader";
import constants from "../constants";
import axios from "axios";

export default class ViewGroupModal extends React.Component {
  state = {
    loader: false,
  };

  Tooltip = (tooltip) => {
    return <Tooltip>{tooltip}</Tooltip>;
  };

  deleteGroup = () => {
    this.setState({ loader: true });
    if (this.props.viewGroupModalInformation.group_name === "self") {
      const that = this;
      var groupIds = this.props.groupIds.filter(function (id) {
        return id !== that.props.viewGroupModalInformation.id;
      });
      const bodyData = {
        testcasegroups: groupIds,
      };
      axios
        .put(constants.testcases + `/${window.location.pathname.split("/")[5]}`, bodyData)
        .then((response) => {
          this.setState({
            loader: false,
          });
          this.props.onHide();
          this.props.loadSteps();
          Alert.success("Group removed successfully");
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    } else if (this.props.viewGroupModalInformation.group_name === "from_other") {
      axios
        .delete(constants.testcasecomponents + `/${this.props.viewGroupModalInformation.id}`)
        .then((response) => {
          this.setState({
            loader: false,
          });
          this.props.onHide();
          this.props.loadSteps();
          Alert.success("Group removed successfully");
        })
        .catch((error) => {
          Alert.error("Something went wrong");
          console.log(error);
        });
    }
  };

  render() {
    return (
      <React.Fragment>
        <Modal
          className="meta-data-modal-body"
          full
          show={this.props.viewGroupModal}
          onHide={this.props.onHide}
          onExit={() => this.setState({ stepsDataGroup: [] })}
        >
          <Modal.Header>
            <div className="view-group-modal">
              <div className="meta-data-modal-header-title">
                {this.props.viewGroupModalInformation ? `${this.props.viewGroupModalInformation.name} Steps` : ""}
              </div>
              <div onClick={() => this.deleteGroup()} className="negative-btn">
                <i className="fa fa-trash" />
                &nbsp;&nbsp;Remove
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="container-fluid" style={{ padding: "30px" }}>
              <div className="row">
                {this.props.viewGroupModalInformation.testcasecomponents
                  ? this.props.viewGroupModalInformation.testcasecomponents.map((details, index) => {
                      return (
                        <div key={index} className="col-md-3 animated zoomIn faster">
                          <div className={"testcase-container " + (details.sequence_number === 1 ? "testcase-container-first" : "")}>
                            {details.sequence_number !== 1 ? (
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
                              ""
                            )}
                            <div className="testcase-container-index-count">{details.sequence_number}</div>
                            {details.sequence_number === 1 ? (
                              <div className="testcase-container-first-header">
                                <div className="globe-icon" /> OPEN URL
                              </div>
                            ) : (
                              ""
                            )}
                            <div className="testcase-container-footer">
                              <div className="testcase-container-footer-tools">
                                {details.sequence_number !== 1 ? (
                                  <Whisper placement="top" trigger="hover" speaker={this.Tooltip("View Images")}>
                                    <div onClick={() => this.props.imageModal(details.id)} className="testcase-container-footer-tool-btn">
                                      <i className="fa fa-picture-o" />
                                    </div>
                                  </Whisper>
                                ) : (
                                  ""
                                )}
                                {details.sequence_number !== 1 ? (
                                  <Whisper placement="top" trigger="hover" speaker={this.Tooltip("View Meta Data")}>
                                    <div
                                      onClick={() => this.props.modalInformation(details.objectrepository)}
                                      className="testcase-container-footer-tool-btn"
                                    >
                                      <i className="fa fa-file-text" />
                                    </div>
                                  </Whisper>
                                ) : (
                                  ""
                                )}
                                <Whisper placement="top" trigger="hover" speaker={this.Tooltip("Delete Step")}>
                                  <div onClick={() => this.props.deleteCard(details.id)} className="testcase-container-footer-tool-btn delete">
                                    <i className="fa fa-trash" />
                                  </div>
                                </Whisper>
                              </div>
                              <div className="testcase-container-footer-description">
                                {details.sequence_number === 1
                                  ? this.props.sessionUrl
                                  : details.objectrepository.description
                                  ? details.objectrepository.description
                                  : "Autofocus"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <Loader status={this.state.loader} />
      </React.Fragment>
    );
  }
}
