const STORAGE_KEY = 'iws-project-builder-v1';
const WELCOME_SEEN_KEY = 'iws-welcome-seen';

const config = {
  siteTypes: [
    'Business brochure / marketing site',
    'Ecommerce / store',
    'Portfolio / gallery',
    'Internal tool / portal',
    'Not sure (guide me)'
  ],
  features: [
    'Employee login / roles',
    'Online payments / web shop',
    'Booking / scheduling',
    'Quote request / lead form',
    'Image/video gallery',
    'Blog / articles',
    'Membership / subscriber content',
    'Client dashboard / project updates',
    'Analytics / conversion tracking',
    'SEO + local pages'
  ],
  priorities: [
    'Stand out visually',
    'Load fast / performance',
    'Rank on Google / SEO',
    'Convert leads / sales',
    'Maintainable long-term'
  ]
};

const shell = document.getElementById('wb-shell');

if (shell) {
  const live = document.getElementById('wb-live');
  const builder = document.getElementById('wb-builder');
  const form = document.getElementById('wb-form');

  const siteTypeContainer = document.getElementById('wb-site-type-options');
  const featureContainer = document.getElementById('wb-feature-options');
  const priorityContainer = document.getElementById('wb-priority-options');

  const subjectInput = document.getElementById('wb-subject');
  const descriptionInput = document.getElementById('wb-description');

  const summary = document.getElementById('wb-summary');
  const summaryBody = document.getElementById('wb-summary-body');
  const copyButton = document.getElementById('wb-copy');
  const copyStatus = document.getElementById('wb-copy-status');
  const resetButton = document.getElementById('wb-reset');

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const getSessionValue = (key) => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const setSessionValue = (key, value) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Ignore write failures.
    }
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const buildOptions = (items, type, name) =>
    items
      .map((label, index) => {
        const id = `wb-${name}-${slugify(label)}-${index}`;
        return `
          <label class="wb-option" for="${id}">
            <input id="${id}" type="${type}" name="${name}" value="${label}" />
            <span>${label}</span>
          </label>
        `;
      })
      .join('');

  siteTypeContainer.innerHTML = buildOptions(config.siteTypes, 'radio', 'siteType');
  featureContainer.innerHTML = buildOptions(config.features, 'checkbox', 'features');
  priorityContainer.innerHTML = buildOptions(config.priorities, 'radio', 'priority');

  const getState = () => {
    const siteType = form.querySelector('input[name="siteType"]:checked')?.value || '';
    const priority = form.querySelector('input[name="priority"]:checked')?.value || '';
    const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map((item) => item.value);

    return {
      siteType,
      features,
      priority,
      subject: subjectInput.value.trim(),
      description: descriptionInput.value.trim()
    };
  };

  const saveState = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    } catch {
      // Ignore write failures.
    }
  };

  const restoreState = () => {
    let saved;

    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      saved = null;
    }

    if (!saved) {
      return;
    }

    const getInputByValue = (name, value) =>
      Array.from(form.querySelectorAll(`input[name="${name}"]`)).find((input) => input.value === value);

    if (saved.siteType) {
      const input = getInputByValue('siteType', saved.siteType);
      if (input) input.checked = true;
    }

    if (saved.priority) {
      const input = getInputByValue('priority', saved.priority);
      if (input) input.checked = true;
    }

    if (Array.isArray(saved.features)) {
      saved.features.forEach((feature) => {
        const input = getInputByValue('features', feature);
        if (input) input.checked = true;
      });
    }

    if (typeof saved.subject === 'string') {
      subjectInput.value = saved.subject;
    }

    if (typeof saved.description === 'string') {
      descriptionInput.value = saved.description;
    }
  };

  const inferStructure = (siteType, features) => {
    if (siteType === 'Ecommerce / store') {
      return 'Home, Shop, Product Detail, Cart, Checkout, Contact';
    }

    if (siteType === 'Portfolio / gallery') {
      return 'Home, Work Gallery, About, Services, Contact';
    }

    if (siteType === 'Internal tool / portal') {
      return 'Login, Dashboard, Tasks, Reports, Support';
    }

    if (features.includes('Booking / scheduling')) {
      return 'Home, Services, Availability, Booking, Contact';
    }

    if (features.includes('Membership / subscriber content')) {
      return 'Home, Member Plans, Sign In, Member Library, Support';
    }

    return 'Home, Services, About, Proof/Portfolio, Contact';
  };

  const inferBuildPieces = (features) => {
    const pieces = [];

    if (features.includes('Booking / scheduling')) pieces.push('Booking workflow');
    if (features.includes('Quote request / lead form')) pieces.push('Lead capture form');
    if (features.includes('Image/video gallery')) pieces.push('Gallery module');
    if (features.includes('Online payments / web shop')) pieces.push('Payments + checkout');
    if (features.includes('Employee login / roles')) pieces.push('Role-based auth');
    if (features.includes('Client dashboard / project updates')) pieces.push('Client dashboard');

    if (!pieces.length) {
      pieces.push('Clear conversion-focused sections', 'Fast contact pathway');
    }

    return pieces.slice(0, 3).join(' + ');
  };

  const inferFocus = (priority, features) => {
    if (priority === 'Load fast / performance') {
      return 'Engineering focus: lean assets, image optimization, and mobile-first performance budget.';
    }

    if (priority === 'Rank on Google / SEO') {
      return 'Engineering focus: local SEO page structure, schema basics, and crawl-friendly content hierarchy.';
    }

    if (priority === 'Convert leads / sales') {
      return 'Engineering focus: clearer CTA hierarchy, short paths to contact, and conversion event tracking.';
    }

    if (priority === 'Stand out visually') {
      return 'Engineering focus: premium visual rhythm while preserving accessibility and quick load times.';
    }

    if (features.includes('Analytics / conversion tracking')) {
      return 'Engineering focus: analytics baseline with conversion events and practical reporting hooks.';
    }

    return 'Engineering focus: maintainable architecture, accessibility baseline, and practical content workflows.';
  };

  const validateState = (state) => {
    if (!state.siteType) {
      return 'Select a site type.';
    }

    if (!state.priority) {
      return 'Select a project priority.';
    }

    if (!state.subject) {
      return 'Enter your project subject or business name.';
    }

    if (!state.description) {
      return 'Add a short project description.';
    }

    return '';
  };

  const buildSummaryText = (state) => {
    const selectedFeatures = state.features.length ? state.features.join(', ') : 'No specific features selected yet';

    const bullets = [
      `Recommended structure: ${inferStructure(state.siteType, state.features)}`,
      `Suggested build pieces: ${inferBuildPieces(state.features)}`,
      inferFocus(state.priority, state.features)
    ];

    const lines = [
      `Project subject: ${state.subject}`,
      `Site type: ${state.siteType}`,
      `Priority: ${state.priority}`,
      `Selected features: ${selectedFeatures}`,
      `Goal: ${state.description}`,
      'Recommended direction:',
      ...bullets.map((item) => `- ${item}`)
    ];

    return { lines, bullets, selectedFeatures };
  };

  const renderSummary = (state) => {
    const result = buildSummaryText(state);

    summaryBody.innerHTML = `
      <p><strong>Subject:</strong> ${state.subject}</p>
      <p><strong>Site type:</strong> ${state.siteType}</p>
      <p><strong>Priority:</strong> ${state.priority}</p>
      <p><strong>Features:</strong> ${result.selectedFeatures}</p>
      <p><strong>Goal:</strong> ${state.description}</p>
      <ul>
        ${result.bullets.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    `;

    summary.dataset.summaryText = result.lines.join('\n');
    summary.classList.add('wb-ready');
    copyButton.disabled = false;

    live.textContent = `Project summary generated for ${state.subject}.`;
  };

  const resetForm = () => {
    form.reset();
    summaryBody.innerHTML = '<p>Choose your project details, then generate a summary.</p>';
    summary.dataset.summaryText = '';
    summary.classList.remove('wb-ready');
    copyButton.disabled = true;
    copyStatus.textContent = '';

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore remove failures.
    }

    live.textContent = 'Builder reset.';
    subjectInput.focus();
  };

  const runWelcomeFlow = () => {
    const prefersReducedMotion = motionQuery.matches;
    const hasSeenWelcome = getSessionValue(WELCOME_SEEN_KEY) === 'true';

    if (prefersReducedMotion) {
      shell.dataset.state = 'reduced';
      builder.hidden = false;
      live.textContent = 'Project builder ready.';
      return;
    }

    if (hasSeenWelcome) {
      shell.dataset.state = 'builder';
      builder.hidden = false;
      live.textContent = 'Project builder ready.';
      return;
    }

    shell.dataset.state = 'welcome';
    builder.hidden = true;

    window.setTimeout(() => {
      shell.dataset.state = 'builder';
      builder.hidden = false;
      setSessionValue(WELCOME_SEEN_KEY, 'true');
      live.textContent = 'Welcome complete. Project builder ready.';
    }, 1150);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const state = getState();
    const error = validateState(state);

    if (error) {
      copyStatus.textContent = error;
      live.textContent = error;
      return;
    }

    renderSummary(state);
    saveState();
    copyStatus.textContent = '';
  });

  copyButton.addEventListener('click', async () => {
    const summaryText = summary.dataset.summaryText;
    if (!summaryText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      copyStatus.textContent = 'Summary copied.';
    } catch {
      copyStatus.textContent = 'Copy failed. You can still select and copy the summary text manually.';
    }
  });

  resetButton.addEventListener('click', resetForm);

  form.addEventListener('change', saveState);
  form.addEventListener('input', saveState);

  motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) {
      shell.dataset.state = 'reduced';
      builder.hidden = false;
    }
  });

  restoreState();
  runWelcomeFlow();
}
