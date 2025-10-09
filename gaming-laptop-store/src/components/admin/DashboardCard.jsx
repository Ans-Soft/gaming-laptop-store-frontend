import { Link } from "react-router-dom";
import "./../../styles/admin/dashboardCard.css";

const DashboardCard = ({ icon, title, description, color, to }) => {
  return (
    <Link to={to} className="dashboard-card" style={{ borderColor: color }}>
      <div className="dashboard-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="dashboard-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
