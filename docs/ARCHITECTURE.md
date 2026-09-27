# InkFig Web Architecture

The frontend follows Shadow's React organization and visual language while using InkFig domain names and workflows.

```text
src/
|-- api/             Shared HTTP client and service-specific API clients
|-- app/             Application providers and route declarations
|-- components/      Reusable UI controls used by multiple features
|-- features/        Domain-focused pages and components
|-- i18n/            Arabic and English resources and direction handling
|-- lib/             Permission and route helpers
`-- shared/          Cross-feature TypeScript types
```

## Conventions

- React with strict TypeScript, built by Vite.
- React Router owns page routing and localized URLs.
- `AuthProvider` is the single frontend source for the current session.
- API clients are separated between the user system and main system and share one request helper.
- Permission checks control what is displayed, but the backend remains authoritative.
- Arabic uses RTL and English uses LTR. Both always use Latin digits.
- Shared CSS variables and classes define dark surfaces, subtle borders, orange actions, compact spacing, status colors, and responsive navigation.
- Feature-specific components belong under `features/<feature>`; reusable controls move to `components` only after genuine reuse.

No Tailwind CSS, Material UI, Bootstrap, styled-components, Redux, or other UI/state framework is part of this foundation.
