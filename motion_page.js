//to do list
//1. add message explaining need to second before can debate
//2. add message for when no debate entrys added yet

const Data = {
  //motion : new Motion("Motion #1", "I propose that we do this thing")//later will pull this from database
  //most of the data is actually associated with the motion, but I may need this later
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

//get data from Local Storage (should this be in data above?)
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
//console.log(id);
var transferData = JSON.parse(localStorage.getItem("data")); //later will pull this from database
var motionList = transferData.motion_list;
//console.log(motionList);
var motion = motionList[id];
console.log(motion);
console.log(motion.second);

//set up page, get element from html
const secondButton = document.getElementById("second");
secondButton.addEventListener("click", makeSeconded);

const backButton = document.getElementById("back_button");
backButton.addEventListener("click", () => {
  console.log("clicked");
  window.location.href = "landing_page.html";
});

const debateButton = document.getElementById("debate_button");
debateButton.addEventListener("click", openDebate);

const submitButton = document.getElementById("send_button");
submitButton.addEventListener("click", getDebateEntry);
const textInput = document.getElementById("text_input");

const debateBox = document.getElementById("debate_box");

preparePage();

//object constructor
function DebateEntry(content) {
  //(this.position = position), //three options (pro, against, neutral)
  this.content = content; //string
  // (timeStamp = Date.now()),
  // (this.author = author); //author = get author from data
}
function preparePage() {
  //seconded based actions
  if (motion.second === true) {
    secondButton.style.display = "none";
    debateButton.removeAttribute("disabled");
    motion.debate_list.forEach(addDebateEntry);
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
  updateData();
  /*motionList[id] = motion;
  console.log(motionList);
  console.log(transferData.motion_list);
  transferData.motion_list = motionList;
  localStorage.setItem("data", JSON.stringify(transferData));*/ //not passing the right thing
  secondButton.style.display = "none";
  console.log("pressed second button; second value:", motion.second);
  debateButton.removeAttribute("disabled");
  //show debate button
  //allow debate/allow text entry?
}

//on up arrow button push, takes string from text box into content variable
function getDebateEntry() {
  if (motion.second === true) {
    let debateEntry = new DebateEntry(textInput.value);
    motion.debate_list.push(debateEntry);
    console.log(motion.debate_list);
    updateData();
    textInput.value = "";

    addDebateEntry(debateEntry);
    /*let debateElement = document.createElement("div");
    debateElement.textContent = debateEntry.content;
    debateElement.className = "debate_element";
    debateBox.appendChild(debateElement);*/
  }
  //else=> show a message saying can't debate until seconded
}

function addDebateEntry(entry) {
  let debateElement = document.createElement("div");
  debateElement.textContent = entry.content;
  debateElement.className = "debate_element";
  debateBox.appendChild(debateElement);
}

function updateData() {
  motionList[id] = motion;
  //console.log(motionList);
  transferData.motion_list = motionList;
  localStorage.setItem("data", JSON.stringify(transferData));
}
//on 'debate' button push, drop down menu shows of debate entries
function openDebate() {
  const debateBox = document.getElementById("debate_box");
  if (debateBox.style.display === "block") {
    debateBox.style.display = "none";
  } else {
    debateBox.style.display = "block"; //make area visible
  }
}
