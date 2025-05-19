import React, { useState } from 'react';
import { useFitness } from '@/context/FitnessContext';
import { DatabaseService } from '@/services/database';
import { toast } from 'sonner';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsAuthenticated, setUserEmail } = useFitness();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = DatabaseService.getInstance();
      const user = await db.getUserByEmail(email);
      
      if (!user) {
        toast.error('User not found');
        return;
      }

      if (user.password !== password) {
        toast.error('Invalid password');
        return;
      }

      setUserEmail(email);
      setIsAuthenticated(true);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Sign In
      </button>
    </form>
  );
}; 