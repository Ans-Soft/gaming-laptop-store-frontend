import React from "react";
import "../../styles/admin/titleCrud.css"
import { Package } from "lucide-react"; 

const TitleCrud = ({ title, icon: Icon = Package, description }) => {
  return (
    <div className="table-header">
      <div>
        <h1>
          <Icon className="icon-title"/> {title}
        </h1>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default TitleCrud;
