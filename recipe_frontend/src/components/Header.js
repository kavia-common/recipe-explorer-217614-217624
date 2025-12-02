import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export function Header() {
  /** App header with brand, nav, and auth controls. */
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-badge">R</div>
          <div>
            Recipe Explorer <span className="badge">Ocean Pro</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>Search</NavLink>
          <NavLink to="/saved">Saved</NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/signup">Sign up</NavLink>
            </>
          ) : (
            <>
              <span className="muted" style={{ padding: '0 8px' }}>
                {user?.email || 'Signed in'}
              </span>
              <button className="btn" onClick={onLogout}>Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
