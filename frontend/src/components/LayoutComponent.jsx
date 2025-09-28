import React from "react";
import { Outlet, Link } from "react-router-dom";

export const LayoutComponent = () => {
    return (
        <div>
            <header>
                <nav>
                    <ul>
                        <li><Link to="/logout">logout</Link></li>
                        <li><Link to="/home">home</Link></li>
                        <li><Link to="/create_match">create match</Link></li>
                        <li><Link to="/matches">find match page</Link></li>
                        <li><Link>join match page</Link></li>
                        <li><Link to="/collaborate">match collaboration page</Link></li>
                    </ul>
                </nav>
            </header>
            <Outlet />
        </div>
    )
}