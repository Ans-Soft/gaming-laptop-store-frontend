import "../../styles/admin/searchBox.css";
import { Search, Plus } from "lucide-react";


const SearchBox = ({ onRegisterClick, registerLabel = "Registrar"}) => {
  return (
    <div className="table-filters">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Buscar por nombre o email..." />
          </div>
          <button className="btn-register" onClick={onRegisterClick}>
            <Plus size={18} /> {registerLabel}
          </button>
        </div>
  )
}

export default SearchBox;