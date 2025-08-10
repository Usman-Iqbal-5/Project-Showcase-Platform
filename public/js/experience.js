document
  .querySelector("#addExperienceSkillButton")
  .addEventListener("click", () => {
    const container = document.querySelector("#experienceskillsContainer");
    const newInput = document.createElement("input");
    newInput.setAttribute("type", "text");
    newInput.setAttribute("name", "experienceSkills[]");
    newInput.setAttribute("placeholder", "Enter a skill");
    newInput.classList.add("experiences-skill-field");
    container.appendChild(newInput);
  });

document.querySelectorAll(".edit-experience-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const view = document.querySelector("#epxerienceView" + id);
    const form = document.querySelector("#experienceEditForm" + id);

    form.removeAttribute("hidden");
    view.setAttribute("hidden", true);
  });
});

document.querySelectorAll(".deleteExperienceTagButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const innerContainer = document.querySelector(
      "#innerExperienceContainer" + id
    );
    if (innerContainer) {
      // <-- safety check to avoid errors if element is missing
      innerContainer.remove();

      fetch("/deleteExperienceTag", {
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

document.querySelectorAll(".addNewExperienceSkills").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    const outerContainer = form.querySelector("#outerExperienceContainer");

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
    innerContainer.classList.add("innerExperienceContainer");

    const skillFlexBox = document.createElement("div");
    skillFlexBox.classList.add("skillExperienceFlexBox");

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = `skills[${newIndex}][id]`;
    hiddenInput.value = "";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = `skills[${newIndex}][name]`;
    nameInput.placeholder = "Enter a skill";
    nameInput.classList.add("editExperienceSkill");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("deleteExperienceTagButton");
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

document.querySelectorAll(".editExperienceImagesButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    window.location.href = `/editExperienceImages?openForm=${id}`;
  });
});

document.querySelectorAll(".editExperienceVideosButton").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    window.location.href = `/editExperienceVideos?openForm=${id}`;
  });
});

let experienceToDeleteId = null;

document.querySelectorAll(".delete-experience-button").forEach((button) => {
  button.addEventListener("click", () => {
    experienceToDeleteId = button.dataset.id;
    const experienceName = button.dataset.name;

    document.getElementById(
      "modalText"
    ).textContent = `Are you sure you want to delete "${experienceName}"?`;
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
  if (!experienceToDeleteId) return;

  fetch(`/eraseExperience/${experienceToDeleteId}`, {
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
