import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';

function CommitteeCard({ committee = {}, onClick }) {
  const membersCount = committee.members?.length ?? 3;
  const motionsCount = committee.motions?.length ?? 5;

    return (
    <Card
      sx={{
        height: 200,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-6px)',
          bgcolor: 'action.hover',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'secondary.main', color: 'common.white', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{committee.name}</Typography>
        </Box>

        {/* Body */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {committee.description || 'No description provided.'}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Chip icon={<PeopleIcon />} label={`${membersCount} members`} size="small" />
            <Chip icon={<GavelIcon />} label={`${motionsCount} active motions`} size="small" />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CommitteeCard;
