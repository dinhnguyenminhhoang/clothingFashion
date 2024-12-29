import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./Pages/Auth/Login/Login";
import Register from "./Pages/Auth/Register/Register";
import DefautLayout from "./Layout/DefautLayout/DefautLayout";
import Home from "./Pages/Home/Home";
import AdminLayout from "./Layout/AdminLayout/AdminLayout";
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DefautLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route element={<AdminLayout />}></Route>
        {/* <Route path="*" element={<PageNotFound />} />s */}
      </Route>
    )
  );

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
