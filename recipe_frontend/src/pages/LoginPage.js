import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login form to authenticate and store JWT. */
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="h1">Welcome back</h1>
      <p className="muted">Log in to access your saved recipes.</p>
      <div className="spacer"></div>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        {err && (
          <p className="muted" role="alert">
            {err}
            {String(err || '').toLowerCase().includes('failed to fetch') ? ' — Check REACT_APP_API_BASE and backend CORS.' : ''}
          </p>
        )}
        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
          <Link className="link" to="/signup">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
