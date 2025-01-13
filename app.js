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

  // Add a submit button to the form
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit';
  form.appendChild(submitButton);

  // Append the form to the content element
  contentElement.appendChild(form);

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    // Collect form data
    const formData = new FormData(form);
    const populatedFields = {};
    for (const [key, value] of formData.entries()) {
      populatedFields[key] = value;
    }

    // Merge form data into base_template
    const completePayload = JSON.parse(JSON.stringify(template.base_template)); // Deep copy
    const context = completePayload.context;

    // Populate template fields
    for (const [key, value] of Object.entries(populatedFields)) {
      if (context.hasOwnProperty(key)) {
        context[key] = value;
      }
    }

    console.log('Complete Payload:', completePayload);

    // Send payload to backend
    try {
      const response = await fetch('https://your-backend-endpoint.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completePayload),
      });
      const result = await response.json();
      console.log('Response from backend:', result);
    } catch (error) {
      console.error('Error sending payload:', error);
    }
  });
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


//-------------------------------------------

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

// // Render the selected template
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

//   // Add Submit Button
//   const submitButton = document.createElement('button');
//   submitButton.type = 'submit';
//   submitButton.textContent = 'Submit';
//   form.appendChild(submitButton);

//   // Add form submission handler
//   form.addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent page reload

//     // Collect form data
//     const formData = new FormData(form);
//     const payload = {};
//     for (const [key, value] of formData.entries()) {
//       payload[key] = value;
//     }

//     console.log('Payload:', payload);

//     // Send payload to backend
//     try {
//       const response = await fetch('https://your-backend-endpoint.com/api/submit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json();
//       console.log('Response from backend:', result);
//     } catch (error) {
//       console.error('Error sending payload:', error);
//     }
//   });

//   // Append the form to the content element
//   contentElement.appendChild(form);
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


///---------------------

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

// // Render the selected template
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

//   if (!template) {
//     contentElement.textContent = 'Template not found!';
//     return;
//   }

//   // Render mandatory fields as form elements
//   const form = document.createElement('form');
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

//   // Append the form to the content element
//   contentElement.appendChild(form);
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

