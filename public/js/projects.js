document.querySelectorAll(".edit-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const view = document.querySelector("#projectView" + id);
    const form = document.querySelector("#projectEditForm" + id);

    form.removeAttribute("hidden");
    view.setAttribute("hidden", true);
  });
});

document.querySelectorAll(".editImagesButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    window.location.href = `/editImages?openForm=${id}`;
  });
});

document.querySelectorAll(".editVideosButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    window.location.href = `/editVideos?openForm=${id}`;
  });
});

document.querySelectorAll(".editFilesButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    window.location.href = `/editFiles?openForm=${id}`;
  });
});

document.querySelector("#addSkillButton").addEventListener("click", () => {
  const container = document.querySelector("#skills-container");
  const newInput = document.createElement("input");
  newInput.setAttribute("type", "text");
  newInput.setAttribute("name", "skills[]");
  newInput.setAttribute("placeholder", "Enter a skill");
  newInput.classList.add("skill-field");
  container.appendChild(newInput);
});

document.querySelectorAll(".deleteTagButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const innerContainer = document.querySelector("#innerContainer" + id);
    if (innerContainer) {
      // <-- safety check to avoid errors if element is missing
      innerContainer.remove();

      fetch("/deleteProjectTag", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagId: id }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to delete tag from server.");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Tag deleted:", data);
        })
        .catch((err) => {
          console.error("Error deleting tag:", err);
        });
    }
  });
});

document.querySelectorAll(".addNewSkills").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    const outerContainer = form.querySelector("#outerContainer");

    const inputs = outerContainer.querySelectorAll("input[name^='skills']");
    let maxIndex = -1;
    inputs.forEach((input) => {
      const match = input.name.match(/skills\[(\d+)]/);
      if (match && parseInt(match[1]) > maxIndex) {
        maxIndex = parseInt(match[1]);
      }
    });
    const newIndex = maxIndex + 1;

    const innerContainer = document.createElement("div");
    innerContainer.classList.add("innerContainer");

    const skillFlexBox = document.createElement("div");
    skillFlexBox.classList.add("skillFlexBox");

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = `skills[${newIndex}][id]`;
    hiddenInput.value = "";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = `skills[${newIndex}][name]`;
    nameInput.placeholder = "Enter a skill";
    nameInput.classList.add("editSkill"); // add this class if your CSS uses it

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("deleteTagButton");
    deleteButton.innerHTML = `<svg class="trashCan" xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                                                    <path
                                                        d="M262.2 48C248.9 48 236.9 56.3 232.2 68.8L216 112L120 112C106.7 112 96 122.7 96 136C96 149.3 106.7 160 120 160L520 160C533.3 160 544 149.3 544 136C544 122.7 533.3 112 520 112L424 112L407.8 68.8C403.1 56.3 391.2 48 377.8 48L262.2 48zM128 208L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 208L464 208L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 208L128 208zM288 280C288 266.7 277.3 256 264 256C250.7 256 240 266.7 240 280L240 456C240 469.3 250.7 480 264 480C277.3 480 288 469.3 288 456L288 280zM400 280C400 266.7 389.3 256 376 256C362.7 256 352 266.7 352 280L352 456C352 469.3 362.7 480 376 480C389.3 480 400 469.3 400 456L400 280z" />
                                                </svg>`;

    deleteButton.addEventListener("click", () => {
      innerContainer.remove();
    });

    skillFlexBox.appendChild(hiddenInput);
    skillFlexBox.appendChild(nameInput);
    skillFlexBox.appendChild(deleteButton);

    innerContainer.appendChild(skillFlexBox);
    outerContainer.appendChild(innerContainer);
  });
});

let projectToDeleteId = null;

document.querySelectorAll(".delete-project-button").forEach((button) => {
  button.addEventListener("click", () => {
    projectToDeleteId = button.dataset.id;
    const projectName = button.dataset.name;

    document.getElementById(
      "modal-text"
    ).textContent = `Are you sure you want to delete "${projectName}"?`;
    document.getElementById("warning").textContent = "Remove project";
    document
      .getElementById("deleteModalOverlay")
      .classList.remove("modal-hidden");
  });
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  document.getElementById("deleteModalOverlay").classList.add("modal-hidden");
  projectToDeleteId = null;
});

document.getElementById("confirmDelete").addEventListener("click", () => {
  if (!projectToDeleteId) return;

  fetch(`/eraseProject/${projectToDeleteId}`, {
    method: "DELETE",
  }).then((res) => {
    if (res.ok) {
      location.reload(); // refresh the page
    } else {
      alert("Failed to delete project");
    }
  });

  document.getElementById("deleteModal").style.display = "none";
});

// store scroll position before submitting
document.querySelectorAll("form[id^='projectEditForm']").forEach((form) => {
  form.addEventListener("submit", () => {
    sessionStorage.setItem("scrollY", window.scrollY);
  });
});

// then load the croll position when reloading the page - when the project saves.
window.addEventListener("load", () => {
  const scrollY = sessionStorage.getItem("scrollY");
  if (scrollY !== null) {
    window.scrollTo(0, parseInt(scrollY));
    sessionStorage.removeItem("scrollY");
  }
});

function setupFileInput(idInput, idDisplay) {
  const input = document.getElementById(idInput);
  const display = document.getElementById(idDisplay);

  input.addEventListener("change", () => {
    if (input.files.length === 0) {
      display.textContent = "No files chosen";
    } else if (input.files.length === 1) {
      display.textContent = input.files[0].name;
    } else {
      display.textContent = `${input.files.length} files selected`;
    }
  });
}

setupFileInput("projectImages", "imagesFileName");
setupFileInput("projectVideos", "videosFileName");
setupFileInput("projectDocs", "docsFileName");

document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyUrlBtn');
  const studentId = copyBtn.dataset.studentId;

  copyBtn.addEventListener('click', () => {
    const url = `${window.location.origin}/profile?studentId=${studentId}`;

    navigator.clipboard.writeText(url)
      .then(() => {
        vanillaToast.success("URL copied!", { 
          timeout: 3000,
          position: "bottom-center"
        });
      })
      .catch(err => {
        alert('Failed to copy URL: ' + err);
      });
  });
});
