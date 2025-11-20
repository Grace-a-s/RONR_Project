import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';

function CreateCommitteeCard({ onOpen }) {
  return (
    <Card
      sx={{
        height: 200,
        width: 160,
        border: '1px solid black',
        backgroundColor: 'white',
      }}
    >
      <CardActionArea
        onClick={onOpen}
        sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <AddIcon fontSize="large" color="primary" />
          <Typography>New Committee</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CreateCommitteeCard;
