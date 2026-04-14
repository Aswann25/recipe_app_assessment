function FilterButton({ name, isPressed, setFilter }) {
  return (
    <button
      type="button"
      className={`filter-btn ${isPressed ? "filter-btn-active" : ""}`}
      aria-pressed={isPressed}
      onClick={() => setFilter(name)}
    >
      {name}
    </button>
  );
}

export default FilterButton;
