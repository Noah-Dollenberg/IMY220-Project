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
        <div className="p-6">
            <div className="text-center mb-6">
                <h2 className="font-inter text-2xl font-bold text-dark">WELCOME</h2>
                <h3 className="font-inter text-xl font-bold text-dark">[B]ACK!</h3>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                    <label htmlFor="email" className="block font-khula text-sm font-medium text-dark mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`w-full px-3 py-2 border rounded font-khula focus:outline-none focus:border-highlight ${
                            errors.email ? 'border-red-500' : 'border-fill'
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                    />
                    {errors.email && <div className="text-red-500 text-sm mt-1 font-khula">{errors.email}</div>}
                </div>

                <div>
                    <label htmlFor="password" className="block font-khula text-sm font-medium text-dark mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`w-full px-3 py-2 border rounded font-khula focus:outline-none focus:border-highlight ${
                            errors.password ? 'border-red-500' : 'border-fill'
                        }`}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="************"
                        required
                    />
                    {errors.password && <div className="text-red-500 text-sm mt-1 font-khula">{errors.password}</div>}
                </div>

                <div>
                    <label className="flex items-center font-khula text-sm text-dark">
                        <input
                            type="checkbox"
                            checked={isRobotChecked}
                            onChange={handleRobotCheck}
                            className="mr-2"
                        />
                        I'm not a robot
                    </label>
                    {errors.robot && <div className="text-red-500 text-sm mt-1 font-khula">{errors.robot}</div>}
                </div>

                {errors.submit && (
                    <div className="text-red-500 text-sm font-khula">{errors.submit}</div>
                )}

                <button
                    type="submit"
                    className="w-full bg-dark text-white py-3 rounded font-inter font-medium hover:bg-darker transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'SIGNING IN...' : "LET'S CODE"}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;