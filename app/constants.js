const host = process.env.HOST || "https://admin.dataphion.com/";
const apiExecuteHost = process.env.API_EXEC_HOST || "https://aitester.dataphion.com/api/Runtest";
const sockethost = process.env.SOCKET_HOST || "https://admin.dataphion.com";
const image_host = process.env.IMAGE_HOST || "https://aitester.dataphion.com";
const error_image_host = process.env.ERROR_IMAGE_HOST || "https://admin.dataphion.com";

// const host = process.env.HOST || "http://localhost:1337/";
// const apiExecuteHost = process.env.API_EXEC_HOST || "http://localhost:9501/api/Runtest";
// const sockethost = process.env.SOCKET_HOST || "http://localhost:1337";
// const image_host = process.env.IMAGE_HOST || "http://localhost:4200";
// const error_image_host = process.env.ERROR_IMAGE_HOST || "http://localhost:4200";

const constants = {
  error_image_host: error_image_host,
  socket_url: sockethost,
  image_host: image_host,
  extension_id: "ilifkjninjhohkiembejnfaanokppkaa",
  apiexecutehost: host + "testcases/api/Runtest",
  register: host + "auth/local/register",
  login: host + "auth/local",
  forgotPassword: host + "auth/forgot-password",
  resetPassword: host + "auth/reset-password",
  feedbacks: host + "feedbacks",
  features: host + "features",
  environments: host + "environments",
  upload: host + "upload",
  dbregistrations: host + "dbregistrations",
  datasource: host + "datasources",
  objectrepositories: host + "objectrepositories",
  testcases: host + "testcases",
  testcasecomponents: host + "testcasecomponents",
  testcasegroups: host + "testcasegroups",
  testsuites: host + "testsuites",
  testsessionexecutions: host + "testsessionexecutions",
  swaggerFile: host + "applications/swagger",
  swaggerUpadte: host + "applications/swaggerupdate",
  swaggerconfirm: host + "applications/swaggerconfirm",
  endpointpacks: host + "endpointpacks",
  endpoints: host + "endpoints",
  flows: host + "flows",
  graphql: host + "graphql",
  dbregistrationsCheck: host + "dbregistrations/check",
  executequery: host + "dbregistrations/execute",
  sourceregistration: host + "sourceregistrations",
  application: host + "applications",
  healedcomponent: host + "healedcomponents",
  nativeagents: host + "nativeagents",
  devicetype: host + "devicetypes/device_validate",
  relationgraph: host + "relationgraphs",
  smtpdetails: host + "smtpdetails",
  jobs: host + "jobs",
  seleniumConfigure: host + "selenium-configures",

  // colors
  PRIMARY_COLOR: "#1039A6",
  SECONDARY_COLOR: "#6D15B9",
  HIGHLIGHT_COLOR: "#7346eb",
  HIGHLIGHT_END_COLOR: "#2a4a65",
  ORANGE: "#ff9879",
  GREEN: "#1DD1A1",
};

export default constants;
