import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";


function NavBar() {
    const navigate = useNavigate();
    const { logout } = useAuth0();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    
    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    
    const handleSignOut = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    }

    const openUserProfilePage = () => {
        setAnchorEl(null);
        navigate('/user-profile');
    };
    
    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: 'primary.main', color: '#fff' }} elevation={0}>
                <Toolbar>
                    <Tooltip title="Home">
                        <IconButton edge="start" color="inherit" onClick={() => navigate('/')} aria-label="home">
                            <HomeIcon sx={{ color: '#fff' }} />
                        </IconButton>
                    </Tooltip>
                    
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', color: '#fff' }}>
                        Bob's Rules
                    </Typography>

                    <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleClickMenu}
                            size="small"
                            sx={{ ml: 2, color: '#fff' }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <AccountCircleIcon sx={{ width: 32, height: 32, color: '#fff' }} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={openUserProfilePage}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    My Profile
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
}

export default NavBar;