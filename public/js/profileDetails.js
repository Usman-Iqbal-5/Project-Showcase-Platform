//
document.querySelector("#editProfileDetails").addEventListener("click", () => {
  const view = document.querySelector("#profileDetailsView");
  const form = document.querySelector("#profileDetailsEditForm");

  form.removeAttribute("hidden");
  view.setAttribute("hidden", "true");
});
