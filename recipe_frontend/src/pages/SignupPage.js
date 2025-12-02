import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Signup form to create a new account. */
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await signup(email, password);
      navigate('/', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="h1">Create your account</h1>
      <p className="muted">Save recipes and access them anywhere.</p>
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
          <button className="btn secondary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
          <Link className="link" to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
