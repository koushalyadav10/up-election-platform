import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface RolePermissions {
  can_edit: boolean;
  can_import: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  role: UserRole;
  passcode: string;
  permissions: RolePermissions;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (codeOrUserId: string, password?: string) => Promise<{ success: boolean; message: string; role: UserRole }>;
  setViewerMode: () => void;
}

const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: { can_edit: true, can_import: true, is_admin: true },
  editor: { can_edit: true, can_import: false, is_admin: false },
  viewer: { can_edit: false, can_import: false, is_admin: false }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('up_electoral_role') as UserRole) || 'viewer';
  });
  const [passcode, setPasscode] = useState<string>(() => {
    return localStorage.getItem('up_electoral_passcode') || '';
  });
  const [permissions, setPermissions] = useState<RolePermissions>(() => {
    const savedRole = (localStorage.getItem('up_electoral_role') as UserRole) || 'viewer';
    return DEFAULT_PERMISSIONS[savedRole] || DEFAULT_PERMISSIONS.viewer;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Validate stored passcode on initial mount
  useEffect(() => {
    const verifyStoredAuth = async () => {
      const storedPass = localStorage.getItem('up_electoral_passcode');
      if (storedPass) {
        try {
          const res = await fetch('/api/strategy/assembly/auth/verify-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passcode: storedPass })
          });
          const data = await res.json();
          if (data.valid) {
            setRole(data.role as UserRole);
            setPermissions(data.permissions);
          } else {
            setViewerMode();
          }
        } catch (e) {
          console.warn('Auth verification failed on boot:', e);
        }
      }
    };
    verifyStoredAuth();
  }, []);

  const login = async (codeOrUserId: string, password?: string): Promise<{ success: boolean; message: string; role: UserRole }> => {
    try {
      const payload = password ? { user_id: codeOrUserId.trim(), password: password.trim() } : { passcode: codeOrUserId.trim() };
      const res = await fetch('/api/strategy/assembly/auth/verify-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.valid) {
        const newRole = data.role as UserRole;
        const effectiveKey = data.admin_key || (password ? `${codeOrUserId.trim()}:${password.trim()}` : codeOrUserId.trim());
        setRole(newRole);
        setPasscode(effectiveKey);
        setPermissions(data.permissions);
        localStorage.setItem('up_electoral_role', newRole);
        localStorage.setItem('up_electoral_passcode', effectiveKey);
        return { success: true, message: data.message, role: newRole };
      } else {
        return { success: false, message: data.message || 'अमान्य क्रेडेंशियल', role: 'viewer' };
      }
    } catch (e) {
      return { success: false, message: 'सर्वर प्रमाणीकरण में त्रुटि', role: 'viewer' };
    }
  };

  const setViewerMode = () => {
    setRole('viewer');
    setPasscode('');
    setPermissions(DEFAULT_PERMISSIONS.viewer);
    localStorage.setItem('up_electoral_role', 'viewer');
    localStorage.removeItem('up_electoral_passcode');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        passcode,
        permissions,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        setViewerMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
