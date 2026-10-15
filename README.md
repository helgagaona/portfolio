# portfolio

Project pages use the records in `data/projects.json`. Open a project with
`/directory/project.html?id=<project-id>` for the concise view, or use
`/directory/case-study.html?id=<project-id>` when the record includes a
`caseStudy` section.

To add a project, add a record with a unique `id`, `title`, `category`,
`summary`, `description`, and `visualColor`. Add an `image` path if there is a
project image. Add `caseStudy` fields (`overviewTitle`, `overview`, optional
`details`, `process`, and `learning`) to make a full case study available.

Because the JSON file is fetched in the browser, preview the site from a local
web server rather than opening the HTML files directly. From the repository
root, run `python3 -m http.server 8000` and visit
`http://localhost:8000/directory/`.