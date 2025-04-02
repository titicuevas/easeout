import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import JournalEntry from '@/Components/Journal/JournalEntry';

export default function Create() {
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const goToHistory = () => {
        router.visit('/journal-entries');
    };

    return (
        <>
            <Head title="Nueva entrada" />

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