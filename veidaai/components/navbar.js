import React from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import "./navbar.css";
import { UserButton } from "@clerk/nextjs";

// ... rest of the code remains unchanged ...
const Navbar = async () => {
    const { userId } = await auth();
    return (
        <div className="Navbar">
            <ul className="links">
                <div className="left">
                    <Link href="/"><li>Home</li></Link>
                </div>
                <div className="center">
                    <Link href="/client"><li>Client Page</li></Link>
                </div>
                <div className="right">
                    {!userId ? (
                        <>
                            <Link href="/sign-in"><li>Sign-In</li></Link>
                            <Link href="/sign-up"><li>Sign-Up</li></Link>
                        </>
                    ) : (
                        <>
                            <Link href="/profile"><li>Profile</li></Link>
                            <li className="userButton">
                                <UserButton />
                            </li>
                        </>
                    )}
                </div>
            </ul>
        </div>
    );
};

export default Navbar;