import { settings } from "@/api";
import { mocker } from "@/mocker";
import {
  adminRoute,
  authRoute,
  createDefaultErrorResponse,
  createDefaultResponse,
} from "@/utils";

const renamedParams = {
  themeList: "themes",
  defaultHomePage: "home_page",
  defaultTheme: "theme",
  preloadCSS: "css",
  preloadJavaScript: "script",
  preloadLibs: "libs",
  npmPlugins: "plugins",
};

export default [
  mocker.get(
    "/api/organizations/:id/common-settings",
    authRoute(async () => {
      const settingsResponse = await settings.get();
      if (settingsResponse.data) {
        const { themes, home_page, theme, css, script, libs, plugins } =
          settingsResponse.data;
        return createDefaultResponse({
          themeList: themes,
          defaultHomePage:
            typeof home_page === "string" ? home_page : home_page?.slug,
          defaultTheme: theme,
          preloadCSS: css,
          preloadJavaScript: script,
          preloadLibs: libs,
          npmPlugins: plugins || [],
        });
      }
      return createDefaultErrorResponse([settingsResponse]);
    }),
  ),
  mocker.put(
    "/api/organizations/:id/common-settings",
    adminRoute(async (req) => {
      const { key, value = "" } = req.config.data as {
        key: keyof typeof renamedParams;
        value?: unknown;
      };
      const bodyParams: { [key: string]: string } = {};
      bodyParams[renamedParams[key]] =
        typeof value === "string" ? value : !value ? "" : JSON.stringify(value);
      const currentSettingsResponse = await settings.get();
      if (currentSettingsResponse.data) {
        const settingsResponse = await settings.update({
          id: currentSettingsResponse.data.id,
          ...bodyParams,
        });
        if (settingsResponse.status === 200) {
          return createDefaultResponse(true);
        }
        return createDefaultErrorResponse([settingsResponse]);
      }
      return createDefaultErrorResponse([currentSettingsResponse]);
    }),
  ),
];
