# InkFig Web Frontend

InkFig is a graduation project for Hebron University. It is a web platform where students can create accounts, publish their artwork, discover work created by other students, and interact with it.

This repository contains the web frontend through which students, teachers, and other authorized users access InkFig.

## Product vision

InkFig is an art-focused community platform with some similarities to Pinterest, while remaining tailored to the university context. Each student has an account and a personal body of work. Students can upload and display different kinds of art, including digital artwork made with tools such as Photoshop, hand-created artwork, and other art forms.

The platform will support multiple ways of presenting and discovering artwork. The exact presentation modes will be designed later. Students will be able to view one another's work and interact with it through likes.

## Planned capabilities

- Student account creation, authentication, and profiles.
- Artwork uploads across multiple art types and media.
- Personal student portfolios and shared artwork discovery.
- Likes and other appropriate community interactions.
- Preference and recommendation algorithms for personalized discovery.
- Natural-language image search: a user enters a text description and a model returns artwork that matches it.
- Teacher-created events in which students can participate by submitting artwork.
- Event submission moderation: a submitted work remains pending until the teacher accepts or rejects it.
- Rejection feedback: when a teacher rejects an event submission, the teacher provides a reason.
- Multiple roles and granular permissions.
- Account administration, including activating and deactivating accounts.

## Event workflow

1. A teacher creates an event.
2. A student submits artwork to the event.
3. The submission remains pending and is not included in the event yet.
4. The teacher reviews the submission.
5. If accepted, the artwork becomes part of the event.
6. If rejected, the student receives the teacher's rejection reason.

## Project status

This document records the initial product direction, not a complete specification. Detailed requirements, artwork presentation modes, algorithms, roles, permissions, and additional workflows will be defined as the project develops.

## Development

The web application uses React, strict TypeScript, Vite, React Router, Lucide React, and shared CSS. Its organization and frontend constraints are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```powershell
npm install
npm run dev
```

Use `npm test` for source-level foundation checks and `npm run build` for the strict TypeScript production build.

## Automatic Cloudflare deployment

Every push to `main` runs the frontend tests and production build, then deploys the static Vite output to the existing `inkfig-user-fe` Cloudflare Worker. The production build uses:

- `VITE_USER_API_BASE_URL=https://user-api.inkfig-hu.com/api/v1`
- `VITE_MAIN_API_BASE_URL=https://main-api.inkfig-hu.com/api/v1`

Create a protected GitHub environment named `production` and add these repository or environment secrets:

- `CLOUDFLARE_API_TOKEN`: a scoped token with Workers Scripts edit permission for the InkFig account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account identifier that owns `inkfig-user-fe`.

The Wrangler configuration deploys `dist/` as static assets and falls back to `index.html` for React Router routes. Keep the existing `inkfig-hu.com` custom-domain association attached to the `inkfig-user-fe` Worker.
