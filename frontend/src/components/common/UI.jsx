export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Since I'm not using Tailwind, I'll use standard CSS classes that I'll define in a components.css or just use style objects for now.
  // Actually, I'll use standard CSS classes and I'll add them to theme.css or a new file.
  
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', glass = false, ...props }) => {
  return (
    <div 
      className={`card ${glass ? 'glass' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props} 
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
