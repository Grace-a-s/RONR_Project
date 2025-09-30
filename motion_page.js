
//main page object, may need
const Main = {

}
const motion = new Motion("Motion #1", "I propose that we do this thing");//later will pull this from a database
const secondButton = document.getElementById("second");
secondButton.addEventListener("click", makeSeconded);//running this immedicatly, why?

//motion object constructor function (use case on this page?)
function Motion(title, content){
    id = 1000,
    this.title = title,
    this.content = content,
    this.timeStamp = Date.now(), //or should it be new Date()?
    second = false,
    debate = []; //array of DebateEntry objects (or should this be object of its own)
};

//object constructor 
function DebateEntry(position, content){
    this.position = position, //three options (pro, against, neutral)
    this.content = content, //string
    timeStamp = Date.now()
};

//when second button clicked
function makeSeconded(motion){
    motion.second = true;
    secondButton.style.display = "none";
    console.log('pressed second button; second value:', motion.second);
    //show debate button
    //allow debate/allow text entry?
};

//on up arrow button push, takes string from text box into content variable
function addDebateEntry(motion, position, content){
    motion.debate.push(new DebateEntry(position, content))
};

//on 'debate' button push, drop down menu shows of debate entries
function showDebate(){

};



