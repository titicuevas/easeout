import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import '../../../css/journal.css';
import { router } from '@inertiajs/react';
import Calendar from '@/Components/Journal/Calendar';
import JournalEntryModal from '@/Components/Journal/JournalEntryModal';
import Swal from 'sweetalert2';

export default function Index({ entries }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    entries = Array.isArray(entries) ? entries : [];

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setIsDarkMode(shouldBeDark);
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    const handleEntryClick = async (entry) => {
        if (isLoading || isDeleting) return;
        
        setIsLoading(true);
        try {
            setSelectedEntry(entry);
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        if (isLoading || isDeleting) return;
        
        router.visit('/journal-entries/create', {
            preserveScroll: true
        });
    };

    const handleDelete = async (entryId) => {
        if (isDeleting || isLoading) return;

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                setIsDeleting(true);
                try {
                    await router.delete(route('journal-entries.destroy', entryId), {
                        onSuccess: () => {
                            setIsModalOpen(false);
                            setSelectedEntry(null);
                            Swal.fire({
                                icon: 'success',
                                title: '¡Borrado!',
                                text: 'La entrada ha sido eliminada.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        },
                        onError: () => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar la entrada.',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        },
                        preserveScroll: true
                    });
                } catch (error) {
                    Swal.showValidationMessage(
                        'Error al eliminar la entrada'
                    );
                } finally {
                    setIsDeleting(false);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    };

    const handleModalClose = () => {
        if (isDeleting || isLoading) return;
        setIsModalOpen(false);
        setSelectedEntry(null);
    };

    return (
        <>
            <Head title="Mi Diario" />

            <div className="theme-toggle-wrapper">
                <Expand 
                    toggled={isDarkMode}
                    toggle={toggleTheme}
                    duration={750}
                    className="theme-toggle-icon"
                />
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-semibold text-primary">Mi Diario</h1>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            disabled={isLoading || isDeleting}
                            className={`bg-primary text-paper px-4 py-2 rounded-md transition-colors ${
                                isLoading || isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-hover'
                            }`}
                        >
                            Nueva Entrada
                        </button>
                    </div>

                    <div className="bg-paper dark:bg-modal-bg overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Calendar 
                                entries={entries} 
                                onEntryClick={handleEntryClick}
                                disabled={isLoading || isDeleting}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <JournalEntryModal
                entry={selectedEntry}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onDelete={handleDelete}
            />
        </>
    );
} 