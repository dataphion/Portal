import "../../../../Assets/Styles/Custom/GraphTools/Drawables/ApiCell.scss";
import constants from "../../../../constants";

export default class ApiCell {
  Cell(graph, cell) {
    let conflict = false;
    let ApiCell = document.createElement("div");
    let ApiCellHeader = document.createElement("div");
    let ApiCellHeaderMethodBTN = document.createElement("div");
    let ApiCellHeaderMethodTitle = document.createElement("div");
    let ApiCellFooter = document.createElement("div");
    let ApiCellFooterUri = document.createElement("div");

    ApiCell.appendChild(ApiCellHeader);
    ApiCellHeader.appendChild(ApiCellHeaderMethodBTN);
    ApiCellHeader.appendChild(ApiCellHeaderMethodTitle);
    ApiCell.appendChild(ApiCellFooter);
    ApiCellFooter.appendChild(ApiCellFooterUri);

    ApiCell.setAttribute("id", `graph-cell-${cell.id}`);

    ApiCellHeader.setAttribute("class", "api-cell-header");
    // console.log(cell.getAttribute("Method"));
    if (cell.getAttribute("Method") === undefined) {
      ApiCell.setAttribute("class", "api-cell api-cell-get");

      if (conflict) {
        ApiCell.setAttribute("class", "api-cell-header-conflict");
      }
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-get");
    } else if (cell.getAttribute("Method").toLowerCase() === "get") {
      ApiCell.setAttribute("class", "api-cell api-cell-get");

      if (conflict) {
        ApiCell.setAttribute("class", "api-cell-header-conflict");
      }
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-get");
    } else if (cell.getAttribute("Method").toLowerCase() === "post") {
      ApiCell.setAttribute("class", "api-cell api-cell-post");
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-post");
    } else if (cell.getAttribute("Method").toLowerCase() === "put") {
      ApiCell.setAttribute("class", "api-cell api-cell-put");
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-put");
    } else if (cell.getAttribute("Method").toLowerCase() === "patch") {
      ApiCell.setAttribute("class", "api-cell api-cell-patch");
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-patch");
    } else if (cell.getAttribute("Method").toLowerCase() === "delete") {
      ApiCell.setAttribute("class", "api-cell api-cell-delete");
      ApiCellHeaderMethodBTN.setAttribute("class", "api-cell-header-method-btn api-cell-header-method-btn-delete");
    }
    ApiCellHeaderMethodTitle.setAttribute("class", "api-cell-header-method-title");
    ApiCellFooter.setAttribute("class", "api-cell-footer");
    ApiCellFooterUri.setAttribute("class", "api-cell-footer-uri");

    ApiCellHeaderMethodBTN.innerHTML = cell.getAttribute("Method", "");
    ApiCellHeaderMethodTitle.innerHTML = cell.getAttribute("Title", "");
    ApiCellFooterUri.innerHTML = cell.getAttribute("Uri", cell.getAttribute("Host_url"));

    return ApiCell;
  }
}
