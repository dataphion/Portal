import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ConditionCell.scss";

export default class IteratorCell {
  Cell(graph, cell) {
    let IteratorCell = document.createElement("div");
    let IteratorLeft = document.createElement("div");
    let IteratorRight = document.createElement("div");
    let IteratorTop = document.createElement("div");
    let IteratorBottom = document.createElement("div");

    IteratorCell.appendChild(IteratorLeft);
    IteratorCell.appendChild(IteratorRight);
    IteratorRight.appendChild(IteratorTop);
    IteratorRight.appendChild(IteratorBottom);

    IteratorCell.setAttribute("id", `graph-cell-${cell.id}`);
    IteratorCell.setAttribute("class", "condition-cell");
    IteratorLeft.setAttribute("class", "iterator-cell-left");
    IteratorRight.setAttribute("class", "condition-cell-right");
    IteratorTop.setAttribute("class", "condition-cell-right-top");
    IteratorBottom.setAttribute("class", "condition-cell-right-bottom");

    IteratorTop.innerHTML = cell.getAttribute("Title", "");
    if (
      cell.value.attributes.Type.value === "controls" &&
      cell.value.attributes.Method.value === "iterator"
    ) {
      IteratorBottom.innerHTML = `${cell.getAttribute(
        "ExecutionMode",
        "Execution Mode"
      )}`;
    }

    return IteratorCell;
  }
}
