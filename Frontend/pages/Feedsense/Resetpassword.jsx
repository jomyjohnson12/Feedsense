import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Login.css";

function ResetForm() {
    const [reset, setReset] = useState({
        CurrentPassword: '',
        Newpassword: '',
        ConfirmPassword: '',
        UserId: ''
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReset({
            ...reset,
            [name]: value,
        });
    };

    const handleLogout = () => {
        try {
            api.post('/api/logout', {}, {
                headers: { 'Content-Type': 'application/json' },
            }).catch(err => console.error("Logout error:", err));
        } catch (error) {
            console.error('Error during logout:', error);
        }
        sessionStorage.removeItem('token');
        localStorage.clear();
        navigate('/');
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (!reset.CurrentPassword || !reset.Newpassword || !reset.ConfirmPassword) {
        toast.warn('Please fill in all required fields.');
        setLoadingSubmit(false);
        return;
    }

    if (reset.Newpassword.length < 6) {
        toast.warn('New password must be at least 6 characters long.');
        setLoadingSubmit(false);
        return;
    }

    if (reset.Newpassword !== reset.ConfirmPassword) {
        toast.error('New password and confirm password do not match.');
        setLoadingSubmit(false);
        return;
    }

    const UserId = localStorage.getItem('Session');
    if (!UserId) {
        toast.error('UserId not found in session.');
        setLoadingSubmit(false);
        return;
    }

    try {
        const response = await api.post('/api/resetpassword', {
            UserId,
            CurrentPassword: reset.CurrentPassword,
            NewPassword: reset.Newpassword,
        });

        if (response.data.success) {
            toast.success('Password successfully updated. Logging you out...');
            setTimeout(() => {
                handleLogout();
            }, 2000);
        } else {
            toast.error(response.data.Message || 'Password reset failed.');
        }
    } catch (error) {
        if (error.response) {
            toast.error(error.response.data.Message || 'An error occurred while resetting the password.');
        } else if (error.request) {
            toast.error('No response received from the server.');
        } else {
            toast.error('An unexpected error occurred.');
        }
    }

    setLoadingSubmit(false);
};

    return (
        <>
            <div className="page-wrapper">
                <div className="container-xl">
                    <div className="page-header d-print-none mt-2">
                        <div className="row g-2 align-items-center">
                            <div className="col">
                                <h2 className="page-title">Reset Password</h2>
                            </div>
                        </div>
                    </div>
                    <div className="page-body">
                        <div className="container-xl">
                            <div className="row row-cards">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <form className="reset-form" onSubmit={handleSubmit}>
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="CurrentPassword" className="form-label">Current Password</label>
                                                            <input
                                                                type="password"
                                                                id="CurrentPassword"
                                                                name="CurrentPassword"
                                                                className="form-control"
                                                                value={reset.CurrentPassword}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="Newpassword" className="form-label">New Password</label>
                                                            <input
                                                                type="password"
                                                                id="Newpassword"
                                                                name="Newpassword"
                                                                className="form-control"
                                                                value={reset.Newpassword}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="ConfirmPassword" className="form-label">Confirm Password</label>
                                                            <input
                                                                type="password"
                                                                id="ConfirmPassword"
                                                                name="ConfirmPassword"
                                                                className="form-control"
                                                                value={reset.ConfirmPassword}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-footer d-flex justify-content-center">
                                                    <button
                                                        type="submit"
                                                        className="btn mx-1"
                                                        disabled={loadingSubmit}
                                                    >
                                                        {loadingSubmit ? 'Submitting...' : 'Reset Password'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Toast container */}
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default ResetForm;
