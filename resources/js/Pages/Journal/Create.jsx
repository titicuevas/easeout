import React from 'react';
import { Head, Link } from '@inertiajs/react';
import JournalEntry from '@/Components/Journal/JournalEntry';

export default function Create() {
    return (
        <>
            <Head title="Nueva entrada" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <JournalEntry />
                    <Link href={route('journal-entries.index')} className="new-entry-button" title="Ver historial">
                        📖
                    </Link>
                </div>
            </div>
        </>
    );
} 