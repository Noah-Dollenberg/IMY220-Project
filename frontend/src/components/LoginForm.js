// NJ Noah Dollenberg u24596142 41
import React, { useState } from 'react';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isRobotChecked, setIsRobotChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const response = await fetch('/api/auth/login', {
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
                setErrors({ submit: data.message || 'Login failed' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-form">
            <div className="form-header">
                <h2>WELCOME</h2>
                <h3>[B]ACK!</h3>
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
                    {errors.password && <div className="error-message">{errors.password}</div>}
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
                    {isSubmitting ? 'SIGNING IN...' : "LET'S CODE"}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;