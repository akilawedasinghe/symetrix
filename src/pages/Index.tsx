
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user?.role === 'support') {
        navigate('/dashboard/support');
      } else {
        navigate('/dashboard/client');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        symetrix360 Portal
      </h1>
      <p className="text-lg text-muted-foreground">
        Redirecting to your dashboard...
      </p>
    </div>
  );
};

export default Index;
