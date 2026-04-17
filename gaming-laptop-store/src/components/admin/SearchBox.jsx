import "../../styles/admin/searchBox.css";
import { Search, Plus } from "lucide-react";


const SearchBox = ({ onRegisterClick, registerLabel = "Registrar", searchTerm = "", onSearchChange, placeholder = "Buscar..." }) => {
  return (
    <div className="table-filters">
          {onSearchChange && (
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {onRegisterClick && (
            <button className="btn-register" onClick={onRegisterClick}>
              <Plus size={18} /> {registerLabel}
            </button>
          )}
        </div>
  )
}

export default SearchBox;