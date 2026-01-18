import { combineReducers } from "@reduxjs/toolkit";
import tokenReducer from "./slices/token.slice";
import authReducer from "./slices/auth.slice";

const rootReducer = combineReducers({
  token: tokenReducer,
  auth: authReducer,
});

export default rootReducer;
