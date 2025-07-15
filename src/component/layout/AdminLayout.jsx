import Navbar from './Navbar';

const AdminLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;