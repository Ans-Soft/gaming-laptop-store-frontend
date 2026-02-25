import { Outlet } from "react-router-dom";
import LandingHeader from "./LandingHeader";
import Footer from "./Footer";
import Whatsapp from "./Whatsapp";
import ScrollToTop from "./ScrollToTop";
import "../styles/global.css";

export default function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <LandingHeader />
      <Outlet />
      <Footer />
      <Whatsapp />
    </>
  );
}
