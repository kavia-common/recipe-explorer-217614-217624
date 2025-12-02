import React from 'react';

// PUBLIC_INTERFACE
export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search recipes..." }) {
  /** Controlled search bar with submit button. */
  const submit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form className="searchbar" onSubmit={submit} role="search" aria-label="Recipe search">
      <input
        className="input"
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      <button className="btn primary" type="submit" onClick={onSubmit}>Search</button>
    </form>
  );
}
