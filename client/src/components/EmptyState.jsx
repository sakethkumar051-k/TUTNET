const EmptyState = ({ 
    icon = '📭', 
    title = 'No items found', 
    description = 'Get started by creating your first item.',
    actionLabel,
    onAction,
    children 
}) => {
    return (
        <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                    {actionLabel}
                </button>
            )}
            {children}
        </div>
    );
};

export default EmptyState;

