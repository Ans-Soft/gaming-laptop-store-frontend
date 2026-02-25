import { useRef, useEffect } from "react"
import "../../styles/promotionsBanner.css"

const WHATSAPP_URL =
  "https://wa.me/573012661811?text=quiero%20conocer%20sus%20promociones"

export default function PromotionsBanner() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add("is-visible")
            // Stop observing once visible — keep it visible on scroll out
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section className="promo-section" ref={sectionRef}>
      <div className="promo-inner">
        <span className="promo-badge">Próximamente</span>

        <h2 className="promo-title">Ofertas y Promociones</h2>

        <p className="promo-subtitle">
          Estamos preparando ofertas exclusivas en laptops gaming. Habla con un
          asesor para conocer las promociones disponibles.
        </p>

        <a
          className="promo-cta"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hablar con un asesor
        </a>
      </div>
    </section>
  )
}
