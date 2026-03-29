import React from "react";

interface ActionButton {
    label: string;
    onClick: () => void;
    color?: string;
    icon: React.ReactNode;
}

interface QuickActionsProps {
    actions: ActionButton[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {

    return (
        <div className="bg-white border-0 shadow-sm rounded-lg mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 sm:pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`w-full sm:w-auto border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors ${action.color || "bg-[#2C3E50]/10 text-[#2C3E50] hover:bg-[#2C3E50]/20"}`}
                        >
                            <span className="mr-2 inline-flex">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickActions;