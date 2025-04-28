import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-b from-gray-900 to-gray-800">
            <Head title="Iniciar Sesión - EaseOut" />
            
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-gray-800 shadow-md overflow-hidden sm:rounded-lg border border-gray-700">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img src="/images/logo.png" alt="EaseOut Logo" className="w-16 h-16" />
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-8">
                    Bienvenido de nuevo
                </h2>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-400 bg-green-400/10 p-4 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
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
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                            />
                            <span className="ml-2 text-sm text-gray-300">
                                Recordarme
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            href={route('register')}
                            className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            ¿No tienes una cuenta? <span className="text-blue-500">Regístrate</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
