import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({user, children}) => {
    console.log(`this is user ${user}`)
    if (!user) {
        console.log('No user, redirecting to login');
        return <Navigate to="/" replace />;
    }

    return children;
}