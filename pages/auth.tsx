import React, { useEffect, useState } from 'react';
import {nhost} from '../utils/nhost'
import {useAuthenticated} from '@nhost/nextjs'
import {useRouter} from 'next/router'
import Navbar from '../components/Navbar';

const Auth: React.FC = () => {

  const isAuthenticated=useAuthenticated()
  const router=useRouter()

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [currentState, setCurrentState] = useState<'Login' | 'Sign Up'>('Login');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (currentState === 'Sign Up') {
        const result=await nhost.auth.signUp({email,password})
        if (result.error) {
          console.error('Sign-up error:', result.error);
          throw new Error(result.error.message);
        }
        console.log('Sign-up result:', result);
        alert('Sign-up successful');
      } else {
        const result=await nhost.auth.signIn({email,password})
        if (result.error) {
          console.error('Login error:', result.error);
          throw new Error(result.error.message);
        }
        console.log('Login result:', result);
        alert('Login successful');
        router.push('/')
      }

    } catch (error) {
      alert('Authentication failed: ' + (error as Error).message);
    }
  };

  useEffect(()=>{
    if(isAuthenticated){
      router.push('/')
    }
  },[isAuthenticated])

  return (
    <div>
      <Navbar/>
      <div>
      <form
        className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'
        onSubmit={handleSubmit}
      >
        <div className='inline-flex items-center gap-2 mb-2 mt-0'>
          <p className='text-3xl'>{currentState}</p>
          <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
        <input
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
          {currentState === 'Login' ? (
            <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>
              Don't Have An Account ? Create Account
            </p>
          ) : (
            <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>
              Login Here
            </p>
          )}
        </div>
        <button
          type="submit"
          className='bg-black text-white font-light px-8 py-2 mt-4'
        >
          {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>


    </div>
    </div>
  );
};

export default Auth;
