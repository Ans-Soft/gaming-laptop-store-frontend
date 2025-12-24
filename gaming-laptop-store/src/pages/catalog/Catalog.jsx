import React, { useEffect, useState } from "react";
import LandingHeader from "../../components/LandingHeader.jsx";
import { getCatalogProducts } from "../../services/CatalogService.jsx";
import ProductCard from "../../components/ProductCard.jsx";
import "../../styles/catalog.css";
import CanvaEmbed from "../../components/CanvaEmbed.jsx";

const Catalog = () => {
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchCatalog = async () => {
  //     try {
  //       const data = await getCatalogProducts();
  //       setProducts(data.results ?? []);
  //     } catch (error) {
  //       console.error("Error cargando catálogo:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCatalog();
  // }, []);

  return (
    <>
      <LandingHeader />
      <CanvaEmbed />
{/* 
      <section className="catalog-container">
        <h1>Catálogo</h1>

        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No hay productos disponibles</p>
        ) : (
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section> */}
    </>
  );
};

export default Catalog;
