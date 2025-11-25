

const AdminHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold admin-header-title">{title}</h1>
        {subtitle && <p className="text-sm admin-header-subtitle mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
};

export default AdminHeader;
