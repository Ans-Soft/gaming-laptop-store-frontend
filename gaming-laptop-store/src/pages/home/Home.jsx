import HeaderLogo from "../../components/HeaderLogo"
import Notice from "../../components/Notice"
import Features from "../../components/Features"
import Button from "../../components/Button"
import Footer from "../../components/Footer"
import Whatsapp from "../../components/Whatsapp"
import "../../styles/global.css"

export default function Home() {
  return (
    <div className="homepage">
      <HeaderLogo />
      <Notice />
      <p className="subtitle">
        Próximamente la mejor experiencia en <span className="highlight">portátiles gamer</span> de alta gama
      </p>
      <Features />
      <Button />
      <Footer />
      <Whatsapp />
    </div>
  )
}
