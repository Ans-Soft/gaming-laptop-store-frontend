import React from "react";
import LandingHeader from "../../components/LandingHeader.jsx";
import Whatsapp from "../../components/Whatsapp";

import "../../styles/global.css";
import "../../styles/privacy.css";

const PrivacyPolicy = () => {
  return (
    <div className="homepage">
      <LandingHeader />

      <main className="privacy-policy" role="main">
        <section className="privacy-container">
          <header>
            <h1>Política de Privacidad</h1>
            <p className="privacy-updated">
              Última actualización: Enero 2026
            </p>
          </header>

          <article>
            <h2>1. Identidad del responsable</h2>
            <p>
              <strong>Patecnologicos</strong>, persona natural identificada con
              documento <strong>1112388931-5</strong>, con domicilio en Colombia,
              es responsable del tratamiento de los datos personales recopilados
              a través de sus canales digitales.
            </p>

            <p>
              Sitio web:{" "}
              <a
                href="https://patecnologicos.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://patecnologicos.com/
              </a>
            </p>

            <p>
              Correo de contacto:{" "}
              <a href="mailto:partesyaccesoriostec@gmail.com">
                partesyaccesoriostec@gmail.com
              </a>
            </p>

            <p>WhatsApp de atención: +57 301 266 1811</p>
          </article>

          <article>
            <h2>2. Alcance de esta política</h2>
            <p>
              Esta Política de Privacidad aplica al tratamiento de datos
              personales realizado a través del sitio web de Patecnologicos y
              del canal de atención por WhatsApp Business Platform (Cloud API de
              Meta).
            </p>
          </article>

          <article>
            <h2>3. Información que recopilamos</h2>
            <p>
              El sitio web funciona como una landing page informativa y no
              recopila datos personales de forma automática.
            </p>

            <p>
              Los datos personales solo se recopilan cuando el usuario inicia
              voluntariamente una conversación por WhatsApp, y de manera manual,
              durante procesos de atención o compra.
            </p>

            <ul>
              <li>Nombre</li>
              <li>Número de teléfono</li>
              <li>Información relacionada con pedidos</li>
            </ul>
          </article>

          <article>
            <h2>4. Uso de la información</h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>

            <ul>
              <li>Procesar pedidos</li>
              <li>Gestionar la comunicación solicitada por el usuario</li>
              <li>Atención al cliente</li>
            </ul>

            <p>
              Patecnologicos no envía mensajes promocionales automáticos ni
              realiza campañas de marketing sin consentimiento previo y
              explícito.
            </p>
          </article>

          <article>
            <h2>5. Uso de WhatsApp Business Platform (Meta)</h2>
            <p>
              Patecnologicos utiliza WhatsApp Business Platform (Cloud API)
              proporcionada por Meta Platforms, Inc.
            </p>

            <ul>
              <li>El usuario inicia siempre la conversación</li>
              <li>El chatbot responde únicamente mensajes básicos de saludo</li>
              <li>No se envían mensajes no solicitados</li>
            </ul>

            <p>
              El tratamiento de datos a través de WhatsApp también está sujeto a
              las políticas de privacidad de Meta Platforms, Inc.
            </p>
          </article>

          <article>
            <h2>6. Conservación de la información</h2>
            <p>
              Los datos personales se conservarán únicamente durante el tiempo
              necesario para cumplir la finalidad para la cual fueron
              recopilados y hasta que el usuario solicite su eliminación.
            </p>
          </article>

          <article>
            <h2>7. Compartición de información con terceros</h2>
            <p>
              Patecnologicos no vende, cede ni comparte datos personales con
              terceros.
            </p>

            <p>
              Los datos pueden ser procesados únicamente por Meta Platforms,
              Inc., como proveedor de WhatsApp Business Platform.
            </p>
          </article>

          <article>
            <h2>8. Derechos del titular de los datos</h2>
            <p>El usuario tiene derecho a:</p>

            <ul>
              <li>Acceder a sus datos personales</li>
              <li>Solicitar corrección</li>
              <li>Solicitar eliminación</li>
              <li>Revocar su consentimiento</li>
            </ul>

            <p>
              Para ejercer estos derechos, puede escribir a{" "}
              <a href="mailto:partesyaccesoriostec@gmail.com">
                partesyaccesoriostec@gmail.com
              </a>
              .
            </p>
          </article>

          <article>
            <h2>9. Seguridad de la información</h2>
            <p>
              Patecnologicos adopta medidas razonables de seguridad para proteger
              la información personal y evitar accesos no autorizados.
            </p>
          </article>

          <article>
            <h2>10. Cambios en la política de privacidad</h2>
            <p>
              Patecnologicos se reserva el derecho de modificar esta Política de
              Privacidad en cualquier momento. Los cambios serán publicados en
              esta página.
            </p>
          </article>
        </section>
      </main>

      <Whatsapp />
    </div>
  );
};

export default PrivacyPolicy;
