# InkFig Web Architecture

The frontend uses InkFig's feature-oriented React organization and logo-derived
olive/leaf/cream/fig visual language. Do not import another project's business rules.

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

- React 19 with strict TypeScript, built by Vite; existing TanStack Query manages server state.
- React Router owns page routing and localized URLs.
- `AuthProvider` is the single frontend source for the current session.
- API clients are separated between the user system and main system and share one request helper.
- Permission checks control what is displayed, but the backend remains authoritative.
- Arabic uses RTL and English uses LTR. Both always use Latin digits.
- Shared CSS variables/classes in styles.css define InkFig light/dark tokens, subtle
  borders, olive primary actions, semantic status colors and responsive RTL/LTR navigation.
- Feature-specific components belong under `features/<feature>`; reusable controls move to `components` only after genuine reuse.

No Tailwind CSS, Material UI, Bootstrap, styled-components or Redux is approved.
Do not introduce another UI/state library without approval; preserve installed TanStack Query.
Current routes, implemented/partial states and contracts are indexed in docs/agent.
