import "../styles/header.css";

export default function HeaderLogo() {
  return (
    <header className="header" id="inicio">
      <div className="header-content">
        <h1 className="logo-text">
          Pate<span className="highlight">cnologicos</span>
        </h1>

        <h2 className="header-subtitle">
          Tu tienda especializada en portátiles gamer
        </h2>

        <p className="header-description">
          Descubre la mejor selección de{" "}
          <span className="highlight">laptops gaming</span> de alta gama.
          Potencia, <br />rendimiento y diseño para llevarte al siguiente nivel.
        </p>
      </div>
    </header>
  );
}
