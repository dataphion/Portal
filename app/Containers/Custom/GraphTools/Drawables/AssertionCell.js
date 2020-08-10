import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ConditionCell.scss";

export default class AssertionCell {
  Cell(graph, cell) {
    let AssertionCell = document.createElement("div");
    let AssertionLeft = document.createElement("div");
    let AssertionRight = document.createElement("div");
    let AssertionTop = document.createElement("div");
    let AssertionBottom = document.createElement("div");

    AssertionCell.appendChild(AssertionLeft);
    AssertionCell.appendChild(AssertionRight);
    AssertionRight.appendChild(AssertionTop);
    AssertionRight.appendChild(AssertionBottom);

    AssertionCell.setAttribute("id", `graph-cell-${cell.id}`);
    AssertionCell.setAttribute("class", "condition-cell");
    AssertionLeft.setAttribute("class", "assertion-cell-left");
    AssertionRight.setAttribute("class", "condition-cell-right");
    AssertionTop.setAttribute("class", "condition-cell-right-top");
    AssertionBottom.setAttribute("class", "condition-cell-right-bottom");

    AssertionTop.innerHTML = cell.getAttribute("Title", "");
    if (
      cell.value.attributes.Type.value === "controls" &&
      cell.value.attributes.Method.value === "assertion"
    ) {
      AssertionBottom.innerHTML = cell.value.attributes.AssertionAdd
        ? `${
            JSON.parse(cell.value.attributes.AssertionAdd.value).length
          } Assertion Added`
        : "0 Assertion Added";
    }

    return AssertionCell;
  }
}
