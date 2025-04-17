import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="EaseOut - Tu Diario Personal" />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="relative flex min-h-screen flex-col items-center justify-center">
                    {/* Header con navegación */}
                    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src="/images/logo.png" alt="EaseOut Logo" className="h-10 w-auto" />
                                    <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">EaseOut</span>
                                </div>
                                <nav className="flex gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Registrarse
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </header>

                    {/* Hero Section */}
                    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-16">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                                Tu espacio seguro para expresarte
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                EaseOut es tu diario personal digital donde puedes escribir tus pensamientos, 
                                emociones y experiencias en un entorno privado y seguro.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Comienza Gratis
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
                                >
                                    Ya tengo una cuenta <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
                            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <div className="absolute top-6 left-6 rounded-full bg-blue-600/10 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </div>
                                <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Escritura Libre</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Expresa tus pensamientos libremente en un espacio diseñado para la reflexión personal.
                                </p>
                            </div>

                            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <div className="absolute top-6 left-6 rounded-full bg-blue-600/10 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Privacidad Total</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Tus entradas están seguras y son completamente privadas, solo tú puedes acceder a ellas.
                                </p>
                            </div>

                            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <div className="absolute top-6 left-6 rounded-full bg-blue-600/10 p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <h3 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Organización</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    Mantén tus entradas organizadas y accesibles, con búsqueda y filtros intuitivos.
                                </p>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="w-full py-8 mt-32">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                © {new Date().getFullYear()} EaseOut. Todos los derechos reservados.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
