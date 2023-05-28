import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { productReducer } from "./reducers/productReducer";
import { composeWithDevTools } from "redux-devtools-extension";

const reducer = combineReducers({
  // reducers
  products: productReducer,
});

let initialState = {};

const middleware = [thunk];

// Call composeWithDevTools and pass middleware
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
