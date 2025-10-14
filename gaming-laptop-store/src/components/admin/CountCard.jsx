import { Package } from "lucide-react";
import "../../styles/admin/countCard.css";

const CountCard = ({ stats = [] }) => {
  return (
    <div className="table-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          {/* Si no se pasa un icono, usa uno por defecto */}
          {stat.icon || <Package/>}
          <div>
            <p>{stat.label}</p>
            <h3>{stat.count}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CountCard;
