"use client"; 

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import "./navbar.css";

export default function Navbar() {
    const { userId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        if (!userId) closeMenu();
    }, [userId]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize(); 
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="Navbar">
            <div className="links">
                <div className="left">
                    <Link href="/" onClick={closeMenu}>
                        <Image src="/veida-logo-wide-no-pad.png" alt="VeidaAI Logo" width={100} height={40} />
                    </Link>
                </div>
                {isMobile && (
                    <div className="right-group">
                        <div id="burger-user" className="userButton">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                        <div className="hamburger" onClick={toggleMenu}>
                            <div className={isOpen ? "line open" : "line"}></div>
                            <div className={isOpen ? "line open" : "line"}></div>
                            <div className={isOpen ? "line open" : "line"}></div>
                        </div>
                    </div>
                )}
                <div className={isOpen ? "right open" : "right"}>
                    <Link href="/about" onClick={closeMenu}><span>ABOUT</span></Link>
                    {!userId ? (
                        <>
                            <Link href="/sign-in">
                                <button className="login-button" onClick={closeMenu}>LOGIN</button>
                            </Link>
                            <Link href="/sign-up">
                                <button className="signup-button" onClick={closeMenu}>SIGN UP</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/client" onClick={closeMenu}><span>COURSES</span></Link>
                            <Link href="/premium">
                                <button className="premium-button" onClick={closeMenu}>PREMIUM</button>
                            </Link>
                            {!isMobile && (
                                <div className="userButton">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
