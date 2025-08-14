import React, { useState, useEffect } from 'react';
import "./Login.css";
import api from "./apiService";
import { useNavigate } from 'react-router-dom';

const UserDetails = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const UserId = localStorage.getItem("Session");
                if (!UserId) {
                    setError("No UserId found in session.");
                    setLoading(false);
                    return;
                }

                const userResponse = await api.get(`/api/getUserbyid?UserId=${UserId}`);
                const userData = userResponse.data.length > 0 ? userResponse.data[0] : {};
                setUser(userData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div className="loader">Loading...</div>;
    if (error) return <p className="error">{error}</p>;

    const handleResetPassword = () => {
        navigate('/Resetpassword');
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="user-details no-gap">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.ImageUrl ? (
                            <img src={user.ImageUrl} alt="Profile" />
                        ) : (
                            <span className="avatar-initials">{getInitials(user.Name)}</span>
                        )}
                    </div>
                    <div className="profile-info">
                        <h2>{user.Name || 'No Name Available'}</h2>
                        <p className="username">@{user.Username || 'No Username'}</p>
                    </div>
                </div>
                <div className="profile-body">
                    <div className="info-section">
                        <h3>📱 Mobile</h3>
                        <p>{user.Mobile || 'No Mobile Available'}</p>
                    </div>
                    <div className="info-section">
                        <h3>📧 Email</h3>
                        <p>{user.Email || 'No Email Available'}</p>
                    </div>
                    <div className="info-section">
                        <h3>👤 User Role</h3>
                        <p>{user.UserId === 1 ? 'Administrator' : 'Customer'}</p>
                    </div>
                </div>
                <button className="reset-password-button" onClick={handleResetPassword}>
                    🔑 Reset Password
                </button>
            </div>
        </div>
    );
};

export default UserDetails;
