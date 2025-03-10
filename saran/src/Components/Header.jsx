import React from 'react';

function Header({ searchTerm, setSearchTerm }) {
  return (
    <div className="header">
      <input
        type="text"
        placeholder="Search by title, singer, or category"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar full-width"
      />
    </div>
  );
}

export default Header;