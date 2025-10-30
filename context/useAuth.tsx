import {createContext, useContext, useEffect, useState} from 'react';
import React from "react";
import {LoginReturnBody} from "@/types/commons";

export type AuthContextType = {
    isAuthenticated: boolean;
    name:string;
    surname: string;
    email: string;
    signIn: ()=> void;
    signOut: ()=> void;
}

/*
interface AuthContextType {
  userInfo: any;
  jwt: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  loading: boolean;

}
 */




export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [email, setEmail] = useState<string>('');

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
        <AuthContext.Provider value={{ isAuthenticated, name, surname, email, signIn, signOut }}>
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

