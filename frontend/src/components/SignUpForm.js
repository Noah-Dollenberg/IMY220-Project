// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isRobotChecked, setIsRobotChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        return {
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            isValid: minLength && hasUpper && hasLower && hasNumber
        };
    };

    const validateForm = () => {
        const newErrors = {};

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordCheck = validatePassword(formData.password);
            if (!passwordCheck.isValid) {
                const issues = [];
                if (!passwordCheck.minLength) issues.push('at least 8 characters');
                if (!passwordCheck.hasUpper) issues.push('uppercase letter');
                if (!passwordCheck.hasLower) issues.push('lowercase letter');
                if (!passwordCheck.hasNumber) issues.push('number');
                newErrors.password = `Password must contain: ${issues.join(', ')}`;
            }
        }

        // Confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Not Robot
        if (!isRobotChecked) {
            newErrors.robot = 'Please confirm you are not a robot';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (name === 'password' && errors.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: ''
            }));
        }
    };

    const handleRobotCheck = (e) => {
        setIsRobotChecked(e.target.checked);
        if (errors.robot) {
            setErrors(prev => ({
                ...prev,
                robot: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));

                window.location.href = '/home';
            } else {
                setErrors({ submit: data.message || 'Sign up failed' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const passwordStrength = formData.password ? validatePassword(formData.password) : null;

    return (
        <div className="signup-form">
            <div className="form-header">
                <h2>OPEN THE FIRST</h2>
                <h3>[B]RANCH</h3>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="************"
                        required
                    />
                    {formData.password && passwordStrength && (
                        <div className="password-strength">
                            <div className={`strength-indicator ${passwordStrength.minLength ? 'valid' : 'invalid'}`}>
                                {passwordStrength.minLength ? '✓' : '✗'} At least 8 characters
                            </div>
                            <div className={`strength-indicator ${passwordStrength.hasUpper ? 'valid' : 'invalid'}`}>
                                {passwordStrength.hasUpper ? '✓' : '✗'} Uppercase letter
                            </div>
                            <div className={`strength-indicator ${passwordStrength.hasLower ? 'valid' : 'invalid'}`}>
                                {passwordStrength.hasLower ? '✓' : '✗'} Lowercase letter
                            </div>
                            <div className={`strength-indicator ${passwordStrength.hasNumber ? 'valid' : 'invalid'}`}>
                                {passwordStrength.hasNumber ? '✓' : '✗'} Number
                            </div>
                        </div>
                    )}
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="************"
                        required
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isRobotChecked}
                            onChange={handleRobotCheck}
                            className="checkbox-input"
                        />
                        <span className="checkmark">
                            {isRobotChecked && '✓'}
                        </span>
                        I'm not a robot
                    </label>
                    {errors.robot && <div className="error-message">{errors.robot}</div>}
                </div>

                {errors.submit && (
                    <div className="error-message submit-error">{errors.submit}</div>
                )}

                <button
                    type="submit"
                    className="btn btn-dark btn-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'CREATING ACCOUNT...' : "LET'S CODE"}
                </button>
            </form>
        </div>
    );
};

export default SignUpForm;