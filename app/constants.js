const host = "/";
const image_host = "";
const error_image_host = "";

let protocol = window.location.protocol;
let slashes = protocol.concat("//");
let sockio_host = slashes.concat(window.location.hostname);
const port = window.location.port;
if (port) {
  sockio_host += ":" + port;
}

// const host = "http://localhost:4200/";
// const apiExecuteHost = "http://localhost:9501/api/Runtest";
// const sockio_host = "http://localhost:4200";
// const image_host = "http://localhost:4200";
// const error_image_host = "http://localhost:4200";

const constants = {
  error_image_host: error_image_host,
  socket_url: sockio_host,
  image_host: image_host,
  extension_id: "ilifkjninjhohkiembejnfaanokppkaa",
  apiexecutehost: host + "api/testcases/api/Runtest",
  register: host + "api/auth/local/register",
  login: host + "api/auth/local",
  forgotPassword: host + "api/auth/forgot-password",
  resetPassword: host + "api/auth/reset-password",
  feedbacks: host + "api/feedbacks",
  features: host + "api/features",
  environments: host + "api/environments",
  upload: host + "api/upload",
  dbregistrations: host + "api/dbregistrations",
  datasource: host + "api/datasources",
  objectrepositories: host + "api/objectrepositories",
  testcases: host + "api/testcases",
  testcasecomponents: host + "api/testcasecomponents",
  testcasegroups: host + "api/testcasegroups",
  testsuites: host + "api/testsuites",
  testsessionexecutions: host + "api/testsessionexecutions",
  swaggerFile: host + "api/applications/swagger",
  swaggerUpadte: host + "api/applications/swaggerupdate",
  swaggerconfirm: host + "api/applications/swaggerconfirm",
  endpointpacks: host + "api/endpointpacks",
  endpoints: host + "api/endpoints",
  flows: host + "api/flows",
  graphql: host + "api/graphql",
  dbregistrationsCheck: host + "api/dbregistrations/check",
  kafkaoffset: host + "api/dbregistrations/check",
  executequery: host + "api/dbregistrations/execute",
  sourceregistration: host + "api/sourceregistrations",
  application: host + "api/applications",
  healedcomponent: host + "api/healedcomponents",
  nativeagents: host + "api/nativeagents",
  devicetype: host + "api/devicetypes/device_validate",
  relationgraph: host + "api/relationgraphs",
  smtpdetails: host + "api/smtpdetails",
  jobs: host + "api/jobs",
  seleniumConfigure: host + "api/selenium-configures",
  send_email: host + "api/auth/send-email-confirmation",
  // colors
  PRIMARY_COLOR: "#1039A6",
  SECONDARY_COLOR: "#6D15B9",
  HIGHLIGHT_COLOR: "#7346eb",
  HIGHLIGHT_END_COLOR: "#2a4a65",
  ORANGE: "#ff9879",
  GREEN: "#1DD1A1",
};

export default constants;
