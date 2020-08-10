import React, { Component } from "react";
import HighlighterRect from "./HighlighterRect";

export default class Highlighter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
    };
  }

  componentDidMount() {
    const ele = document.getElementById("imgContainer");
    if (ele) {
      this.setState({ width: ele.offsetWidth });
    }
  }

  render() {
    let highlighterRects = [];
    let recursive = (element, zIndex = 0) => {
      if (!element) {
        return;
      }
      let points = `x=${element.attributes.x},y=${element.attributes.y},width=${element.attributes.width},height=${element.attributes.height}`;

      if (element.attributes["resource-id"] == "com.sling.airtvmini:id/browse_view" && element.attributes.index == 1) {
        return;
      }
      if (
        element.attributes.objectName == "EmptyVideo" ||
        element.attributes.objectName == "ota_content" ||
        element.tagName == "DishDigitalCaptionHandler"
      ) {
        return;
      }
      // if(element.attributes.objectName == "ribbon_list_container"){
      //   return;
      // }
      highlighterRects.push(
        <HighlighterRect
          {...this.props}
          element={element}
          zIndex={zIndex}
          scaleRatio={this.props.ratio}
          key={element.path}
          xOffset={0}
          onElementSelected={this.props.onElementSelected}
        />
      );

      if (element.attributes.name == "RibbonTileCell" && element.attributes.type == "XCUIElementTypeCell") {
        return;
      }
      if (element.attributes.type == "XCUIElementTypeTextView") {
        return;
      }

      // Condition to check if name is json parseable, if nor return..

      try {
        const data = JSON.parse(element.attributes.name);
        return;
      } catch (error) {}

      for (let childEl of element.children) {
        recursive(childEl, zIndex + 1);
      }
    };

    // If the use selected an element that they searched for, highlight that element
    // if (searchedForElementBounds && isLocatorTestModalVisible) {
    //     const {location: elLocation, size} = searchedForElementBounds;
    //     highlighterRects.push(<HighlighterRect elSize={size} elLocation={elLocation} scaleRatio={scaleRatio} xOffset={highlighterXOffset} />);
    // }

    // If we're tapping or swiping, show the 'crosshair' cursor style
    const screenshotStyle = {};
    // if ([TAP, SWIPE].includes(screenshotInteractionMode)) {
    //     screenshotStyle.cursor = 'crosshair';
    // }

    // Don't show highlighter rects when Search Elements modal is open
    // if (!isLocatorTestModalVisible) {
    // highlighterRects = [];
    recursive(this.props.source);
    // }
    return <div>{highlighterRects}</div>;
  }
}
