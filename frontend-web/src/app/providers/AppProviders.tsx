import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "../../store";
import { router } from "../routes";

export default function AppProviders() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
