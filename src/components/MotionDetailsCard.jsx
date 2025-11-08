import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";


function MotionDetailsCard({ motion = {}, onClick }) {
    return (
        <Card
            sx={{
                height: 200,
                width: 200,
                border: '1px solid black',
                backgroundColor: 'white',
                }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                }}
            >
                <CardContent>
                    <Typography align="center">{motion.title}</Typography>
                     <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 4, // show a short blurb
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mt: 0.5,
                        }}
                    >
                        {motion.description ?? "No description"}
                    </Typography>
                </CardContent>
                
            </CardActionArea>
        </Card>
    )
}

export default MotionDetailsCard;