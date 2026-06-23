import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useLoginMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
const schema = yup.object({ email: yup.string().email().required(), password: yup.string().min(6).required() });
export default function Login() { const { register, handleSubmit, formState:{errors} } = useForm({ resolver: yupResolver(schema) }); const [login,{isLoading,error}] = useLoginMutation(); const dispatch = useDispatch(); const nav = useNavigate(); const submit = async (values) => { const data = await login(values).unwrap(); dispatch(setCredentials(data)); nav('/'); }; return <main className="mx-auto max-w-md px-4 py-16"><h1 className="font-heading text-5xl text-navy">Login</h1><form onSubmit={handleSubmit(submit)} className="card mt-6 space-y-4 p-6"><input className="input" placeholder="Email" {...register('email')} /><p className="text-sm text-red-600">{errors.email?.message}</p><input className="input" type="password" placeholder="Password" {...register('password')} /><p className="text-sm text-red-600">{errors.password?.message}</p>{error && <p className="text-sm text-red-600">{error.data?.message}</p>}<button disabled={isLoading} className="w-full btn-gold">{isLoading?'Signing in...':'Login'}</button><Link className="block text-center text-sm text-navy" to="/forgot-password">Forgot password?</Link></form></main>; }
