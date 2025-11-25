import { RefreshCw } from 'lucide-react'; // Make sure to import the icon

const FullPageRefreshButton = ({ content, className }) => {

  const handleRefresh = () => {
    // This command tells the browser to reload the current page
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className={className}
      aria-label="Reload page"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      {content}
    </button>
  );
};

export default FullPageRefreshButton;