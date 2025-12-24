import { ShoppingCart } from "lucide-react";

// 👉 reutilizamos la misma lógica que ya usas en admin
const formatCurrency = (value) => {
  return "$" + Number(value).toLocaleString("en-US");
};

const ProductCard = ({ product }) => {
  const base = product.base_product;

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={base.images?.[0]?.image || "/placeholder.png"}
          alt={base.model_name}
        />
        <span className="price-badge">
          {formatCurrency(product.price)}
        </span>
      </div>

      <div className="product-content">
        <div className="tags">
          {base.categories.map((cat) => (
            <span key={cat.name} className="tag">
              {cat.name}
            </span>
          ))}
          <span className="tag muted">{base.brand.name}</span>
        </div>

        <h3>{base.model_name}</h3>

        <p className="subtitle">
          {base.long_description}
        </p>

        <button className="primary-btn">
          <ShoppingCart size={18} />
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
