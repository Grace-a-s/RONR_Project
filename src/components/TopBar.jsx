import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";


function TopBar() {
    const navigate = useNavigate();
    const { logout } = useAuth0();
    
    const handleSignOut = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    }
    
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                Robert's Rules of Order
                </Typography>
                <Button color="inherit" onClick={() => navigate('/committee')}>
                Home
                </Button>
                <Button color="inherit" onClick={handleSignOut}>
                Sign Out
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;