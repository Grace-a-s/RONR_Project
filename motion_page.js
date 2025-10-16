const Data = {
  //motion : new Motion("Motion #1", "I propose that we do this thing")//later will pull this from database
  //most of the data is actually associated with the motion, but I may need this later
  //I wrote a constructor below but this will eventually actually need to be defined with the landing page where motions are initially created
  voteMode: false,
  amendMode: false,
  /*motion: {
    title: "",
    content: "",
    debate: [],
    second: false,
  },*/
  voteActive: false,
};
const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams);
const id = urlParams.get("id");
console.log(id);
var transferData = JSON.parse(localStorage.getItem("data"));
//console.log(transferData); //later will pull this from a database
var motionList = transferData.motion_list;
//console.log(motionList);
var motion = motionList[id];
console.log(motion);
console.log(motion.second);

const secondButton = document.getElementById("second");
secondButton.addEventListener("click", makeSeconded);

preparePage();

const backButton = document.getElementById("back_button");
backButton.addEventListener("click", () => {
  console.log("clicked");
  window.location.href = "landing_page.html";
});
//motion object constructor function (use case on this page?)
/*function Motion(title, content){
    id = 1000,
    this.title = title,
    this.content = content,
    this.timeStamp = Date.now(), //or should it be new Date()?
    second = false,
    debate = []; //array of DebateEntry objects (or should this be object of its own)
    this.author = author
    voteNumber = [0,0]; 
};
*/
//object constructor
function createDebateEntry(position, content) {
  (this.position = position), //three options (pro, against, neutral)
    (this.content = content), //string
    (timeStamp = Date.now()),
    (this.author = author); //author = get author from data
}
function preparePage() {
  //second button
  if (motion.second === true) {
    secondButton.style.display = "none";
  }
  //motion contents
  const motionTitle = document.getElementById("motion_title");
  motionTitle.textContent = motion.title;
  const motionContents = document.getElementById("motion_contents");
  motionContents.textContent = motion.description;
}

//when second button clicked
function makeSeconded() {
  motion.second = true;
  motionList[id] = motion;
  console.log(motionList);
  console.log(transferData.motion_list);
  transferData.motion_list = motionList;
  localStorage.setItem("data", JSON.stringify(transferData)); //not passing the right thing
  secondButton.style.display = "none";
  console.log("pressed second button; second value:", motion.second);
  //show debate button
  //allow debate/allow text entry?
}

//on up arrow button push, takes string from text box into content variable
function addDebateEntry(motion, position, content) {
  motion.debate.push(new DebateEntry(position, content)); //thus prob doesnt work
}

//on 'debate' button push, drop down menu shows of debate entries
function showDebate() {}
