import { useRef, useEffect } from "react"
import "../../styles/productLinesSection.css"

const WA_BASE = "https://wa.me/573012661811?text="

const LAPTOP_LINES = [
  { name: "ASUS STRIX",    img: "ASUS STRIX.jpg" },
  { name: "ASUS ZEPHYRUS", img: "ASUS ZEPHYRUS.jpg" },
  { name: "ASUS TUF",      img: "ASUS TUF.jpg" },
  { name: "LENOVO LOQ",    img: "LENOVO LOQ.jpg" },
  { name: "LENOVO LEGION", img: "LENOVO LEGION.jpg" },
  { name: "HP VICTUS",     img: "HP VICTUS.jpg" },
  { name: "HP OMEN",       img: "HP OMEN.jpg" },
  { name: "MSI",           img: "MSI.jpg" },
  { name: "ACER HELIOS",   img: "ACER HELIOS.jpg" },
  { name: "ACER NITRO",    img: "ACER NITRO.jpg" },
]

const OTHER_PRODUCTS = [
  { name: "HARDWARE",          img: "HARDWARE.png" },
  { name: "TARJETAS GRÁFICAS", img: "TARJETAS GRAFICAS.jpg" },
  { name: "CONSOLAS",          img: "CONSOLAS.jpg" },
  { name: "PC DE MESA",        img: "PC.jpg" },
  { name: "APPLE",             img: "APPLE.jpg" },
]

function buildWaUrl(name) {
  return WA_BASE + encodeURIComponent(`Hola, quiero conocer sobre sus productos de ${name}`)
}

export default function ProductLinesSection() {
  const sectionRef = useRef(null)
  const laptopTrackRef = useRef(null)
  const otherTrackRef = useRef(null)

  // Fade-in on scroll
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add("is-visible")
            observer.unobserve(section)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Horizontal scroll on Shift+wheel — non-passive so preventDefault works
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.shiftKey) {
        e.preventDefault()
        e.currentTarget.scrollLeft += e.deltaY
      }
    }

    const laptopTrack = laptopTrackRef.current
    const otherTrack = otherTrackRef.current

    if (laptopTrack) {
      laptopTrack.addEventListener("wheel", handleWheel, { passive: false })
    }
    if (otherTrack) {
      otherTrack.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (laptopTrack) {
        laptopTrack.removeEventListener("wheel", handleWheel)
      }
      if (otherTrack) {
        otherTrack.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  return (
    <section className="pl-section" ref={sectionRef}>
      <div className="pl-inner">

        <div className="pl-group">
          <h2 className="pl-group-title">Línea de portátiles</h2>
          <div className="pl-track" ref={laptopTrackRef}>
            {LAPTOP_LINES.map(({ name, img }) => (
              <a
                key={name}
                className={`pl-card${img ? " pl-card--img" : ""}`}
                href={buildWaUrl(name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {img ? (
                  <img
                    src={`/assets/home/lineas-portatiles/${img}`}
                    alt={name}
                    className="pl-card-image"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                ) : (
                  name
                )}
              </a>
            ))}
          </div>
        </div>

        <div className="pl-group">
          <h2 className="pl-group-title">Otros productos</h2>
          <div className="pl-track" ref={otherTrackRef}>
            {OTHER_PRODUCTS.map(({ name, img }) => (
              <a
                key={name}
                className={`pl-card${img ? " pl-card--img" : ""}`}
                href={buildWaUrl(name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {img ? (
                  <img
                    src={`/assets/home/otros-productos/${img}`}
                    alt={name}
                    className="pl-card-image"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                ) : (
                  name
                )}
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
