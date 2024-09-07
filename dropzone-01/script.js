/*
        Edge Cases needed to cover
        function to update message display
        Handle file selection via the input
        handle dragover , drag-leave and  drag-end event
        🔰dragleave : dragged item leaves the drop zone area
        🔰dragend : when you release the mouse button to drop the file
        Handle file drop event
        Reset the dropzone when the form is reset
        handle form submission
*/

//select all the necesary elements
const dropzoneBox = document.querySelector(".dropzone-box");
const dropZoneElement = document.querySelector(".dropzone-area");
const inputElement = document.querySelector("#upload-file");
const messageElement = document.querySelector(".message");

//function to update the message display
const updateDropzoneFileList = (file) => {
  messageElement.textContent = `${file.name}, ${file.size} bytes`;
};

// Handle file selection via the input
inputElement.addEventListener("change", () => {
  if (inputElement.files.length) {
    updateDropzoneFileList(inputElement.files[0]);
  }
});

//dragover event
dropZoneElement.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZoneElement.classList.add("dropzone--over");
});

// Handle drag leave  events
dropZoneElement.addEventListener("dragleave", () => {
  dropZoneElement.classList.remove("dropzone--over");
});

//Handle file drop event
dropZoneElement.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length) {
    inputElement.files = e.dataTransfer.files;
    updateDropzoneFileList(e.dataTransfer.files[0]);
  }

  //dropzone bg is cleared when file is finally droped in inputElement
  dropZoneElement.classList.remove("dropzone--over");
});

//reset the dropzone when form is reset
dropzoneBox.addEventListener("reset", (e) => {
  messageElement.textContent = "No Files Selected";
});

//handle form submission
dropzoneBox.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(inputElement.files[0]);
});
