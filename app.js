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

// Function to render the selected template
async function renderTemplate(templateId) {
  const templates = await loadTemplates();
  const template = templates.find((tpl) => tpl.template_id === templateId);

  const contentElement = document.getElementById('template-content');
  if (!contentElement) {
    console.log('Element #template-content not found');
    return;
  }

  contentElement.innerHTML = '';

  if (!template) {
    contentElement.textContent = 'Template not found!';
    return;
  }

  // Render mandatory fields as form elements
  const form = document.createElement('form');
  form.id = 'template-form';

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

  // Create and style the submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit';
  submitButton.style.padding = '10px 20px';
  submitButton.style.backgroundColor = '#007bff';
  submitButton.style.color = '#fff';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '5px';
  submitButton.style.cursor = 'pointer';
  submitButton.style.marginTop = '15px';

  // Hover effect
  submitButton.onmouseover = function () {
    submitButton.style.backgroundColor = '#0056b3';
  };
  submitButton.onmouseout = function () {
    submitButton.style.backgroundColor = '#007bff';
  };

  form.appendChild(submitButton);
  form.addEventListener('submit', (event) => handleSubmit(event, template));

  contentElement.appendChild(form);
}

// Handle form submission
async function handleSubmit(event, template) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Populate the base template with submitted data
  const baseTemplate = JSON.parse(JSON.stringify(template.base_template));
  const creationProps = template.creation_prop?.mandatory || [];

  creationProps.forEach((field) => {
    const value = formData.get(field);
    if (value) {
      baseTemplate.context[field] = value;
    }
  });

  // Create an email input field and confirmation message
  const contentElement = document.getElementById('template-content');
  contentElement.innerHTML = `
    <p>Kindly provide your email ID to receive the deeplink and QR code once your request is reviewed and verified by ONDC.</p>
  `;

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Enter your email ID';
  emailInput.style.margin = '10px 0';
  emailInput.style.padding = '8px';
  emailInput.style.width = '100%';
  emailInput.style.border = '1px solid #ccc';
  emailInput.style.borderRadius = '4px';

  const submitEmailButton = document.createElement('button');
  submitEmailButton.textContent = 'Submit Email';
  submitEmailButton.style.padding = '10px 20px';
  submitEmailButton.style.backgroundColor = '#007bff';
  submitEmailButton.style.color = '#fff';
  submitEmailButton.style.border = 'none';
  submitEmailButton.style.borderRadius = '5px';
  submitEmailButton.style.cursor = 'pointer';

  submitEmailButton.onmouseover = function () {
    submitEmailButton.style.backgroundColor = '#0056b3';
  };
  submitEmailButton.onmouseout = function () {
    submitEmailButton.style.backgroundColor = '#007bff';
  };

  submitEmailButton.addEventListener('click', () => {
    if (!emailInput.value) {
      alert('Please enter a valid email ID.');
      return;
    }
    alert('Email submitted successfully!');
    contentElement.innerHTML = `<pre>${JSON.stringify(baseTemplate, null, 2)}</pre>`;
  });

  contentElement.appendChild(emailInput);
  contentElement.appendChild(submitEmailButton);
}

// Populate the cards with template names
async function populateCards() {
  const templates = await loadTemplates();
  const cardsContainer = document.getElementById('template-cards');

  templates.forEach((template) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.templateId = template.template_id;

    const title = document.createElement('h3');
    title.textContent = template.template_name;

    const description = document.createElement('p');
    description.textContent = `Template ID: ${template.template_id}`;

    card.appendChild(title);
    card.appendChild(description);
    cardsContainer.appendChild(card);

    // Add click event to render template on card selection
    card.addEventListener('click', () => {
      renderTemplate(template.template_id);
    });
  });
}

// Initial setup on page load
window.onload = function () {
  populateCards();
};

// // Function to load the template data from templates.json
// async function loadTemplates() {
//   const response = await fetch('templates/templates.json');
//   const data = await response.json();
//   return data.templates;
// }

// // Function to fetch external data (e.g., city codes, domains) for dropdown
// async function fetchValuesFromUrl(url) {
//   const response = await fetch(url);
//   const data = await response.json();
//   return data;
// }

// // Function to render the selected template
// async function renderTemplate(templateId) {
//   const templates = await loadTemplates();
//   const template = templates.find((tpl) => tpl.template_id === templateId);

//   const contentElement = document.getElementById('template-content');
//   if (!contentElement) {
//     console.log('Element #template-content not found');
//     return;
//   }

//   contentElement.innerHTML = '';

//   if (!template) {
//     contentElement.textContent = 'Template not found!';
//     return;
//   }

//   // Render mandatory fields as form elements
//   const form = document.createElement('form');
//   form.id = 'template-form';

//   const creationProps = template.creation_prop?.mandatory || [];
//   for (const field of creationProps) {
//     const attributeConfig = template.definition.attribute[field];
//     if (attributeConfig && attributeConfig.values_url) {
//       const label = document.createElement('label');
//       label.textContent = field.replace(/_/g, ' ').toUpperCase();
//       label.htmlFor = field;

//       const selectElement = document.createElement('select');
//       selectElement.id = field;
//       selectElement.name = field;

//       const values = await fetchValuesFromUrl(attributeConfig.values_url);
//       values.forEach((item) => {
//         const option = document.createElement('option');
//         option.value = item.value;
//         option.textContent = item.name;
//         selectElement.appendChild(option);
//       });

//       form.appendChild(label);
//       form.appendChild(selectElement);
//       form.appendChild(document.createElement('br'));
//     } else {
//       const label = document.createElement('label');
//       label.textContent = field.replace(/_/g, ' ').toUpperCase();
//       label.htmlFor = field;

//       const inputElement = document.createElement('input');
//       inputElement.type = 'text';
//       inputElement.id = field;
//       inputElement.name = field;

//       form.appendChild(label);
//       form.appendChild(inputElement);
//       form.appendChild(document.createElement('br'));
//     }
//   }

//   // Create and style the submit button
//   const submitButton = document.createElement('button');
//   submitButton.type = 'submit';
//   submitButton.textContent = 'Submit';
//   submitButton.style.padding = '10px 20px';
//   submitButton.style.backgroundColor = '#007bff';
//   submitButton.style.color = '#fff';
//   submitButton.style.border = 'none';
//   submitButton.style.borderRadius = '5px';
//   submitButton.style.cursor = 'pointer';
//   submitButton.style.marginTop = '15px';

//   // Hover effect
//   submitButton.onmouseover = function () {
//     submitButton.style.backgroundColor = '#0056b3';
//   };
//   submitButton.onmouseout = function () {
//     submitButton.style.backgroundColor = '#007bff';
//   };

//   form.appendChild(submitButton);
//   form.addEventListener('submit', (event) => handleSubmit(event, template));

//   contentElement.appendChild(form);
// }

// // Handle form submission
// async function handleSubmit(event, template) {
//   event.preventDefault();

//   const form = event.target;
//   const formData = new FormData(form);

//   // Populate the base template with submitted data
//   const baseTemplate = JSON.parse(JSON.stringify(template.base_template));
//   const creationProps = template.creation_prop?.mandatory || [];

//   creationProps.forEach((field) => {
//     const value = formData.get(field);
//     if (value) {
//       baseTemplate.context[field] = value;
//     }
//   });

//   // Hide the form and display the base template
//   const contentElement = document.getElementById('template-content');
//   contentElement.innerHTML = `<pre>${JSON.stringify(baseTemplate, null, 2)}</pre>`;

//   alert('Template submitted successfully!');
// }

// // Populate the cards with template names
// async function populateCards() {
//   const templates = await loadTemplates();
//   const cardsContainer = document.getElementById('template-cards');

//   templates.forEach((template) => {
//     const card = document.createElement('div');
//     card.className = 'card';
//     card.dataset.templateId = template.template_id;

//     const title = document.createElement('h3');
//     title.textContent = template.template_name;

//     const description = document.createElement('p');
//     description.textContent = `Template ID: ${template.template_id}`;

//     card.appendChild(title);
//     card.appendChild(description);
//     cardsContainer.appendChild(card);

//     // Add click event to render template on card selection
//     card.addEventListener('click', () => {
//       renderTemplate(template.template_id);
//     });
//   });
// }

// // Initial setup on page load
// window.onload = function () {
//   populateCards();
// };
