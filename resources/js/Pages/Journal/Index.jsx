import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import '../../../css/journal.css';
import { router } from '@inertiajs/react';
import Calendar from '@/Components/Journal/Calendar';
import JournalEntryModal from '@/Components/Journal/JournalEntryModal';

export default function Index({ entries }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        router.visit('/journal-entries/create');
    };

    const handleDelete = async (entryId) => {
        if (confirm('¿Estás seguro de que quieres borrar esta entrada?')) {
            await router.delete(route('journal-entries.destroy', entryId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedEntry(null);
                },
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
                            className="bg-primary hover:bg-primary-hover text-paper px-4 py-2 rounded-md transition-colors"
                        >
                            Nueva Entrada
                        </button>
                    </div>

                    <div className="bg-paper dark:bg-modal-bg overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Calendar entries={entries} onEntryClick={handleEntryClick} />
                        </div>
                    </div>
                </div>
            </div>

            <JournalEntryModal
                entry={selectedEntry}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEntry(null);
                }}
                onDelete={handleDelete}
            />
        </>
    );
} 