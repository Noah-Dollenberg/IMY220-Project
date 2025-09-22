// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { searchAPI } from '../services/api';

const SearchInput = ({ onSearch, placeholder = "Search for project...", searchType = "projects" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length > 1) {
                setLoading(true);
                try {
                    let results = [];
                    if (searchType === 'projects') {
                        const response = await searchAPI.projects(searchTerm);
                        results = response.projects.slice(0, 5).map(p => p.name);
                    } else if (searchType === 'users') {
                        const response = await searchAPI.users(searchTerm);
                        results = response.users.slice(0, 5).map(u => u.name);
                    }
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Search suggestions error:', error);
                    setSuggestions([]);
                    setShowSuggestions(false);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchType]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (onSearch) {
            const timeoutId = setTimeout(() => {
                onSearch(value);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(suggestion);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="search-input-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-wrapper">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <SearchIcon />
                    </button>
                </div>

                {showSuggestions && (
                    <div className="suggestions-dropdown">
                        {loading ? (
                            <div className="suggestion-loading">Searching...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))
                        ) : searchTerm.length > 1 ? (
                            <div className="suggestion-empty">No results found</div>
                        ) : null}
                    </div>
                )}
            </form>
        </div>
    );
};

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default SearchInput;