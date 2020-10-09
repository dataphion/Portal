import ApiCell from "./Drawables/ApiCell";
import UiCell from "./Drawables/UiCell";
import ConditionCell from "./Drawables/ConditionCell";
import IteratorCell from "./Drawables/IteratorCell";
import AssertionCell from "./Drawables/AssertionCell";
import VariableCell from "./Drawables/VariableCell";
import SourceCell from "./Drawables/SourceCell";
import GraphqlCell from "./Drawables/GraphqlCell";

export default class NewCell {
  NewCell(graph, cell) {
    // debugger;
    console.log("------------cell----------------------");
    let NewCell;
    console.log("method --->", cell.getAttribute("Method"));
    if (cell.getAttribute("Type") === "api" && cell.getAttribute("Method") === "uitestcase") {
      NewCell = new UiCell();
    } else if (cell.getAttribute("Type") === "api" && cell.getAttribute("Method") === "graphql") {
      NewCell = new GraphqlCell();
    } else if (cell.getAttribute("Type") === "api" && cell.getAttribute("Method") !== "uitestcase") {
      NewCell = new ApiCell();
      // NewCell = new GraphqlCell();
    } else if (cell.getAttribute("Type") === "controls" && cell.getAttribute("Method") === "conditions") {
      NewCell = new ConditionCell();
    } else if (cell.getAttribute("Type") === "controls" && cell.getAttribute("Method") === "iterator") {
      NewCell = new IteratorCell();
    } else if (cell.getAttribute("Type") === "controls" && cell.getAttribute("Method") === "assertion") {
      NewCell = new AssertionCell();
    } else if (cell.getAttribute("Type") === "controls" && cell.getAttribute("Method") === "variable") {
      NewCell = new VariableCell();
    } else if (cell.getAttribute("Type") === "source") {
      NewCell = new SourceCell();
    }
    return NewCell.Cell(graph, cell);
  }
}
