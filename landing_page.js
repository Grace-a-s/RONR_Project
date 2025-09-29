function createData(title, description){
    return data = {
        motion_title: title,
        motion_description: description
    }
}

const form = document.querySelector("#create_motion_form");
form.querySelector("#motion_title").value = "Sample motion";
form.querySelector("#motion_description").value = "A quick description of the motion";


form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    let motion_title = formData.get("motion_title");
    let motion_description = formData.get("motion_description")
    data = createData(motion_title, motion_description);
    console.log(data);
})