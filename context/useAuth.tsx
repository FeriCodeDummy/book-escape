"use client"
import {createContext, useContext, useEffect, useState} from 'react';
import React from "react";
import {LoginReturnBody} from "@/types/commons";

export type AuthContextType = {
    isAuthenticated: boolean;
    name:string;
    surname: string;
    email: string;
    isManager: boolean;
    managerId: number;
    signIn: ()=> void;
    signOut: ()=> void;

}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [isManager, setIsManager] = useState<boolean>(false);
    const [managerId, setManagerId] = useState<number>(-1);
    const restoreSession = async()=> {

        const e = "example@mail.com";
        const p = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

        const obj = {
            email: e,
            password: p
        }

        const resp = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(obj),
            headers:{
                'Content-type': 'application/json'
            }
        });
        const data:LoginReturnBody = await resp.json();

        if (!data.error){
            setIsAuthenticated(true);
            setName(data.name!)
            setSurname(data.surname!)
            setEmail(data.email!)

            const res = await fetch('/api/auth/manager', {
                method: 'POST',
                body: JSON.stringify({email: data.email}),
                headers:{
                    'Content-type': 'application/json'
                }
            })

            const mdata = await res.json();
            if (Array.isArray(mdata) && mdata.length > 0){
                setManagerId(mdata[0].id);
                setIsManager(true);
            }

        }
        console.log(data)

    }

    const signIn = ():void => {}
    const signOut = ():void => {}

    useEffect(()=>{
        // eslint-disable-next-line react-hooks/set-state-in-effect
        restoreSession().then(() => console.log("user restored"));
    }, []);


    return (
        <AuthContext.Provider value={{ isAuthenticated, name, surname, email, isManager, managerId, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside an AuthProvider');
    return context;
};

