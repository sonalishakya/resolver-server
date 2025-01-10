document.addEventListener("DOMContentLoaded", async () => {
  const templateButtonsContainer = document.getElementById("templateButtons");
  const form = document.getElementById("dynamicForm");
  const submitButton = document.getElementById("submitButton");
  const formTitle = document.getElementById("formTitle");

  // Fetch available templates
  const templatesResponse = await fetch("/api/templates");
  const { templates } = await templatesResponse.json();

  // Render template buttons
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.textContent = template;
    button.className = "template-button";
    button.addEventListener("click", () => loadTemplate(template));
    templateButtonsContainer.appendChild(button);
  });

  // Load and render form for the selected template
  async function loadTemplate(templateName) {
    form.innerHTML = ""; // Clear previous form
    formTitle.style.display = "block";
    submitButton.style.display = "block";
    formTitle.textContent = `Form for Template: ${templateName}`;

    const templateResponse = await fetch(`/api/template/${templateName}`);
    const template = await templateResponse.json();
    const { base_template, creation_prop, definition } = template;

    // Render form fields dynamically
    creation_prop.mandatory.forEach((field) => {
      const fieldWrapper = document.createElement("div");
      const label = document.createElement("label");
      label.textContent = field;
      label.htmlFor = field;
      fieldWrapper.appendChild(label);

      let input;
      if (definition.attribute[field]?.value) {
        // Dropdown for predefined values
        input = document.createElement("select");
        input.name = field;
        input.id = field;
        definition.attribute[field].value.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.name;
          input.appendChild(opt);
        });
      } else {
        // Text input for other fields
        input = document.createElement("input");
        input.type = "text";
        input.name = field;
        input.id = field;
      }
      fieldWrapper.appendChild(input);
      form.appendChild(fieldWrapper);
    });

    // Handle form submission
    submitButton.onclick = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const populatedTemplate = { ...base_template };

      creation_prop.mandatory.forEach((field) => {
        const value = formData.get(field);
        for (const section in populatedTemplate) {
          if (typeof populatedTemplate[section] === "object") {
            for (const key in populatedTemplate[section]) {
              if (populatedTemplate[section][key] === `{{${field}}}`) {
                populatedTemplate[section][key] = value;
              }
            }
          }
        }
      });

      // Submit the populated template to the backend
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ populatedTemplate }),
      });
      const result = await response.json();
      alert(result.message);
    };
  }
});