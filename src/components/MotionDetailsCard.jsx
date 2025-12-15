import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

function MotionDetailsCard({ motion = {}, onClick }) {
    const statusLabel = motion.status || (motion.second ? 'SECONDED' : 'PENDING');

    const getChipSxForStatus = (label) => {
        const s = String(label || '').toUpperCase();
        // choose text color for readability on the given background
        const lightText = { color: 'white' };
        const darkText = { color: 'black' };

        switch (s) {
            case 'DEBATE':
                return { sx: { bgcolor: '#FF57BB', ...lightText } };
            case 'VOTING':
                return { sx: { bgcolor: '#22577A', ...lightText } };
            case 'PASSED':
                return { sx: { bgcolor: '#57CC99', ...darkText } };
            case 'SECONDED':
                return { sx: { bgcolor: '#38A3A5', ...darkText } };
            case 'VETOED':
                return { sx: { bgcolor: '#4f4e4eff', ...lightText } };
            case 'REJECTED':
                return { sx: { bgcolor: '#8d0858ff', ...lightText } };
            case 'PROPOSED':
                return {sx: {bgcolor: '#85D4D5', ...darkText}};
            case 'PENDING':
            default:
                return { sx: {} };
        }
    };

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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Proposed by {motion.author || 'Member'}</Typography>

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