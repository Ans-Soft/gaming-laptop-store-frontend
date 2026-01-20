import HeaderLogo from "../../components/HeaderLogo"
import Features from "../../components/Features"
import Button from "../../components/Button"
import Footer from "../../components/Footer"
import Whatsapp from "../../components/Whatsapp"
import "../../styles/global.css"
import About from "../about/About.jsx"
import Shipping from "../shipping/Shipping.jsx"
import LandingHeader from "../../components/LandingHeader.jsx"

export default function Home() {
  return (
    <div className="homepage">
      <LandingHeader/>
      <HeaderLogo />
      <div className="two-column-layout">
          {/*<CanvaEmbed />*/} 
          <Features />
      </div>
      <About/>
      <Shipping/>
      <Button />
      <Footer />
      <Whatsapp />
    </div>
  )
}
