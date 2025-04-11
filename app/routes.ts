import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  layout('routes/layout.tsx', [
    route('areas', 'routes/areas.tsx'),
    route('areas/:id', 'routes/area.tsx'),
    route('issues', 'routes/issues.tsx'),
    route('issues/create', 'routes/issues.create.tsx'),
    route('issues/:number', 'routes/issue.tsx'),
  ]),
] satisfies RouteConfig
