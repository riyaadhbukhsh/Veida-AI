import React from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import "./navbar.css";

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
                    <Link href="/premium"><li>Premium</li></Link>

                </div>
                <div className="right">
                    {!userId ? (
                        <>
                            <Link href="/sign-in"><li>Sign-In</li></Link>
                            <Link href="/sign-up"><li>Sign-Up</li></Link>
                        </>
                    ) : (
                        <>
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