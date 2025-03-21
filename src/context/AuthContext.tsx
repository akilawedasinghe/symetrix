import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ERPSystem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, erpSystem?: ERPSystem) => Promise<void>;
  logout: () => void;
  getAllUsers: () => User[];
  createUser: (user: Partial<User>, password: string) => Promise<User>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for our demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    erpSystem: undefined
  },
  {
    id: '2',
    name: 'Support User',
    email: 'support@example.com',
    role: 'support',
    createdAt: new Date('2023-01-02'),
    erpSystem: undefined
  },
  {
    id: '3',
    name: 'Client User',
    email: 'client@example.com',
    role: 'client',
    createdAt: new Date('2023-01-03'),
    erpSystem: 's4_hana'
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'client',
    createdAt: new Date('2023-02-15'),
    erpSystem: 'sap_bydesign'
  },
  {
    id: '5',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'support',
    createdAt: new Date('2023-03-10'),
    erpSystem: undefined
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user in mock data
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser && password === 'password') { // Simple password check
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${foundUser.name}!`,
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'client', erpSystem?: ERPSystem): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user exists
      if (users.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Validate ERP system for clients
      if (role === 'client' && !erpSystem) {
        throw new Error('ERP system is required for client accounts');
      }
      
      // Create new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        name,
        email,
        role,
        createdAt: new Date(),
        erpSystem: role === 'client' ? erpSystem : undefined
      };
      
      // Add the new user to our mock database
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Log in the new user if it's a client (self-registration)
      if (role === 'client') {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${name}!`,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  // Admin functions for user management
  const getAllUsers = () => {
    return users;
  };

  const createUser = async (userData: Partial<User>, password: string) => {
    // Check if user is an admin
    if (user?.role !== 'admin') {
      throw new Error('Only administrators can create new users');
    }
    
    if (!userData.name || !userData.email || !userData.role) {
      throw new Error('Missing required user information');
    }
    
    // Check if user exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date(),
      erpSystem: userData.erpSystem
    };
    
    // Update our mock database
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    toast({
      title: 'User created',
      description: `${newUser.name} has been added successfully.`,
    });
    
    return newUser;
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    // Check if user is an admin
    if (user?.role !== 'admin') {
      throw new Error('Only administrators can update users');
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user
    const updatedUser = {
      ...users[userIndex],
      ...userData
    };
    
    const newUsers = [...users];
    newUsers[userIndex] = updatedUser;
    setUsers(newUsers);
    
    toast({
      title: 'User updated',
      description: `${updatedUser.name}'s profile has been updated.`,
    });
    
    return updatedUser;
  };

  const deleteUser = async (userId: string) => {
    // Check if user is an admin
    if (user?.role !== 'admin') {
      throw new Error('Only administrators can delete users');
    }
    
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      throw new Error('User not found');
    }
    
    // Remove user from our mock database
    setUsers(users.filter(u => u.id !== userId));
    
    toast({
      title: 'User deleted',
      description: `${userToDelete.name} has been removed from the system.`,
    });
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    // Check if user is an admin
    if (user?.role !== 'admin') {
      throw new Error('Only administrators can reset passwords');
    }
    
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) {
      throw new Error('User not found');
    }
    
    // In a real app, this would hash the password and update it in the database
    // For this demo, we'll just show a success message
    
    toast({
      title: 'Password reset',
      description: `Password has been reset for ${userToUpdate.name}.`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
