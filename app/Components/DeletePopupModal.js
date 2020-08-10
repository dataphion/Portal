import React from "react";
import "../Assets/Styles/Custom/DeletePopupModal.scss";
import { Modal, Icon } from "rsuite";

export default class DeletePopupModal extends React.Component {
  render() {
    return (
      <Modal
        backdrop="static"
        show={this.props.deleteConfirmation}
        onHide={this.props.onHide}
        size="xs"
      >
        <Modal.Body className="delete-modal-body">
          <div className="delete-modal-body-container">
            <Icon
              icon="remind"
              style={{
                color: "#ff6b6b",
                fontSize: 24
              }}
            />
            <div className="delete-modal-body-text">
              Are you sure, You want to delete?
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="delete-modal-footer-btn-container">
            <div onClick={this.props.onHide} className="negative-button">
              <i className="fa fa-close" /> Cancel
            </div>
            <div onClick={this.props.delete} className="negative-btn">
              <i className="fa fa-check" /> &nbsp;Delete
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}
