import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddProductModal, { AddProductPayload } from "../modals/addProductModal.tsx";

interface ActionButton {
    label: string;
    onClick: () => void;
    color?: string;
    icon: React.ReactNode;
}

interface QuickActionsProps {
    actions: ActionButton[];
}

const QuickActions: React.FC<QuickActionsProps> = ({}) => {
    const navigate = useNavigate();

    const Adminshop = () => {
        navigate("/admin-shop");
    };

    const UserProduct = () => {
        navigate("/users-product");
    };

    const handleManageUser = () => {
        navigate("/users");
    };

    const [openAdd, setOpenAdd] = useState(false);

    // This function handles adding the product
    const handleAddProduct = (data: AddProductPayload) => {
        console.log("Product added:", data);
        setOpenAdd(false);
    };

    return (
        <div className="bg-white border-0 shadow-sm rounded-lg mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 sm:pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    <button
                        onClick={Adminshop}
                        className="w-full sm:w-auto bg-[#2C3E50]/10 text-[#2C3E50] hover:bg-[#2C3E50]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Adminshop
                    </button>
                    <button
                        onClick={handleManageUser}
                        className="w-full sm:w-auto bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Users
                    </button>
                    <button
                        onClick={UserProduct}
                        className="w-full sm:w-auto bg-[#8E44AD]/10 text-[#8E44AD] hover:bg-[#8E44AD]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        UserProduct
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpenAdd(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                        title="Add Product"
                    >
                        <i className="bi bi-plus-circle" />
                        Add Product
                    </button>
                </div>
            </div>
            {/* Add Product Modal */}
            <AddProductModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSubmit={handleAddProduct}
            />
        </div>
    );
};

export default QuickActions;