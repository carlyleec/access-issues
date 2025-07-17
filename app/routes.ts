import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    // route(':org/', 'routes/org.home.tsx'),
    // route(':org/areas', 'routes/org.areas.tsx'),
    // route(':org/areas/:id', 'routes/org.area.tsx'),
    route(':org', 'routes/org.issues.tsx'),
    route(':org/issues/create', 'routes/org.issues.create.tsx'),
    route(':org/issues/:number', 'routes/org.issue.tsx'),
    layout('routes/org.settings.layout.tsx', [
      route(':org/settings', 'routes/org.settings.tsx'),
      route(':org/settings/members', 'routes/org.settings.members.tsx'),
      route(':org/settings/routes', 'routes/org.settings.routes.tsx'),
    ]),
    route('login', 'routes/login.tsx'),
    route('login/:token', 'routes/login.token.tsx'),
    route('logout', 'routes/logout.tsx'),
  ]),
] satisfies RouteConfig
