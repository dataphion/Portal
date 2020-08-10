import { createBrowserHistory } from "history";
import { applyMiddleware, createStore, compose } from "redux";
import { routerMiddleware } from "react-router-redux";
import rootReducer from "../reducers/rootReducer";
import DevTools from "../Containers/DevTools";

import thunk from "redux-thunk";

export const history = createBrowserHistory();
const middleware = routerMiddleware(history);

export function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, middleware),
      DevTools.instrument()
    )
  );
}
