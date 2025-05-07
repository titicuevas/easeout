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
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDayEntries, setSelectedDayEntries] = useState([]);
    const [isDeletingId, setIsDeletingId] = useState(null);

    entries = Array.isArray(entries) ? entries : [];

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setIsDarkMode(shouldBeDark);
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
        // Escuchar cambios en el almacenamiento local para sincronizar el tema
        const onStorage = () => {
            const newTheme = localStorage.getItem('theme');
            setIsDarkMode(newTheme === 'dark');
            document.documentElement.setAttribute('data-theme', newTheme === 'dark' ? 'dark' : 'light');
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    const handleEntryClick = (entries) => {
        setSelectedDayEntries(entries);
        setModalOpen(true);
    };

    const handleCreateNew = () => {
        router.visit('/journal-entries/create', {
            preserveScroll: true
        });
    };

    const handleDelete = async (entryId) => {
        setIsDeletingId(entryId);
        try {
            await router.delete(route('journal-entries.destroy', entryId), {
                onSuccess: () => {
                    setModalOpen(false);
                    setSelectedDayEntries([]);
                    setIsDeletingId(null);
                    router.reload({ only: ['entries'] });
                    Swal.fire({
                        icon: 'success',
                        title: '¡Borrado!',
                        text: 'La entrada ha sido eliminada.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                },
                onError: () => {
                    setIsDeletingId(null);
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
            setIsDeletingId(null);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la entrada.',
            });
        }
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
                            className={`bg-primary text-paper px-4 py-2 rounded-md transition-colors ${
                                isDeletingId !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-hover'
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
                            />
                        </div>
                    </div>
                </div>
            </div>

            <JournalEntryModal
                entries={selectedDayEntries}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onDelete={handleDelete}
                isDeletingId={isDeletingId}
            />
        </>
    );
} 