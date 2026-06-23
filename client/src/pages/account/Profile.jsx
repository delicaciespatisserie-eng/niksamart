import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as yup from 'yup';
const schema=yup.object({name:yup.string().required(),phone:yup.string().required()});
export default function Profile(){const user=useSelector(s=>s.auth.user);const{register,handleSubmit}=useForm({resolver:yupResolver(schema),defaultValues:user||{}});return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="font-heading text-5xl text-navy">Profile</h1><form className="card mt-6 grid gap-4 p-6" onSubmit={handleSubmit(()=>alert('Profile saved locally'))}><input type="file" className="input"/><input className="input" {...register('name')} /><input className="input" {...register('phone')} /><input className="input" value={user?.email||''} readOnly/><input className="input" type="password" placeholder="Change password"/><button className="btn-gold">Save Profile</button></form></main>}
