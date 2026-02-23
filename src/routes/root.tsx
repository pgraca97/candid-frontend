import { createRootRoute, createRoute } from "@tanstack/react-router"
import App from "../App"
import ApplicationPage from "../pages/ApplicationPage"
import CompanyPage from "../pages/CompanyPage"
import HomePage from "../pages/HomePage"
import MyApplicationsPage from "../pages/MyApplicationsPage"
import NotFoundPage from "../pages/NotFoundPage"

export const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const myApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-applications",
  component: MyApplicationsPage,
})

const applicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/application/$id",
  component: ApplicationPage,
})

const companyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/company/$id",
  component: CompanyPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  myApplicationsRoute,
  applicationRoute,
  companyRoute,
])

export { routeTree }
