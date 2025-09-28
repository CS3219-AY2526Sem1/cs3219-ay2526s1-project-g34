import React from "react";
import { Outlet, Link } from "react-router-dom";

export const LayoutComponent = () => {
    return (
        <div>
            <header>
                <nav>
                    <ul>
                        <li><Link to="/logout">Logout</Link></li>
                        <li><Link to="/home">Home</Link></li>
                        <li><Link>create match</Link></li>
                        <li><Link>find matches</Link></li>
                        <li><Link to="/collaborate">collaboration</Link></li>
                    </ul>
                </nav>
            </header>
            <Outlet />
        </div>
    )
}