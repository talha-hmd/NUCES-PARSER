import Cursor from "../components/Cursor";
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
    const form = useRef();
    const [emailSent, setEmailSent] = useState(false);
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;


    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm(
            SERVICE_ID,
            TEMPLATE_ID,
            form.current,
            PUBLIC_KEY
        )
            .then(() => {
                alert("Message sent successfully!");
                form.current.reset();
            }, (error) => {
                alert("Failed to send message: " + error.text);
            });
    };

    return (
        <div className="cursor-none relative overflow-hidden">
            <Cursor />
            <div className="min-h-screen bg-black text-white px-4 py-16 flex flex-col justify-center items-center">
                {/* Back Button */}
                <div className="w-full max-w-5xl mb-8">
                    <Link
                        to="/"
                        className="cursor-none inline-block text-sm text-white border border-white px-4 py-1 rounded hover:bg-white hover:text-black transition"
                    >
                        ← Back
                    </Link>
                </div>

                {/* Main Grid */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left - Info */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4">ABOUT US</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            This is a personal project made by Muhammad Talha Hamid{' '}
                            <span className="inline-block px-2 py-0 rounded-full bg-white text-black text-sm font-medium">
                                Frontend
                            </span>{' '}
                            with the help of Ayetal Hassan{' '}
                            <span className="inline-block px-2 py-0 rounded-full bg-white text-black text-sm font-medium">
                                UI/UX
                            </span>.
                        </p>

                        <div className="space-y-6 text-sm">
                            <div>
                                <p className="font-semibold flex items-center gap-2">
                                    <i className="fa-solid fa-location-dot text-white" /> Our University
                                </p>
                                <p className="text-slate-400">FAST NUCES, Lahore Campus</p>
                            </div>
                            <div>
                                <p className="font-semibold flex items-center gap-2">
                                    <i className="fa-brands fa-github text-white" /> Github
                                </p>
                                <p className="text-slate-400">github.com/talha-hmd</p>
                            </div>
                            <div>
                                <p className="font-semibold flex items-center gap-2">
                                    <i className="fa-solid fa-envelope text-white" /> Email
                                </p>
                                <p className="text-slate-400">talhasbzzz@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <form
                        className="space-y-4 border border-white p-6 rounded-lg"
                        onSubmit={(e) => {
                            e.preventDefault();
                            emailjs.sendForm(
                                SERVICE_ID,
                                TEMPLATE_ID,
                                e.target,
                                PUBLIC_KEY
                            )
                                .then(
                                    () => {
                                        setEmailSent(true);
                                    },
                                    (error) => {
                                        alert('Something went wrong. Please try again.');
                                        console.error(error);
                                    }
                                );
                        }}
                    >
                        <input name="name" type="text" placeholder="Your Name" required className="cursor-none w-full bg-transparent border border-white rounded px-4 py-2 text-white" />
                        <input name="email" type="email" placeholder="Your Email" required className="cursor-none w-full bg-transparent border border-white rounded px-4 py-2 text-white" />
                        <input name="subject" type="text" placeholder="Subject" className="cursor-none w-full bg-transparent border border-white rounded px-4 py-2 text-white" />
                        <textarea name="message" placeholder="Your Message" rows={4} required className="cursor-none w-full bg-transparent border border-white rounded px-4 py-2 text-white" />

                        <button
                            type="submit"
                            className={`cursor-none w-full flex justify-center items-center gap-2 py-2 rounded transition duration-300 ${emailSent ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            {emailSent ? (
                                <>
                                    <i className="fa-solid fa-envelope-circle-check"></i>
                                    Email Sent
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Contact;
