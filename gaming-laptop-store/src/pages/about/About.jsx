import "../../styles/about.css"
import { FaBolt, FaCheckCircle   } from "react-icons/fa"
import { MdOutlineSecurity } from "react-icons/md";
import { IoMdTime } from "react-icons/io";


export default function About() {
  return (
    <section className="about-section" id="nosotros">
      <h2 className="section-title">
        Acerca de <span>Nosotros</span>
      </h2>

      <div className="about-content">
        <div className="about-text">
          <p>
            En <span className="highlight">Patecnológicos</span>, somos apasionados
            por la tecnología gaming. Nos especializamos en ofrecer los mejores
            portátiles gamer del mercado.
          </p>

          <p>
            Nuestra misión es proporcionar equipos de alta gama que combinen
            potencia, rendimiento y diseño.
          </p>

          <div className="about-stats">
            <div className="stat-card">
              <h1 className="highlight">5+</h1>
              <span className="about-desc">Años de Experiencia</span>
            </div>
            <div className="stat-card">
              <h1 className="highlight">500+</h1>
              <span className="about-desc">Clientes Satisfechos</span>
            </div>
          </div>
        </div>

        <div className="about-cards">
          <div className="info-card">
            <MdOutlineSecurity  className="about-icon"/>
            <h3>Garantía Oficial</h3>
            <p className="about-desc">Todos nuestros productos cuentan con garantía del fabricante</p>
          </div>
          <div className="info-card">
            <FaBolt className="about-icon" />
            <h3>Asesoría Experta</h3>
            <p className="about-desc">Te ayudamos a elegir el equipo perfecto para ti</p>
          </div>
          <div className="info-card">
            <FaCheckCircle className="about-icon"/>
            <h3>Calidad</h3>
            <p className="about-desc">Equipos nuevos, open box y reacondicionados certificados</p> 
          </div>
          <div className="info-card">
            <IoMdTime className="about-icon"/>
            <h3>Soporte 24/7</h3>
            <p className="about-desc">Atención personalizada cuando lo necesites</p> 
            
          </div>
        </div>
      </div>
    </section>
  );
}

