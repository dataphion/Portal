import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { configureStore, history } from "./store/configureStore";
import Root from "./Containers/Root";
import { Provider } from "./Containers/Context";
import "rsuite/dist/styles/rsuite.min.css";
import "antd/dist/antd.css";
import "react-image-lightbox/style.css";

let store = configureStore();

render(
  <Provider>
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>
  </Provider>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./Containers/Root", () => {
    const newConfigureStore = require("./store/configureStore");
    const newStore = newConfigureStore.configureStore();
    const newHistory = newConfigureStore.history;
    const NewRoot = require("./Containers/Root").default;
    render(
      <Provider>
        <AppContainer>
          <NewRoot store={newStore} history={newHistory} />
        </AppContainer>
      </Provider>,
      document.getElementById("root")
    );
  });
}

exports.store = store;
