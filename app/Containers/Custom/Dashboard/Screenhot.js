// @flow
import React, { Component } from "react";
import { Context } from "../../Context";
import { getOptimalXPath } from "../../../Components/util";
import Highlighter from "./Highlighter";
import constants from "../../../constants";
import socketIOClient from "socket.io-client";
const socket = socketIOClient(constants.socket_url);
const uniqueAttributes = ["name", "content-desc", "id", "accessibility-id"];

export default class Screenshot extends Component {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {
      driver: null,
      xmlSchema: null,
      screenshot: null,
      jsonSchema: null,
      dimension: { height: 0, width: 0 },
      ratio: 0,
    };
  }

  async componentDidMount() {
    this.getScreenShot = this.getScreenShot.bind(this);
    // Get screenshot
    socket.on(`send_created_session_data_${sessionStorage.getItem("publicIP")}`, (data) => this.getScreenShot(data));
    // ipcRenderer.on("highlight-reply", this.gethighlighteddata);
    // ipcRenderer.on("parse_screenshot", async (event, arg) => {
    //   let js = await this.xmlToJSON(arg.source);
    //   event.sender.send('parse_screenshot-reply', js)
    // });
  }

  gethighlighteddata = async (event, arg) => {
  };

  async getScreenShot(arg) {

    const json_source = await this.xmlToJSON(arg.source);

    //Get screenshot dimensions
    var dimension = await this.getImageDimensions(arg.screenshot);

    let ratio = 0;
    //Checks device is in landscape mode or portrait mode
    if (dimension.height > dimension.width) {
      //portrait Mode Code
      //Height of screenshot-preview appearing div (left-part-recording-preview)
      var clientHeight = document.getElementById("left-part-recording-preview").clientHeight;
      //ratio of ava. height (left-part-recording-preview) and screenshot height
      ratio = clientHeight / dimension.height;
      //ratio > 1 means screenshot height is not grater than ava. height so no need to resize image
      if (ratio > 1) {
        ratio = 1;
      } else {
        //ratio < 1 means screenshot height is greater than ava. height
        // so we have to resize image according ratio to display properly in ava. height & width
        dimension.height = clientHeight;
        dimension.width = dimension.width * ratio;
      }
    } else {
      //landscape Mode Code
      //Width screenshot-preview appearing div (left-part-recording-preview)
      var clientWidth = document.getElementById("left-part-recording-preview").clientWidth;
      //ratio of ava. width (left-part-recording-preview) and screenshot width
      ratio = clientWidth / dimension.width;
      //ratio > 1 means screenshot width is not grater than ava. width so no need to resize image
      if (ratio > 1) {
        ratio = 1;
      } else {
        //ratio < 1 means screenshot width is greater than ava. width
        // so we have to resize image according ratio to display properly in ava. height & width
        dimension.width = clientWidth;
        dimension.height = dimension.height * ratio;
      }
    }
    this.setState({
      screenshot: arg.screenshot,
      xmlSchema: arg.source,
      jsonSchema: json_source,
      dimension: dimension,
      ratio: ratio,
    });
    this.context.setStepScreenshot({
      base64: arg.screenshot,
      height: arg.window_size.height,
      width: arg.window_size.width,
    });
  }

  getImageDimensions = (file) => {
    return new Promise(function (resolved, rejected) {
      var i = new Image();
      i.onload = function () {
        resolved({ width: i.width, height: i.height });
      };
      i.src = file;
    });
  };

  getMatches(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while ((match = regex.exec(string))) {
      let firstmatch = match[0].replace(/\:\:/g, "__");
      string = string.replace(match[0], firstmatch);
      matches.push(match[index]);
    }
    return string;
  }
  async xmlToJSON(source) {
    let xmlDoc;

    // Replace strings with Unicode format &#012345 with #012345
    // The &# unicode format breaks the parser
    // source = source.replace(/&#([0-9]{4,})/g, "#$1");

    let recursive = (xmlNode, points, parentPath, index) => {
      // Translate attributes array to an object

      let attrObject = {};
      for (let attribute of xmlNode.attributes || []) {
        if (["x", "y"].includes(attribute.name)) {
          attrObject[attribute.name] = points[attribute.name] + Number(attribute.value);
        } else {
          attrObject[attribute.name] = attribute.value;
        }
        if (attribute.name == "metainfo") {
        }
      }

      // Dot Separated path of indices
      let path = index !== undefined && `${!parentPath ? "" : parentPath + "."}${index}`;

      return {
        children: [...xmlNode.children].map((childNode, childIndex) => recursive(childNode, attrObject, path, childIndex)),
        tagName: xmlNode.tagName,
        attributes: attrObject,
        xpath: getOptimalXPath(xmlDoc, xmlNode, uniqueAttributes),
        path,
      };
    };

    // var myRegEx = /[\w]+\:\:(?:[\w]*\:\:)*/g;
    // var matches = this.getMatches(source, myRegEx, 1);
    xmlDoc = new DOMParser().parseFromString(source, "application/xml");
    let sourceXML = xmlDoc.children[0];

    return recursive(sourceXML, { x: 0, y: 0 });
  }

  render() {
    // const value = "calc(100vh - 60px)";
    return (
      <div className="mobile-screenshot-container">
        <img
          src={this.state.screenshot}
          style={{
            height: `${this.state.dimension.height}px`,
            width: `${this.state.dimension.width}px`,
            zIndex: -1,
            objectFit: "scale-down",
          }}
          id="imgContainer"
        />
        <Highlighter
          source={this.state.jsonSchema}
          style={{ width: "100%", height: "100%" }}
          ratio={this.state.ratio}
          onElementSelected={this.props.onElementSelected}
        />
      </div>
    );
  }
}
