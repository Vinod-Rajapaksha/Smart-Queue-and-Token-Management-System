import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "../../store";
import { router } from "../routes";
import ToastProvider from "./ToastProvider";
import AuthProvider from "./AuthProvider";

export default function AppProviders() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider/>
          <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}
