import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaHeart, FaList, FaBars, FaTimes } from 'react-icons/fa';

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
            <button
                onClick={toggleSidebar}
                className="btn btn-secondary toggle-sidebar-btn"
                aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={isOpen}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h2>Rythimic Tunes</h2>
            <nav>
                <NavLink to="/" className="nav-link">
                    <FaHome /> Songs
                </NavLink>
                <NavLink to="/favorites" className="nav-link">
                    <FaHeart /> Favorites
                </NavLink>
                <NavLink to="/playlist" className="nav-link">
                    <FaList /> Playlist
                </NavLink>
            </nav>
        </div>
    );
}

export default Sidebar;