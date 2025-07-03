import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

const TEMP_USERNAME = "jpuser";
const TEMP_PASSWORD = "jp@123";

const Auth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === TEMP_USERNAME && password === TEMP_PASSWORD) {
            setIsAuthenticated(true);
            navigate("/", { replace: true });
        } else {
            alert("Invalid username or password.");
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/bg.png')" }}
        >
            <div className="flex flex-col md:flex-row rounded-2xl shadow-lg overflow-hidden bg-white/80 md:bg-white/0 backdrop-blur-md">
                {/* Left: Logo */}
                <div className="flex flex-col items-center justify-center bg-white p-8 md:p-16 md:w-96">
                    <img src="/sign-in-logo.png" alt="Sign In Logo" className="w-40 h-40 object-contain" />
                </div>
                {/* Right: Form */}
                <div className="flex flex-col justify-center bg-[#FF2D2D] p-8 md:p-16 md:w-96">
                    <h2 className="text-white text-3xl font-bold mb-8 text-center">Hello!</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 text-black"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 text-black"
                            required
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-white text-black font-semibold py-2 mt-2 hover:bg-gray-100 transition"
                        >
                            Sign In
                        </button>
                    </form>
                    <button className="mt-4 text-white text-sm hover:underline self-center" type="button">
                        Forgot Password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
