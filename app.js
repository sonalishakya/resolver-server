// app.js

// Function to fetch and render templates from templates.json
async function loadTemplates() {
  try {
      // Fetch the templates data from the JSON file
      const response = await fetch('templates.json'); // Make sure the path is correct
      const templatesData = await response.json();

      // Get the templates container element
      const templatesContainer = document.getElementById('templates-container');
      
      // Clear any previous templates
      templatesContainer.innerHTML = '';

      console.log("Temp - ", templatesData);
      // Loop through each template and create its UI
      templatesData.forEach((template) => {
          const templateCard = document.createElement('div');
          templateCard.classList.add('template-card');
          
          // Add the template name as a heading
          const templateName = document.createElement('h2');
          templateName.textContent = template.template_name;
          templateCard.appendChild(templateName);
          
          // Create the dropdown for attributes
          const attributesDropdown = document.createElement('select');
          attributesDropdown.classList.add('attributes-dropdown');
          
          // For each attribute in the template, create an option element
          Object.keys(template.definition.attribute).forEach((attribute) => {
              const attributeValues = template.definition.attribute[attribute].value;
              
              // Create a dropdown option for each attribute value
              attributeValues.forEach((value) => {
                  const option = document.createElement('option');
                  option.value = value.value;
                  option.textContent = value.name;
                  attributesDropdown.appendChild(option);
              });
          });
          
          // Append the dropdown to the template card
          templateCard.appendChild(attributesDropdown);
          
          // Add a "Generate" button for submitting the selection
          const generateButton = document.createElement('button');
          generateButton.textContent = 'Generate Template';
          generateButton.classList.add('generate-button');
          generateButton.addEventListener('click', () => generateTemplate(template, attributesDropdown));
          templateCard.appendChild(generateButton);
          
          // Append the template card to the container
          templatesContainer.appendChild(templateCard);
      });
  } catch (error) {
      console.error('Error loading templates:', error);
  }
}

// Function to generate the template based on selected values
function generateTemplate(template, attributesDropdown) {
  const selectedValue = attributesDropdown.value;
  
  // Replace placeholders in the template with selected values
  let generatedTemplate = JSON.parse(JSON.stringify(template.base_template)); // Deep copy
  
  // Find all placeholders and replace them with the selected value
  Object.keys(generatedTemplate.context).forEach((key) => {
      if (generatedTemplate.context[key].includes("{{")) {
          generatedTemplate.context[key] = generatedTemplate.context[key].replace("{{city_code}}", selectedValue);
      }
  });

  // Display the generated template (you can customize this to display it in a better format)
  const generatedTemplateDisplay = document.getElementById('generated-template-display');
  generatedTemplateDisplay.textContent = JSON.stringify(generatedTemplate, null, 2);
}

// Call the loadTemplates function when the page loads
document.addEventListener('DOMContentLoaded', loadTemplates);



// // Available templates
// const templates = ["template1", "template2", "template3"];

// // Populate dropdown with template names
// const dropdown = document.getElementById("template-dropdown");
// templates.forEach((template) => {
//   const option = document.createElement("option");
//   option.value = template;
//   option.textContent = template;
//   dropdown.appendChild(option);
// });

// // Fetch and render template content
// function fetchTemplate(templateName) {
//   fetch(`templates/${templateName}.json`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Failed to fetch ${templateName}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       renderTemplate(data);
//     })
//     .catch((error) => {
//       console.error("Error fetching template:", error);
//       document.getElementById("template-content").textContent =
//         "Error loading template.";
//     });
// }

// // Render the template JSON in the display section
// function renderTemplate(templateData) {
//   const contentElement = document.getElementById("template-content");
//   contentElement.textContent = JSON.stringify(templateData, null, 2);
// }

// // Add event listener for dropdown changes
// dropdown.addEventListener("change", (event) => {
//   const selectedTemplate = event.target.value;
//   if (selectedTemplate) {
//     fetchTemplate(selectedTemplate);
//   }
// });



// document.addEventListener("DOMContentLoaded", async () => {
//   const templateButtonsContainer = document.getElementById("templateButtons");
//   const form = document.getElementById("dynamicForm");
//   const submitButton = document.getElementById("submitButton");
//   const formTitle = document.getElementById("formTitle");

//   // Fetch available templates
//   const templatesResponse = await fetch("/api/templates");
//   const { templates } = await templatesResponse.json();

//   // Render template buttons
//   templates.forEach((template) => {
//     const button = document.createElement("button");
//     button.textContent = template;
//     button.className = "template-button";
//     button.addEventListener("click", () => loadTemplate(template));
//     templateButtonsContainer.appendChild(button);
//   });

//   // Load and render form for the selected template
//   async function loadTemplate(templateName) {
//     form.innerHTML = ""; // Clear previous form
//     formTitle.style.display = "block";
//     submitButton.style.display = "block";
//     formTitle.textContent = `Form for Template: ${templateName}`;

//     const templateResponse = await fetch(`/api/template/${templateName}`);
//     const template = await templateResponse.json();
//     const { base_template, creation_prop, definition } = template;

//     // Render form fields dynamically
//     creation_prop.mandatory.forEach((field) => {
//       const fieldWrapper = document.createElement("div");
//       const label = document.createElement("label");
//       label.textContent = field;
//       label.htmlFor = field;
//       fieldWrapper.appendChild(label);

//       let input;
//       if (definition.attribute[field]?.value) {
//         // Dropdown for predefined values
//         input = document.createElement("select");
//         input.name = field;
//         input.id = field;
//         definition.attribute[field].value.forEach((option) => {
//           const opt = document.createElement("option");
//           opt.value = option.value;
//           opt.textContent = option.name;
//           input.appendChild(opt);
//         });
//       } else {
//         // Text input for other fields
//         input = document.createElement("input");
//         input.type = "text";
//         input.name = field;
//         input.id = field;
//       }
//       fieldWrapper.appendChild(input);
//       form.appendChild(fieldWrapper);
//     });

//     // Handle form submission
//     submitButton.onclick = async (e) => {
//       e.preventDefault();
//       const formData = new FormData(form);
//       const populatedTemplate = { ...base_template };

//       creation_prop.mandatory.forEach((field) => {
//         const value = formData.get(field);
//         for (const section in populatedTemplate) {
//           if (typeof populatedTemplate[section] === "object") {
//             for (const key in populatedTemplate[section]) {
//               if (populatedTemplate[section][key] === `{{${field}}}`) {
//                 populatedTemplate[section][key] = value;
//               }
//             }
//           }
//         }
//       });

//       // Submit the populated template to the backend
//       const response = await fetch("/api/submit", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ populatedTemplate }),
//       });
//       const result = await response.json();
//       alert(result.message);
//     };
//   }
// });