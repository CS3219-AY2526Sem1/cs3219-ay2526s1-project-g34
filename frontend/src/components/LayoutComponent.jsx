import React from "react";
import { Outlet, Link } from "react-router-dom";

export const LayoutComponent = ({handleLogout, user}) => {

    return (
        <div>
            <header>
                <nav>
                    <ul>
                        <li><button onClick={handleLogout}>Logout</button></li>
                        <li><Link to="/home">home</Link></li>
                        <li><Link to="/create_match">create match</Link></li>
                        <li><Link to="/matches">find match page</Link></li>
                        {user && user.role === "admin" && (
                            <li><Link to="/questionmanager">question management</Link></li>
                        )}
                    </ul>
                </nav>
            </header>
            <Outlet />
        </div>
    )
}