// Function to load the template data from templates.json
async function loadTemplates() {
  const response = await fetch('templates/templates.json');
  const data = await response.json();
  return data.templates;
}

// Function to fetch external data (e.g., city codes, domains) for dropdown
async function fetchValuesFromUrl(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Populate the dropdown with template names and attributes
async function populateDropdown() {
  const templates = await loadTemplates();
  const dropdown = document.getElementById('template-dropdown');
  templates.forEach((template) => {
    const option = document.createElement('option');
    option.value = template.template_id;
    option.textContent = template.template_name;
    dropdown.appendChild(option);
  });
}

// Render the selected template
async function renderTemplate(templateId) {
  const templates = await loadTemplates();
  const template = templates.find((tpl) => tpl.template_id === templateId);

  // Ensure the content element is available
  const contentElement = document.getElementById('template-content');
  if (!contentElement) {
    console.log('Element #template-content not found');
    return;
  }

  // Clear any existing content
  contentElement.innerHTML = '';

  if (!template) {
    contentElement.textContent = 'Template not found!';
    return;
  }

  // Render mandatory fields as form elements
  const form = document.createElement('form');
  const creationProps = template.creation_prop?.mandatory || [];

  for (const field of creationProps) {
    const attributeConfig = template.definition.attribute[field];
    if (attributeConfig && attributeConfig.values_url) {
      const label = document.createElement('label');
      label.textContent = field.replace(/_/g, ' ').toUpperCase();
      label.htmlFor = field;

      const selectElement = document.createElement('select');
      selectElement.id = field;
      selectElement.name = field;

      const values = await fetchValuesFromUrl(attributeConfig.values_url);
      values.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.name;
        selectElement.appendChild(option);
      });

      form.appendChild(label);
      form.appendChild(selectElement);
      form.appendChild(document.createElement('br'));
    } else {
      const label = document.createElement('label');
      label.textContent = field.replace(/_/g, ' ').toUpperCase();
      label.htmlFor = field;

      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.id = field;
      inputElement.name = field;

      form.appendChild(label);
      form.appendChild(inputElement);
      form.appendChild(document.createElement('br'));
    }
  }

  // Append the form to the content element
  contentElement.appendChild(form);
}
// async function renderTemplate(templateId) {
//   const templates = await loadTemplates();
//   const template = templates.find((tpl) => tpl.template_id === templateId);
  
//   // Ensure the content element is available
//   const contentElement = document.getElementById('template-content');
//   if (!contentElement) {
//     console.log('Element #template-content not found');
//     return;
//   }

//   // Clear any existing content
//   contentElement.innerHTML = '';

//   // Fetch values dynamically based on template's attributes
//   for (const [attribute, config] of Object.entries(template.definition.attribute)) {
//     const values = await fetchValuesFromUrl(config.values_url);
//     const selectElement = document.createElement('select');
    
//     values.forEach((item) => {
//       const option = document.createElement('option');
//       option.value = item.value;
//       option.textContent = item.name;
//       selectElement.appendChild(option);
//     });

//     contentElement.appendChild(selectElement);
//   }
// }


// Event listener for dropdown change
document.getElementById('template-dropdown').addEventListener('change', (event) => {
  const selectedTemplate = event.target.value;
  if (selectedTemplate) {
    renderTemplate(selectedTemplate);
  }
});

// Initial setup on page load
window.onload = function() {
  populateDropdown();
};

// // Function to load the template data from templates.json
// async function loadTemplates() {
//   const response = await fetch('templates.json');
//   const data = await response.json();
//   return data.templates;
// }

// // Populate the dropdown with template names
// async function populateDropdown() {
//   const templates = await loadTemplates();
//   const dropdown = document.getElementById('template-dropdown');
//   templates.forEach((template) => {
//     const option = document.createElement('option');
//     option.value = template.template_id;
//     option.textContent = template.template_name;
//     dropdown.appendChild(option);
//   });
// }

// // Render the form based on the selected template
// async function renderTemplateForm(templateId) {
//   const templates = await loadTemplates();
//   const template = templates.find((tpl) => tpl.template_id === templateId);
//   const formElement = document.getElementById('template-fields');
//   formElement.innerHTML = ''; // Clear existing form fields

//   if (template) {
//     const attributes = template.definition.attribute;
//     for (let key in attributes) {
//       const attribute = attributes[key];
//       const fieldWrapper = document.createElement('div');
//       fieldWrapper.classList.add('field-wrapper');

//       const label = document.createElement('label');
//       label.textContent = key;
//       fieldWrapper.appendChild(label);

//       const input = document.createElement('select');
//       input.name = key;
//       input.id = key;

//       attribute.value.forEach((optionData) => {
//         const option = document.createElement('option');
//         option.value = optionData.value;
//         option.textContent = optionData.name;
//         input.appendChild(option);
//       });

//       fieldWrapper.appendChild(input);
//       formElement.appendChild(fieldWrapper);
//     }

//     const submitButton = document.createElement('button');
//     submitButton.type = 'submit';
//     submitButton.textContent = 'Generate Deep Link';
//     formElement.appendChild(submitButton);
//   }
// }

// // Event listener for dropdown change
// document.getElementById('template-dropdown').addEventListener('change', (event) => {
//   const selectedTemplate = event.target.value;
//   if (selectedTemplate) {
//     renderTemplateForm(selectedTemplate);
//   }
// });

// // Initial setup on page load
// window.onload = function() {
//   populateDropdown();
// };



// // Function to load the template data from templates.json
// async function loadTemplates() {
//   const response = await fetch('templates.json');
//   const data = await response.json();
//   return data.templates;
// }

// // Populate the dropdown with template names
// async function populateDropdown() {
//   const templates = await loadTemplates();
//   const dropdown = document.getElementById('template-dropdown');
//   templates.forEach((template) => {
//     const option = document.createElement('option');
//     option.value = template.template_id;
//     option.textContent = template.template_name;
//     dropdown.appendChild(option);
//   });
// }

// // Render the selected template
// async function renderTemplate(templateId) {
//   const templates = await loadTemplates();
//   const template = templates.find((tpl) => tpl.template_id === templateId);
//   const contentElement = document.getElementById('template-content');
  
//   if (template) {
//     const formattedTemplate = JSON.stringify(template, null, 2);
//     contentElement.textContent = formattedTemplate;
//   }
// }

// // Event listener for dropdown change
// document.getElementById('template-dropdown').addEventListener('change', (event) => {
//   const selectedTemplate = event.target.value;
//   if (selectedTemplate) {
//     renderTemplate(selectedTemplate);
//   }
// });

// // Initial setup on page load
// window.onload = function() {
//   populateDropdown();
// };
