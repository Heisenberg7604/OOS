import React from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import heroImg from '../assets/hero.png';

const Profile = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <Navbar />
            <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="flex flex-col md:flex-row items-center md:items-start w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 gap-10">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                        <img
                            src={heroImg}
                            alt="Profile"
                            className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 shadow-md"
                        />
                    </div>
                    {/* Profile Info */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex">
                                <span className="w-40 bg-gray-100 rounded-l-lg px-6 py-3 text-gray-700 font-semibold flex items-center">Username</span>
                                <span className="flex-1 bg-gray-200 rounded-r-lg px-6 py-3 text-gray-600 flex items-center">John Doe</span>
                            </div>
                            <div className="flex">
                                <span className="w-40 bg-gray-100 rounded-l-lg px-6 py-3 text-gray-700 font-semibold flex items-center">Company name</span>
                                <span className="flex-1 bg-gray-200 rounded-r-lg px-6 py-3 text-gray-600 flex items-center">JP Group</span>
                            </div>
                            <div className="flex">
                                <span className="w-40 bg-gray-100 rounded-l-lg px-6 py-3 text-gray-700 font-semibold flex items-center">Customer ID</span>
                                <span className="flex-1 bg-gray-200 rounded-r-lg px-6 py-3 text-gray-600 flex items-center">CUST-123456</span>
                            </div>
                            <div className="flex">
                                <span className="w-40 bg-gray-100 rounded-l-lg px-6 py-3 text-gray-700 font-semibold flex items-center">Address</span>
                                <span className="flex-1 bg-gray-200 rounded-r-lg px-6 py-3 text-gray-600 flex items-center">123 Industrial Estate, Ankleshwar, Gujarat, India</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
