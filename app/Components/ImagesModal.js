import React from "react";
import { Modal, Alert } from "rsuite";
import constants from "../constants";
import Annotation from "react-image-annotation";
// import { Alert } from "antd";
import Loader from "./Loader";

export default class ImagesModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      annotations: [],
      annotation: {},
      loader: false,
    };
  }

  // onSubmit = annotation => {
  //   const { geometry, data, selection } = annotation;
  //   let annotate = this.state.annotations;

  //   // remove previous selected element
  //   if (annotate.length > 0) {
  //     annotate.splice(0, 1);
  //   }

  //   this.setState({
  //     annotation: {},
  //     annotations: annotate.concat({
  //       geometry,
  //       data: {
  //         ...data,
  //         id: Math.random()
  //       }
  //     })
  //   });
  // };

  onChange = (annotation) => {
    this.setState({ annotation });
  };

  updateRecord = () => {
    this.setState({ loader: true });
    let url = constants.objectrepositories + "/" + this.props.currentObjectRepositoryId;

    let img = document.getElementById("image_url");
    // get actual image resolution
    let realWidth = img.naturalWidth / 100;
    let realHeight = img.naturalHeight / 100;

    // get window pixel value
    // let pixel_value = window.devicePixelRatio;
    let pixel_value = this.props.loadModalImages.pixel_ratio;

    // get relative resolution with annotation tag
    let x = (realWidth * this.state.annotation.geometry.x) / pixel_value;
    let y = (realHeight * this.state.annotation.geometry.y) / pixel_value;

    // get relative height
    let width = ((this.state.annotation.geometry.x + this.state.annotation.geometry.width) * realWidth) / pixel_value;
    let height = ((this.state.annotation.geometry.y + this.state.annotation.geometry.height) * realHeight) / pixel_value;

    // update object repository
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        x_cord: Math.floor(x),
        y_cord: Math.floor(y),
        height: Math.floor(height - y),
        width: Math.floor(width - x),
        rmq: true,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({ loader: false });
        this.props.onHide();
        Alert.success("updated successfully");
      })
      .catch((error) => {
        console.log(error);

        Alert.error("Something went wrong");
      });
  };

  render() {
    return (
      <Modal full show={this.props.imageModal} onHide={this.props.onHide}>
        <Modal.Header>
          <div className="image-modal-buttons-container">
            <div className="modal-container-with-button">
              <div className="image-modal-buttons-menu">
                <div
                  onClick={() => {
                    this.props.modalSelectedMenuAction("highlightedImage");
                  }}
                  className={
                    "image-modal-buttons-menu-items " +
                    (this.props.modalSelectedMenu === "highlightedImage" ? "image-modal-buttons-menu-items-active" : "")
                  }
                >
                  Highlighted Image
                </div>
                <div
                  onClick={() => this.props.modalSelectedMenuAction("elementSnapshot")}
                  className={
                    "image-modal-buttons-menu-items " +
                    (this.props.modalSelectedMenu === "elementSnapshot" ? "image-modal-buttons-menu-items-active" : "")
                  }
                >
                  Element Snapshot
                </div>
                <div
                  onClick={() => this.props.modalSelectedMenuAction("pageImage")}
                  className={
                    "image-modal-buttons-menu-items " + (this.props.modalSelectedMenu === "pageImage" ? "image-modal-buttons-menu-items-active" : "")
                  }
                >
                  Page Image
                </div>
              </div>
              {this.props.modalSelectedMenu === "pageImage" ? (
                <div className="sr-form-footer-btn-container">
                  <div onClick={this.props.onHide} className="negative-button">
                    <i className="fa fa-close" /> Discard Change
                  </div>
                  <div onClick={this.updateRecord} id="update_btn" className="positive-button">
                    <i className="fa fa-check" />
                    Update
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className={this.props.modalSelectedMenu === "elementSnapshot" ? "element-body" : ""}>
          {this.props.modalSelectedMenu === "highlightedImage" ? (
            this.props.loadModalImages.highlighted_image_url ? (
              <img
                className="animated fadeIn"
                src={constants.image_host + this.props.loadModalImages.highlighted_image_url}
                height="100%"
                width="100%"
              />
            ) : (
              ""
            )
          ) : (
            ""
          )}
          {this.props.modalSelectedMenu === "elementSnapshot" ? (
            <div className="element-body-img">
              <img
                className="animated fadeIn"
                src={constants.image_host + this.props.loadModalImages.element_snapshot}
                height={this.props.loadModalImages.height ? `${this.props.loadModalImages.height}px` : ""}
                width={this.props.loadModalImages.width ? `${this.props.loadModalImages.width}px` : ""}
              />
            </div>
          ) : (
            ""
          )}
          {this.props.modalSelectedMenu === "pageImage" ? (
            <div>
              {/* using image tag to get image width and height */}
              <img
                hidden
                id="image_url"
                className="animated fadeIn"
                src={constants.image_host + this.props.loadModalImages.page_url}
                height="100%"
                width="100%"
              />

              <Annotation
                src={constants.image_host + this.props.loadModalImages.page_url}
                alt="Two pebbles anthropomorphized holding hands"
                height="100%"
                width="100%"
                annotations={this.state.annotations}
                disableEditor={true}
                type={this.state.type}
                value={this.state.annotation}
                onChange={this.onChange}
                // onSubmit={this.onSubmit}
              />
            </div>
          ) : (
            ""
          )}
        </Modal.Body>
        <Loader status={this.state.loader} />
      </Modal>
    );
  }
}
