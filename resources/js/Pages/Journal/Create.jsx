import React from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import JournalEntry from '@/Components/Journal/JournalEntry';

export default function Create() {
    const goToHistory = () => {
        router.visit('/journal-entries');
    };

    return (
        <>
            <Head title="Nueva entrada" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <JournalEntry />
                    <button 
                        onClick={goToHistory} 
                        className="new-entry-button" 
                        title="Ver historial"
                    >
                        📖
                    </button>
                </div>
            </div>
        </>
    );
} 