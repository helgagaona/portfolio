const page = document.querySelector("#project-page");
const errorMessage = document.querySelector("#project-error");
const pageType = document.body.dataset.pageType;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
}

function createProjectVisual(project) {
  const visual = document.querySelector("#project-visual");
  visual.style.backgroundColor = project.visualColor || "#d8d1ed";

  if (project.image) {
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.imageAlt || `${project.title} project image`;
    visual.append(image);
    return;
  }

  const title = document.createElement("span");
  title.className = "project-visual-title";
  title.textContent = project.title;
  visual.append(title);
}

function renderCaseStudy(project, projects) {
  const caseStudy = project.caseStudy;
  if (!caseStudy) {
    const notice = document.createElement("p");
    notice.className = "project-notice section-container";
    notice.textContent = "A full case study is not available for this project yet.";
    const projectLink = document.createElement("a");
    projectLink.href = `/directory/project.html?id=${encodeURIComponent(project.id)}`;
    projectLink.textContent = " View project overview.";
    notice.append(projectLink);
    page.insertBefore(notice, page.children[1] || null);
    for (const selector of ["#case-overview", "#case-process", "#case-reflection", "#next-project"]) {
      document.querySelector(selector).hidden = true;
    }
    return;
  }

  setText("project-overview-title", caseStudy.overviewTitle);
  setText("project-overview", caseStudy.overview);

  const details = caseStudy.details || {};
  const detailsContainer = document.querySelector("#project-details");
  for (const row of document.querySelectorAll("[data-detail]")) {
    const value = details[row.dataset.detail];
    row.hidden = !value;
    row.querySelector("strong").textContent = value || "";
  }
  detailsContainer.hidden = !Object.values(details).some(Boolean);

  const overviewCopy = document.querySelector(".overview-copy");
  overviewCopy.hidden = !caseStudy.overview;
  const overviewSection = document.querySelector("#case-overview");
  overviewSection.hidden = detailsContainer.hidden && overviewCopy.hidden;
  overviewSection.classList.toggle(
    "case-overview--single",
    detailsContainer.hidden || overviewCopy.hidden
  );

  const steps = caseStudy.process || [];
  const processGrid = document.querySelector("#process-grid");
  for (const [index, step] of steps.entries()) {
    const article = document.createElement("article");
    article.className = "process-step";

    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("h3");
    title.textContent = step.title;
    const description = document.createElement("p");
    description.textContent = step.description;

    article.append(number, title, description);
    processGrid.append(article);
  }
  document.querySelector("#case-process").hidden = steps.length === 0;

  if (caseStudy.learning) {
    setText("project-learning-title", caseStudy.learningTitle || "Learning through the process");
    setText("project-learning", caseStudy.learning);
    document.querySelector("#case-reflection").hidden = false;
  }

  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const nextLink = document.querySelector("#next-project-link");
  nextLink.href = nextProject.caseStudy
    ? `/directory/case-study.html?id=${encodeURIComponent(nextProject.id)}`
    : `/directory/project.html?id=${encodeURIComponent(nextProject.id)}`;
  setText("next-project-title", nextProject.title);
  document.querySelector("#next-project").hidden = projects.length < 2;
}

function renderProject(project, projects) {
  setText("project-category", project.category);
  setText("project-title", project.title);
  setText("project-summary", project.summary);
  document.title = `${project.title} | Helga Gaona`;

  const description = document.querySelector('meta[name="description"]');
  description.content = project.summary;
  createProjectVisual(project);

  if (pageType === "case-study") {
    renderCaseStudy(project, projects);
  } else {
    setText("project-description", project.description);
    document.querySelector("#project-extra").hidden = !project.description;
    if (project.caseStudy) {
      const link = document.querySelector("#case-study-link");
      link.href = `/directory/case-study.html?id=${encodeURIComponent(project.id)}`;
      link.hidden = false;
    }
  }

  page.setAttribute("aria-busy", "false");
}

async function loadProject() {
  const projectId = new URLSearchParams(window.location.search).get("id");
  if (!projectId) {
    throw new Error("No project was specified. Choose a project from the portfolio.");
  }

  const response = await fetch("/data/projects.json");
  if (!response.ok) {
    throw new Error(`Could not load project data (HTTP ${response.status}).`);
  }

  const projects = await response.json();
  if (!Array.isArray(projects)) {
    throw new Error("Project data must be a JSON array.");
  }

  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error("That project could not be found. Return to the selected work page and choose another project.");
  }

  renderProject(project, projects);
}

loadProject().catch((error) => {
  errorMessage.textContent = error.message;
  errorMessage.hidden = false;
  for (const element of page.children) {
    if (element !== errorMessage) {
      element.hidden = true;
    }
  }
  page.setAttribute("aria-busy", "false");
});
