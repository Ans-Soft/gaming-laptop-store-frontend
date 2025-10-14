import "../../styles/admin/searchBox.css";
import { Search, Plus } from "lucide-react";


const SearchBox = () => {
  return (
    <div className="table-filters">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Buscar por nombre o email..." />
          </div>
          <button className="btn-register">
            <Plus size={18} /> Registrar Usuario
          </button>
        </div>
  )
}

export default SearchBox;