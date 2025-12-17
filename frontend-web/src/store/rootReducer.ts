import { combineReducers } from "@reduxjs/toolkit";

import auth from "./slices/auth.slice";
import user from "./slices/user.slice";
import branch from "./slices/branch.slice";
import counter from "./slices/counter.slice"; 
import queue from "./slices/queue.slice";
import token from "./slices/token.slice";
import rating from "./slices/rating.slice";
import analytics from "./slices/analytics.slice";

const rootReducer = combineReducers({
  auth,
  user,
  branch,
  counter,
  queue,
  token,
  rating,
  analytics,
});

export default rootReducer;
