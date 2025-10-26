import rootReducer from "../reducer/root-reducer";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import authMiddleware from "../middlewares/authMiddleware";

const middleware = [...getDefaultMiddleware(), authMiddleware];

const isDev = () => {
  return process.env.REACT_APP_BASE_URL?.indexOf("localhost") !== -1;
};

export default configureStore({
  reducer: rootReducer,
  middleware,
  devTools: isDev(),
});
