"use client"
import {Mail, Lock, EyeOff, Eye} from "lucide-react";
import React, {useState} from 'react';

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);


    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password });
        alert("(Dev) Login payload logged to console");
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-neutral-900" />
                        <span className="text-lg font-bold tracking-tight">BookEscape</span>
                    </div>
                    <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Back to home</a>
                </header>
            </div>


            <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                    <h1 className="text-xl text-black font-semibold">Sign in</h1>
                    <p className="mt-1 text-sm text-neutral-600">Welcome back! Please enter your details.</p>


                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Email</label>
                            <div className="flex items-center rounded-xl border bg-white px-3">
                                <Mail className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e)=>setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
                            <div className="flex items-center rounded-xl border bg-white px-3">
                                <Lock className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type={show ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                />
                                <button type="button" onClick={()=>setShow(s=>!s)} className="ml-2 inline-flex items-center justify-center rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-50" aria-label="Toggle password visibility">
                                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>


                        <button type="submit" className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">
                            Sign in
                        </button>


                        <div className="text-center text-xs text-neutral-500">By continuing you agree to our Terms & Privacy Policy.</div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Login;