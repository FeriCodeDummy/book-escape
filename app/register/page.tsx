"use client"

import React, {useState} from "react";
import {Mail, Lock, UserPlus, Eye, EyeOff, CheckCircle, User} from "lucide-react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agree, setAgree] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password, confirm, agree });
        alert("(Dev) Registration payload logged to console");
    };

    const pwMatch = password && confirm && password === confirm;

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
            {/* Header */}
            <div className="mx-auto max-w-7xl px-4 py-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-neutral-900" />
                        <span className="text-lg text-black font-bold tracking-tight">BookEscape</span>
                    </div>
                    <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Back to home</a>
                </header>
            </div>

            {/* Main */}
            <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <UserPlus className="h-5 w-5" />
                        <h1 className="text-xl font-semibold text-black">Create your account</h1>
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">Register with your email and a password.</p>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        {/* Email */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Name</label>
                            <div className="flex items-center rounded-xl border bg-white px-3">
                                <User className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e)=>setName(e.target.value)}
                                    placeholder="John"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Surname</label>
                            <div className="flex items-center rounded-xl border bg-white px-3">
                                <User className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    required
                                    value={surname}
                                    onChange={(e)=>setSurname(e.target.value)}
                                    placeholder="Doe"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </div>

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

                        {/* Password */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
                            <div className="flex items-center rounded-xl border bg-white px-3">
                                <Lock className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                    minLength={8}
                                />
                                <button type="button" onClick={()=>setShowPw(s=>!s)} className="ml-2 inline-flex items-center justify-center rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-50" aria-label="Toggle password visibility">
                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">Use at least 8 characters.</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-neutral-600">Confirm password</label>
                            <div className={`flex items-center rounded-xl border bg-white px-3 ${pwMatch ? 'border-emerald-500' : ''}`}>
                                <Lock className="mr-2 h-4 w-4 text-neutral-400" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirm}
                                    onChange={(e)=>setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 w-full bg-transparent text-sm outline-none"
                                    minLength={8}
                                />
                                <button type="button" onClick={()=>setShowConfirm(s=>!s)} className="ml-2 inline-flex items-center justify-center rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-50" aria-label="Toggle password visibility">
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {pwMatch && (
                                <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle className="h-3.5 w-3.5" /> Passwords match
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                            <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                            I agree to the Terms and Privacy Policy.
                        </label>

                        <button type="submit" disabled={!agree} className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
                            Create account
                        </button>

                        <div className="text-center text-xs text-neutral-500">Already have an account? <a href="#" className="underline decoration-neutral-300 hover:text-neutral-800">Sign in</a></div>
                    </form>
                </div>
            </main>
        </div>
    );
}
