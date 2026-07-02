import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './FormField.css';

export default function FormField({
  id,
  label,
  error,
  icon: Icon,
  type = 'text',
  children,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={['ui-form-group', error ? 'has-error' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className="ui-form-label">
          {label}
        </label>
      )}
      
      <div className="ui-form-control-wrapper">
        {Icon && (
          <div className="ui-form-icon-leading">
            <Icon size={18} />
          </div>
        )}
        
        {children ? (
          React.cloneElement(children, {
            id,
            className: [
              children.props.className,
              error ? 'input-error' : '',
              Icon ? 'has-icon-leading' : '',
              isPassword ? 'has-icon-trailing' : ''
            ].filter(Boolean).join(' '),
            ...props
          })
        ) : (
          <input
            id={id}
            type={inputType}
            className={[
              'ui-input',
              error ? 'input-error' : '',
              Icon ? 'has-icon-leading' : '',
              isPassword ? 'has-icon-trailing' : ''
            ].filter(Boolean).join(' ')}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="ui-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="ui-field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
