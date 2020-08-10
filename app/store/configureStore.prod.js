import { createBrowserHistory } from "history";
import { applyMiddleware, createStore } from "redux";
import { routerMiddleware } from "react-router-redux";
import rootReducer from "../reducers/rootReducer";
import thunk from "redux-thunk";

export const history = createBrowserHistory();
const middleware = routerMiddleware(history);

export function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk, middleware)
  );
}
