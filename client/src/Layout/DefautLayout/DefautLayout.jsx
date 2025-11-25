import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import Navbar from "../../Components/Navbar/Navbar";
import Chat from "../../Components/Chat/Chat";
import ScrollToTop from "../../Components/ScrollToTop/ScrollToTop";
import Breadcrumbs from "../../Components/Breadcrumbs/Breadcrumbs";

const DefautLayout = () => {
  return (
    <>
      <Navbar />
      <Breadcrumbs />
      <Outlet />
      <Chat />
      <ScrollToTop />
      <Footer />
    </>
  );
};

export default DefautLayout;
