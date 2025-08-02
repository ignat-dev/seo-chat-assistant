import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '../lib/firebase';

const AuthForm = () => {
  const auth = getAuth(firebaseApp);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </p>
    </form>
  );
};

export default AuthForm;
