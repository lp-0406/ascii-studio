import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import useAuth from '../hooks/useAuth.js';
import { getErrorMessage } from '../services/api.js';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginUser(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Sign in</h1>
        <Alert>{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black border border-gray-700 rounded-md px-3 py-2"
            />
          </div>
          <Button disabled={submitting} className="w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-accent hover:underline">Create one</Link>
        </p>
        <p className="text-xs text-gray-600 mt-4">
          Demo login: admin@asciistudio.dev / Demo@1234
        </p>
      </Card>
    </div>
  );
}
