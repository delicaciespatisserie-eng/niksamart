import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useResetPasswordMutation } from '../../store/api/authApi';
const schema = yup.object({ password: yup.string().min(6).required() });
export default function ResetPassword() { const { token } = useParams(); const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) }); const [reset,{isLoading,isSuccess}] = useResetPasswordMutation(); return <main className="mx-auto max-w-md px-4 py-16"><h1 className="font-heading text-5xl text-navy">Reset Password</h1><form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit(({password}) => reset({ token, password }))}><input className="input" type="password" placeholder="New password" {...register('password')} />{isSuccess && <p className="text-green-700">Password updated. You can login now.</p>}<button className="w-full btn-gold">{isLoading?'Updating...':'Reset password'}</button></form></main>; }
