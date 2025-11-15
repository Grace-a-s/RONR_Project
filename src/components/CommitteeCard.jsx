import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';

function CommitteeCard({ committee = {}, onClick }) {
  return (
    <Card sx={{ height: 200, width: '100%', border: '1px solid black', backgroundColor: 'white' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%', display: 'flex', alignItems: 'center', padding: 2 }}>
        <CardContent sx={{ width: '100%' }}>
          <Typography variant="h6">{committee.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{committee.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CommitteeCard;
