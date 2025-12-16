import React, { useEffect, useState } from 'react';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useUsersApi } from "../utils/usersApi";
import { getChipSxForStatus } from '../utils/statusColors';

function MotionDetailsCard({ motion = {}, onClick }) {
    const { getUsernameById } = useUsersApi();
    const [user, setUser] = useState({ username: null });
    const [loading, setLoading] = useState(false);

    //getting usernames, be in loading state until gets username (or fails)
    useEffect(() => {
        let mounted = true;
        if (!motion || !motion.author) {
            setUser({ username: null });
            return () => { mounted = false; };
        }

        (async () => {
            try {
                setLoading(true);
                const data = await getUsernameById(motion.author);
                if (!mounted) return;
                // data may be an object like { username } or an error payload
                if (data && typeof data === 'object' && 'username' in data) {
                    setUser({ username: data.username });
                } else {
                    setUser({ username: null });
                }
            } catch (err) {
                console.error('Failed to fetch username', err);
                if (mounted) setUser({ username: null });
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [motion, getUsernameById]);

    const statusLabel = motion.status || (motion.second ? 'SECONDED' : 'PENDING');
    

    return (
        <Card
            sx={{
                height: 200,
                width: '100%',
                border: '1px solid rgba(0,0,0,0.12)',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '20px',
                '&:hover': { boxShadow: 6, backgroundColor: 'rgba(255,255,255,0.95)' }
            }}
        >
            <CardContent sx={{ p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>{motion.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Proposed by {loading ? 'Loading...' : (user?.username || 'Member')}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ bgcolor: '#f7f7f7', p: 1, borderRadius: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {motion.description ?? 'No description'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ ml: 1, flexShrink: 0 }}>
                        <Chip label={statusLabel} {...getChipSxForStatus(statusLabel)} />
                    </Box>
                </Box>
            </CardContent>

            <Box sx={{ px: 2, pb: 2, pt: 0, display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" onClick={() => onClick && onClick()} sx={{ mr: 'auto', textTransform: 'none' }}>
                    View Details
                </Button>
            </Box>
        </Card>
    )
}

export default MotionDetailsCard;