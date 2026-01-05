import { Navigate } from "react-router-dom";

// Redirect to rutas list - the main module
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
