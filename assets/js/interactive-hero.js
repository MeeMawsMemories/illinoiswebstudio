const STORAGE_KEY = 'iws-project-builder-v1';
const WELCOME_SEEN_KEY = 'iws-welcome-seen';
const GENERATED_SUMMARY_HEADING = '--- Generated Project Summary ---';
const GENERATED_SUMMARY_BREAK = '\n\n\n';

const config = {
  startingPoints: [
    'I would like to start a new website',
    'I already have a website and need help with it',
    'I need help with something else'
  ],
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

  const startingPointContainer = document.getElementById('wb-starting-point-options');
  const siteTypeContainer = document.getElementById('wb-site-type-options');
  const featureContainer = document.getElementById('wb-feature-options');
  const priorityContainer = document.getElementById('wb-priority-options');
  const startingPointFieldset = document.getElementById('wb-starting-point');
  const siteTypeFieldset = document.getElementById('wb-site-type');
  const featuresFieldset = document.getElementById('wb-features');
  const priorityFieldset = document.getElementById('wb-priority');
  const subjectStep = document.getElementById('wb-subject-step');
  const descriptionStep = document.getElementById('wb-description-step');
  const confirmStartingPointButton = document.getElementById('wb-confirm-starting-point');
  const confirmSiteTypeButton = document.getElementById('wb-confirm-site-type');
  const confirmFeaturesButton = document.getElementById('wb-confirm-features');
  const confirmPriorityButton = document.getElementById('wb-confirm-priority');
  const confirmSubjectButton = document.getElementById('wb-confirm-subject');
  const confirmDescriptionButton = document.getElementById('wb-confirm-description');
  const backSiteTypeButton = document.getElementById('wb-back-site-type');
  const backFeaturesButton = document.getElementById('wb-back-features');
  const backPriorityButton = document.getElementById('wb-back-priority');
  const backSubjectButton = document.getElementById('wb-back-subject');
  const backDescriptionButton = document.getElementById('wb-back-description');

  const subjectInput = document.getElementById('wb-subject');
  const descriptionInput = document.getElementById('wb-description');

  const summary = document.getElementById('wb-summary');
  const summaryBody = document.getElementById('wb-summary-body');
  const copyStatus = document.getElementById('wb-copy-status');
  const contactCtaButton = document.getElementById('wb-contact-cta');
  const resetButton = document.getElementById('wb-reset');
  const contactSection = document.getElementById('contact');
  const contactNameInput = document.getElementById('contact-name');
  const contactMessageInput = document.getElementById('contact-message');

  const railHighlightsList = document.getElementById('rail-highlights-list');
  const railNextCopy = document.getElementById('rail-next-copy');
  const railNextLink = document.getElementById('rail-next-link');

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

  startingPointContainer.innerHTML = buildOptions(config.startingPoints, 'radio', 'startingPoint');
  siteTypeContainer.innerHTML = buildOptions(config.siteTypes, 'radio', 'siteType');
  featureContainer.innerHTML = buildOptions(config.features, 'checkbox', 'features');
  priorityContainer.innerHTML = buildOptions(config.priorities, 'radio', 'priority');

  const getState = () => {
    const startingPoint = form.querySelector('input[name="startingPoint"]:checked')?.value || '';
    const siteType = form.querySelector('input[name="siteType"]:checked')?.value || '';
    const priority = form.querySelector('input[name="priority"]:checked')?.value || '';
    const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map((item) => item.value);

    return {
      startingPoint,
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

    if (saved.startingPoint) {
      const input = getInputByValue('startingPoint', saved.startingPoint);
      if (input) input.checked = true;
    }

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
    if (!state.startingPoint) {
      return 'Select how you would like help.';
    }

    if (!state.siteType) {
      return 'Select a site type.';
    }

    if (!state.features.length) {
      return 'Select at least one feature.';
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

  const highlightMap = {
    'Business brochure / marketing site': [
      'Service-first structure for quick scanning.',
      'Local trust signals near contact actions.',
      'Conversion-focused copy blocks by section.'
    ],
    'Ecommerce / store': [
      'Product discovery and category flow tuned for speed.',
      'Checkout path reduced to fewer decision points.',
      'Conversion tracking on cart and purchase actions.'
    ],
    'Portfolio / gallery': [
      'Work samples prioritized above long paragraphs.',
      'Project detail templates for consistent storytelling.',
      'Inquiry actions placed beside high-intent content.'
    ],
    'Internal tool / portal': [
      'Role-based navigation to reduce user friction.',
      'Dashboard-first flow for daily recurring tasks.',
      'Security and permissions considered from the start.'
    ],
    'Not sure (guide me)': [
      'Start with goals before choosing complex features.',
      'Build a lean first version, then iterate with data.',
      'Prioritize one conversion outcome for launch.'
    ]
  };

  const renderRailHighlights = (state) => {
    if (!railHighlightsList) {
      return;
    }

    const items = highlightMap[state.siteType] || highlightMap['Not sure (guide me)'];

    railHighlightsList.innerHTML = items.map((item) => `<li>${item}</li>`).join('');

    if (railNextCopy) {
      railNextCopy.textContent = state.siteType
        ? 'Complete the builder steps and your summary will be added automatically before you submit the contact form.'
        : 'Choose how you need help, then complete the builder steps in the center panel.';
    }

    if (railNextLink) {
      railNextLink.setAttribute('href', '#builder-hero');
      railNextLink.textContent = 'Go to Project Builder';
    }
  };

  const buildSummaryText = (state) => {
    const selectedFeatures = state.features.length ? state.features.join(', ') : 'No specific features selected yet';

    const bullets = [
      `Recommended structure: ${inferStructure(state.siteType, state.features)}`,
      `Suggested build pieces: ${inferBuildPieces(state.features)}`,
      inferFocus(state.priority, state.features)
    ];

    const lines = [
      `Project type: ${state.startingPoint}`,
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
      <p><strong>Project type:</strong> ${state.startingPoint}</p>
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

    if (contactMessageInput) {
      const markerIndex = contactMessageInput.value.indexOf(GENERATED_SUMMARY_BREAK + GENERATED_SUMMARY_HEADING);
      const currentMessage = markerIndex >= 0
        ? contactMessageInput.value.slice(0, markerIndex).trimEnd()
        : contactMessageInput.value.trimEnd();
      const summaryBlock = `${GENERATED_SUMMARY_BREAK}${GENERATED_SUMMARY_HEADING}\n${summary.dataset.summaryText}`;
      contactMessageInput.value = `${currentMessage}${summaryBlock}`;
    }

    live.textContent = `Project summary generated for ${state.subject}.`;
  };

  const setStep = (step) => {
    const applyVisibility = (fieldset, isVisible) => {
      if (!fieldset) {
        return;
      }

      fieldset.hidden = !isVisible;
      fieldset.style.display = isVisible ? '' : 'none';
    };

    applyVisibility(startingPointFieldset, step === 1);
    applyVisibility(siteTypeFieldset, step === 2);
    applyVisibility(featuresFieldset, step === 3);
    applyVisibility(priorityFieldset, step === 4);
    applyVisibility(subjectStep, step === 5);
    applyVisibility(descriptionStep, step === 6);
    applyVisibility(summary, step === 7 && summary.classList.contains('wb-ready'));
  };

  const inferCurrentStep = () => {
    const state = getState();

    if (!state.startingPoint) {
      return 1;
    }

    if (state.startingPoint === 'I need help with something else') {
      return 1;
    }

    if (!state.siteType) {
      return 2;
    }

    if (!state.features.length) {
      return 3;
    }

    if (!state.priority) {
      return 4;
    }

    if (!state.subject) {
      return 5;
    }

    if (!state.description) {
      return 6;
    }

    return 6;
  };

  const focusStep = (step) => {
    const input =
      step === 1
        ? startingPointFieldset?.querySelector('input')
        : step === 2
          ? siteTypeFieldset?.querySelector('input')
          : step === 3
            ? featuresFieldset?.querySelector('input')
            : step === 4
              ? priorityFieldset?.querySelector('input')
          : step === 5
              ? subjectInput
              : descriptionInput;

    if (input) {
      input.focus();
    }
  };

  const updateConfirmButtons = () => {
    if (confirmStartingPointButton) {
      confirmStartingPointButton.disabled = !form.querySelector('input[name="startingPoint"]:checked');
    }

    if (confirmSiteTypeButton) {
      confirmSiteTypeButton.disabled = !form.querySelector('input[name="siteType"]:checked');
    }

    if (confirmFeaturesButton) {
      confirmFeaturesButton.disabled = !form.querySelector('input[name="features"]:checked');
    }

    if (confirmPriorityButton) {
      confirmPriorityButton.disabled = !form.querySelector('input[name="priority"]:checked');
    }

    if (confirmSubjectButton) {
      confirmSubjectButton.disabled = !subjectInput.value.trim();
    }

    if (confirmDescriptionButton) {
      confirmDescriptionButton.disabled = !descriptionInput.value.trim();
    }
  };

  const resetForm = () => {
    form.reset();
    summaryBody.innerHTML = '<p>Choose your project details, then generate a summary.</p>';
    summary.dataset.summaryText = '';
    summary.classList.remove('wb-ready');

    if (contactMessageInput) {
      const markerIndex = contactMessageInput.value.indexOf(GENERATED_SUMMARY_BREAK + GENERATED_SUMMARY_HEADING);
      if (markerIndex >= 0) {
        contactMessageInput.value = contactMessageInput.value.slice(0, markerIndex).trimEnd();
      }
    }

    copyStatus.textContent = '';

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore remove failures.
    }

    live.textContent = 'Builder reset.';
    renderRailHighlights(getState());
    updateConfirmButtons();
    setStep(1);

    if (contactSection) {
      contactSection.hidden = true;
    }

    focusStep(1);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

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

  if (confirmStartingPointButton) {
    confirmStartingPointButton.addEventListener('click', () => {
      const state = getState();

      if (!state.startingPoint) {
        copyStatus.textContent = 'Select how you would like help to continue.';
        live.textContent = 'Select how you would like help to continue.';
        return;
      }

      if (state.startingPoint === 'I need help with something else') {
        if (contactSection) {
          contactSection.hidden = false;
          contactSection.scrollIntoView({
            block: 'start',
            behavior: motionQuery.matches ? 'auto' : 'smooth'
          });
        }

        if (contactNameInput) {
          contactNameInput.focus();
        }

        copyStatus.textContent = '';
        live.textContent = 'Contact form ready.';
        return;
      }

      if (contactSection) {
        contactSection.hidden = true;
      }

      setStep(2);
      copyStatus.textContent = 'Starting point confirmed. Next: choose your site type.';
      live.textContent = 'Starting point confirmed. Site type step ready.';
      focusStep(2);
    });
  }

  if (backSiteTypeButton) {
    backSiteTypeButton.addEventListener('click', () => {
      setStep(1);
      copyStatus.textContent = 'Back to how we can help.';
      live.textContent = 'Back to how we can help.';
      focusStep(1);
    });
  }

  if (confirmSiteTypeButton) {
    confirmSiteTypeButton.addEventListener('click', () => {
      const state = getState();

      if (!state.siteType) {
        copyStatus.textContent = 'Select a site type to continue.';
        live.textContent = 'Select a site type to continue.';
        return;
      }

      setStep(3);
      copyStatus.textContent = 'Site type confirmed. Next: choose your features.';
      live.textContent = 'Site type confirmed. Features step ready.';
      focusStep(3);
    });
  }

  if (confirmFeaturesButton) {
    confirmFeaturesButton.addEventListener('click', () => {
      const state = getState();

      if (!state.features.length) {
        copyStatus.textContent = 'Select at least one feature to continue.';
        live.textContent = 'Select at least one feature to continue.';
        return;
      }

      setStep(4);
      copyStatus.textContent = 'Features confirmed. Next: choose your priority.';
      live.textContent = 'Features confirmed. Priority step ready.';
      focusStep(4);
    });
  }

  if (backFeaturesButton) {
    backFeaturesButton.addEventListener('click', () => {
      setStep(2);
      copyStatus.textContent = 'Back to Site type.';
      live.textContent = 'Back to Site type.';
      focusStep(2);
    });
  }

  if (backPriorityButton) {
    backPriorityButton.addEventListener('click', () => {
      setStep(3);
      copyStatus.textContent = 'Back to Features needed.';
      live.textContent = 'Back to Features needed.';
      focusStep(3);
    });
  }

  if (confirmPriorityButton) {
    confirmPriorityButton.addEventListener('click', () => {
      const state = getState();

      if (!state.priority) {
        copyStatus.textContent = 'Select a priority to continue.';
        live.textContent = 'Select a priority to continue.';
        return;
      }

      setStep(5);
      copyStatus.textContent = 'Priority confirmed. Next: enter your project subject.';
      live.textContent = 'Priority confirmed. Project subject step ready.';
      focusStep(5);
    });
  }

  if (backSubjectButton) {
    backSubjectButton.addEventListener('click', () => {
      setStep(4);
      copyStatus.textContent = 'Back to Priority.';
      live.textContent = 'Back to Priority.';
      focusStep(4);
    });
  }

  if (confirmSubjectButton) {
    confirmSubjectButton.addEventListener('click', () => {
      const state = getState();

      if (!state.subject) {
        copyStatus.textContent = 'Enter your project subject to continue.';
        live.textContent = 'Enter your project subject to continue.';
        return;
      }

      setStep(6);
      copyStatus.textContent = 'Subject confirmed. Next: describe your goal.';
      live.textContent = 'Subject confirmed. Goal step ready.';
      focusStep(6);
    });
  }

  if (backDescriptionButton) {
    backDescriptionButton.addEventListener('click', () => {
      setStep(5);
      copyStatus.textContent = 'Back to Project subject.';
      live.textContent = 'Back to Project subject.';
      focusStep(5);
    });
  }

  if (confirmDescriptionButton) {
    confirmDescriptionButton.addEventListener('click', () => {
      const state = getState();

      if (!state.description) {
        copyStatus.textContent = 'Describe your goal to continue.';
        live.textContent = 'Describe your goal to continue.';
        return;
      }

      const error = validateState(state);

      if (error) {
        copyStatus.textContent = error;
        live.textContent = error;
        return;
      }

      renderSummary(state);
      saveState();
      live.textContent = `Project summary generated for ${state.subject}.`;
      setStep(7);
      copyStatus.textContent = '';
    });
  }

  if (contactCtaButton) {
    contactCtaButton.addEventListener('click', () => {
      if (!contactSection) {
        return;
      }

      contactSection.hidden = false;
      contactSection.scrollIntoView({
        block: 'start',
        behavior: motionQuery.matches ? 'auto' : 'smooth'
      });

      if (contactNameInput) {
        contactNameInput.focus();
      }
    });
  }

  resetButton.addEventListener('click', resetForm);

  const handleStateChange = () => {
    saveState();
    renderRailHighlights(getState());
    updateConfirmButtons();
  };

  form.addEventListener('change', handleStateChange);
  form.addEventListener('input', handleStateChange);

  motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) {
      shell.dataset.state = 'reduced';
      builder.hidden = false;
    }
  });

  restoreState();
  renderRailHighlights(getState());
  updateConfirmButtons();
  setStep(inferCurrentStep());
  runWelcomeFlow();
}
