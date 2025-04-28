import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

export default function JournalEntry({ auth, journalEntry }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);

    const handleDelete = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('journal-entries.destroy', journalEntry.id), {
                    onSuccess: () => {
                        Swal.fire(
                            '¡Borrado!',
                            'Tu entrada ha sido eliminada.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    const handlePlayAudio = () => {
        if (journalEntry.audio_path) {
            setAudioUrl(`/storage/${journalEntry.audio_path}`);
            setIsPlaying(true);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Entrada del Diario</h2>}
        >
            <Head title="Entrada del Diario" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">
                                    {format(new Date(journalEntry.created_at), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                                </h3>
                            </div>

                            <div className="mb-4">
                                <p className="whitespace-pre-wrap">{journalEntry.content}</p>
                            </div>

                            {journalEntry.audio_path && (
                                <div className="mb-4">
                                    <button
                                        onClick={handlePlayAudio}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        {isPlaying ? 'Reproduciendo...' : 'Reproducir audio'}
                                    </button>
                                    {isPlaying && audioUrl && (
                                        <audio
                                            src={audioUrl}
                                            controls
                                            autoPlay
                                            onEnded={() => setIsPlaying(false)}
                                            className="mt-2"
                                        />
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <Link
                                    href={route('journal-entries.index')}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    Volver al listado
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Eliminar entrada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 