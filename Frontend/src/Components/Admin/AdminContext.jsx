// Frontend/src/context/AdminContext.jsx
import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(
        JSON.parse(localStorage.getItem('adminInfo')) || null
    );

    const login = (data) => {
        localStorage.setItem('adminInfo', JSON.stringify(data));
        setAdmin(data);
    };

    const logout = () => {
        localStorage.removeItem('adminInfo');
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);