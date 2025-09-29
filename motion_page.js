
//main page object, may need
const Main = {

}

//motion object constructor function
function Motion(title, content){
    id = 1000,
    this.title = title,
    this.content = content,
    this.timeStamp = Date.now(),
    second = false,
    debate = []; //array of DebateEntry objects (or should this be object of its own)
};

function DebateEntry(position, content){
    this.position = position, //three options (pro, against, neutral)
    this.content = content, //string
    timeStamp = Date.now()
};

//when second button clicked
function makeSeconded(motion){
    motion.second = true
    //gray out second button
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



