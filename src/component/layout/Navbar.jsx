import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav>
      {user && (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;