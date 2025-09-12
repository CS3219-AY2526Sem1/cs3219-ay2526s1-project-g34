import React from "react";
import { Outlet, Link } from "react-router-dom";

export const LayoutComponent = () => {
    return (
        <div>
            <header>
                <nav>
                    <Link to="/logout">Logout</Link>
                </nav>
            </header>
            <Outlet />
        </div>
    )
}