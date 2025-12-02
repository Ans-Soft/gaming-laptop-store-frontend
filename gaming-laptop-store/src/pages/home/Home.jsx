import HeaderLogo from "../../components/HeaderLogo"
import Features from "../../components/Features"
import Button from "../../components/Button"
import Footer from "../../components/Footer"
import Whatsapp from "../../components/Whatsapp"
import "../../styles/global.css"
import CanvaEmbed from "../../components/CanvaEmbed.jsx"
import Notice from "../../components/Notice.jsx"

export default function Home() {
  return (
    <div className="homepage">
      <HeaderLogo />
      <Notice />
      <div className="two-column-layout">
          <CanvaEmbed /> 
          <Features />
      </div>
      <Button />
      <Footer />
      <Whatsapp />
    </div>
  )
}
