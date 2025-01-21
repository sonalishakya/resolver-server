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

// Function to save the base template to GitHub
async function saveToGitHub(baseTemplate) {
  const uuid = crypto.randomUUID();
  const filename = `${uuid}.json`;
  const content = JSON.stringify(baseTemplate, null, 2);

  const githubRepo = 'sonalishakya/resolver-storage';
  const branch = 'gh-pages';
  const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`;
  const token = "fake-token"; // Replace with actual token from .env

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add file ${filename}`,
      content: btoa(content),
      branch: branch,
    }),
  });

  if (response.ok) {
    console.log(`File saved as ${filename}`);
    alert(`File saved to GitHub as ${filename}`);
  } else {
    const error = await response.json();
    console.error('Error saving file:', error);
    alert('Failed to save file to GitHub. Check your token or repository settings.');
  }

  return uuid;
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

  submitButton.onmouseover = () => submitButton.style.backgroundColor = '#0056b3';
  submitButton.onmouseout = () => submitButton.style.backgroundColor = '#007bff';

  form.appendChild(submitButton);
  form.addEventListener('submit', (event) => handleSubmit(event, template));

  contentElement.appendChild(form);
}

async function handleSubmit(event, template) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Deep copy of the base template to avoid mutation
  const updatedTemplate = JSON.parse(JSON.stringify(template.base_template));

  // Function to recursively replace placeholders with user input
  function populateTemplate(obj, formData) {
    for (let key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        populateTemplate(obj[key], formData);
      } else if (typeof obj[key] === "string" && obj[key].startsWith("{{")) {
        const fieldName = obj[key].replace(/[{}]/g, ""); // Remove {{ }}
        if (formData.has(fieldName)) {
          obj[key] = formData.get(fieldName); // Replace with user input
        }
      }
    }
  }

  // Populate the template with user input values
  populateTemplate(updatedTemplate.properties, formData);

  // Save the updated template to GitHub and generate UUID
  const generatedUUID = await saveToGitHub(updatedTemplate);

  const deeplink = `beckn://github.ondc/${generatedUUID}`;

  // Update UI with styled output
  const contentElement = document.getElementById('template-content');
  contentElement.innerHTML = `
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Deeplink:</p>
      <p style="word-wrap: break-word; font-size: 16px; color: #007bff; margin-bottom: 10px;">
        <a href="${deeplink}" target="_blank" style="text-decoration: none; color: #007bff;">${deeplink}</a>
      </p>
      <button 
        onclick="copyDeeplink('${deeplink}')"
        style="padding: 8px 16px; background-color: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
        Copy
      </button>
    </div>
    <div style="margin-top: 20px; text-align: center;">
      <p style="font-size: 16px; font-weight: bold;">Enter your email to receive confirmation:</p>
    </div>
  `;

  // Email input field
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.style.cssText = `
    padding: 10px;
    width: 100%;
    max-width: 400px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 16px;
    margin-top: 10px;
  `;

  const submitEmailButton = document.createElement('button');
  submitEmailButton.textContent = 'Submit Email';
  submitEmailButton.style.cssText = `
    padding: 10px 20px;
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
  `;

  submitEmailButton.addEventListener('click', () => {
    if (!emailInput.value) {
      alert('Please enter a valid email ID.');
      return;
    }
    alert('Email submitted successfully!');
    contentElement.innerHTML += `<pre style="text-align: left; background: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(updatedTemplate, null, 2)}</pre>`;
  });

  contentElement.appendChild(emailInput);
  contentElement.appendChild(submitEmailButton);
}

// Function to copy the deeplink to clipboard
function copyDeeplink(deeplink) {
  navigator.clipboard.writeText(deeplink);
  alert('Deeplink copied to clipboard!');
}

// async function handleSubmit(event, template) {
//   event.preventDefault();

//   const form = event.target;
//   const formData = new FormData(form);

//   // Deep copy of the base template to avoid mutation
//   const updatedTemplate = JSON.parse(JSON.stringify(template.base_template));

//   // Function to recursively replace placeholders with user input
//   function populateTemplate(obj, formData) {
//     for (let key in obj) {
//       if (typeof obj[key] === "object" && obj[key] !== null) {
//         populateTemplate(obj[key], formData);
//       } else if (typeof obj[key] === "string" && obj[key].startsWith("{{")) {
//         const fieldName = obj[key].replace(/[{}]/g, ""); // Remove {{ }}
//         if (formData.has(fieldName)) {
//           obj[key] = formData.get(fieldName); // Replace with user input
//         }
//       }
//     }
//   }

//   // Populate the template with user input values
//   populateTemplate(updatedTemplate.properties, formData);

//   // Save the updated template to GitHub and generate UUID
//   const generatedUUID = await saveToGitHub(updatedTemplate);

//   const deeplink = `beckn://github.ondc/${generatedUUID}`;

//   // Update UI with the generated deep link
//   const contentElement = document.getElementById('template-content');
//   contentElement.innerHTML = `
//     <p><strong>Deeplink:</strong> 
//       <span style="color: #007bff;">${deeplink}</span> 
//       <button onclick="copyDeeplink('${deeplink}')">Copy</button>
//     </p>
//     <p>Enter your email to receive confirmation:</p>
//   `;

//   // Email input field
//   const emailInput = document.createElement('input');
//   emailInput.type = 'email';
//   emailInput.placeholder = 'Enter your email';
//   emailInput.style.margin = '10px 0';

//   const submitEmailButton = document.createElement('button');
//   submitEmailButton.textContent = 'Submit Email';
//   submitEmailButton.addEventListener('click', () => {
//     if (!emailInput.value) {
//       alert('Please enter a valid email ID.');
//       return;
//     }
//     alert('Email submitted successfully!');
//     contentElement.innerHTML = `<pre>${JSON.stringify(updatedTemplate, null, 2)}</pre>`;
//   });

//   contentElement.appendChild(emailInput);
//   contentElement.appendChild(submitEmailButton);
// }

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

    card.addEventListener('click', () => {
      renderTemplate(template.template_id);
    });
  });
}

// Initial setup on page load
window.onload = function () {
  populateCards();
};

