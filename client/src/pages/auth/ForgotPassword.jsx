import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useForgotPasswordMutation } from '../../store/api/authApi';
const schema = yup.object({ email: yup.string().email().required() });
export default function ForgotPassword() { const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) }); const [send,{isLoading,isSuccess}] = useForgotPasswordMutation(); return <main className="mx-auto max-w-md px-4 py-16"><h1 className="font-heading text-5xl text-navy">Forgot Password</h1><form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit(send)}><input className="input" placeholder="Email" {...register('email')} />{isSuccess && <p className="text-green-700">Reset email sent.</p>}<button className="w-full btn-gold">{isLoading?'Sending...':'Send reset link'}</button></form></main>; }
