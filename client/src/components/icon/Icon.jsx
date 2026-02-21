import { Link } from "react-router-dom"
import "./icon.css"

export default function Icon() {
  return (
    <Link to="/write" className="icon">
            <i className="fa-solid fa-pen-to-square"></i>
    </Link>
  )
}
