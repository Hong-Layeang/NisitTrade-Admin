import React from "react";
import { Navigate } from "react-router-dom";

const AddProduct: React.FC = () => {
  return <Navigate to="/admin-shop" replace />;
};

export default AddProduct;
