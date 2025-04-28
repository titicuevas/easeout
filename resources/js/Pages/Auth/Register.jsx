import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-b from-gray-900 to-gray-800">
            <Head title="Registro - EaseOut" />
            
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-gray-800 shadow-md overflow-hidden sm:rounded-lg border border-gray-700">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img src="/images/logo.png" alt="EaseOut Logo" className="w-16 h-16" />
                    </Link>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-white mb-8">
                    Crea tu cuenta
                </h2>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                            Nombre
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Tu nombre"
                            required
                        />
                        {errors.name && (
                            <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 text-gray-200 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="mt-2 text-sm text-red-400">{errors.password_confirmation}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Registrando...' : 'Crear cuenta'}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            ¿Ya tienes una cuenta? <span className="text-blue-500">Inicia sesión</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
