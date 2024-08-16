import React from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import "./navbar.css";

const Navbar = async () => {
    const { userId } = await auth();
    return (
        <div className="Navbar">
            <div className="links">
                <div className="left">
                    <Link href="/">
                        <Image src="/veida-logo-wide-no-pad.png" alt="VeidaAI Logo" width={100} height={40} />
                    </Link>
                </div>
                <div className="right">
                    <Link href="/client"><span>Courses</span></Link>
                    <Link href="/about"><span>About Us</span></Link>
                    {!userId ? (
                        <>
                            <Link href="/sign-in">
                                <button className="login-button">Login</button>
                            </Link>
                            <Link href="/sign-up">
                                <button className="signup-button">Sign Up</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/premium">
                                <button className="premium-button">Premium</button>
                            </Link>
                            <div className="userButton">
                                <UserButton />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;