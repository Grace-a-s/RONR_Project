let data = {
  motion_list: []
}

function updateData(new_motion){
  data.motion_list.push(new_motion)
}

function createMotion(id, title, description, timestamp, author) {
  return motion = {
    id: id,
    title: title,
    description: description,
    debate_list: [],
    timestamp: timestamp,
    author: author,
  }
}

const motion_card_grid = document.querySelector(".landing_page_motion_card_grid");
const form = document.querySelector("#create_motion_form");
const createMotionButton = document.getElementById("create_motion");
const cancelButton = document.getElementById("cancel");
const dialog = document.getElementById("create_motion_dialog");

form.querySelector("#motion_title").value = "Sample motion";
form.querySelector("#motion_description").value = "A quick description of the motion";

const saved = localStorage.getItem("data");

if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.motion_list)) {
      data = parsed;
    } else if (Array.isArray(parsed)) {
      // backward-compat if you previously stored an array
      data.motion_list = parsed;
    }
  } catch (e) {
    console.warn("Failed to parse saved data", e);
  }
}

function renderMotions() {
  motion_card_grid.innerHTML = "";
   if (data.motion_list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "landing_page_motion_card_detailed";
    empty.innerHTML = "<span>No motions yet</span>";
    motion_card_grid.appendChild(empty);
    return;
  }

  data.motion_list.forEach((m) => {
    const card = document.createElement("div");
    card.className = "landing_page_motion_card_detailed";
    card.dataset.id = m.id;

    const title = document.createElement("span");
    title.textContent = m.title;
    card.appendChild(title);


    motion_card_grid.appendChild(card);
  });

}

renderMotions();

let id = data.motion_list.length ? Math.max(...data.motion_list.map(m => m.id)) + 1 : 0;

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    let title = formData.get("motion_title");
    let description = formData.get("motion_description");
    let timestamp = Date.now();
    let author = "Author";

    let new_motion = createMotion(id, title, description, timestamp, author);
    
    updateData(new_motion)

    localStorage.setItem("data", JSON.stringify(data));
    renderMotions();
    dialog.close();
    id++;
})


createMotionButton.addEventListener("click", () => {
  dialog.showModal();
});

cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
  dialog.close();
});