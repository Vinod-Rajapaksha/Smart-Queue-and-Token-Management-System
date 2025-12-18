import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "../../store";
import { router } from "../routes";
import ToastProvider from "./ToastProvider";

export default function AppProviders() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </Provider>
  );
}
