import { auth, settings, users } from "@/api";
import { ADMIN_GROUP_ID, AUTH_CONFIGS, ORG_ID } from "@/constants";
import { mocker } from "@/mocker";
import { Settings, User } from "@/types";
import {
  authRoute,
  createDefaultErrorResponse,
  createDefaultResponse,
} from "@/utils";

const defaultDataResponse = {
  id: null,
  orgAndRoles: null,
  currentOrgId: null,
  username: "anonymous",
  connections: null,
  avatar: null,
  avatarUrl: null,
  hasPassword: false,
  hasSetNickname: false,
  hasShownNewUserGuidance: false,
  userStatus: null,
  createdTimeMs: 0,
  ip: "0.0.0.0",
  enabled: false,
  anonymous: true,
  orgDev: false,
  isAnonymous: true,
  isEnabled: false,
};

const createResponseData = (user: User, systemSettings: Settings) => {
  const isAdmin = user.groups.some(
    (g) => (typeof g === "string" ? g : g.id) === ADMIN_GROUP_ID,
  );
  return {
    ...defaultDataResponse,
    id: user.id,
    orgAndRoles: [
      {
        org: {
          id: ORG_ID,
          createdBy: "",
          name: "Default",
          isAutoGeneratedOrganization: true,
          contactName: null,
          contactEmail: null,
          contactPhoneNumber: null,
          source: null,
          thirdPartyCompanyId: null,
          state: "ACTIVE",
          commonSettings: {
            themeList: systemSettings.themes,
            defaultHomePage: systemSettings.home_page,
            defaultTheme: systemSettings.theme,
            preloadCSS: systemSettings.css,
            preloadJavaScript: systemSettings.script,
            preloadLibs: systemSettings.libs,
          },
          logoUrl: "",
          createTime: 0,
          authConfigs: AUTH_CONFIGS,
        },
        role: isAdmin ? "admin" : "member",
      },
    ],
    currentOrgId: ORG_ID,
    username: user.name,
    connections: [
      {
        authId: "EMAIL",
        source: "EMAIL",
        name: user.email,
        avatar: null,
        rawUserInfo: {
          email: user.email,
        },
        tokens: [],
      },
    ],
    avatar: null,
    avatarUrl: null,
    hasPassword: true,
    hasSetNickname: true,
    hasShownNewUserGuidance: false,
    userStatus: {
      newUserGuidance: true,
    },
    createdTimeMs: new Date(user.created).getTime(),
    ip: "",
    enabled: false,
    anonymous: false,
    orgDev: isAdmin,
    isAnonymous: false,
    isEnabled: false,
  };
};

export default [
  mocker.get("/api/v1/users/me", async () => {
    const userResponse = await auth.getCurrentUser();
    if (!userResponse.data) {
      return createDefaultResponse(defaultDataResponse);
    }
    const settingsResponse = await settings.get();
    if (settingsResponse.data) {
      return createDefaultResponse(
        createResponseData(userResponse.data, settingsResponse.data),
      );
    }
    return createDefaultErrorResponse([settingsResponse, userResponse]);
  }),
  mocker.put(
    "/api/v1/users",
    authRoute(async (req) => {
      const { name } = req.config.data;
      const userId = await auth.getCurrentUserId();
      if (!userId) {
        return createDefaultErrorResponse([{ status: 401 }]);
      }
      const updateUserResponse = await users.update({ id: userId, name });
      if (updateUserResponse.status === 200) {
        const userResponse = await auth.getCurrentUser();
        const settingsResponse = await settings.get();
        if (userResponse.data && settingsResponse.data) {
          return createDefaultResponse(
            createResponseData(userResponse.data, settingsResponse.data),
          );
        }
        return createDefaultErrorResponse([userResponse, settingsResponse]);
      }
      return createDefaultErrorResponse([updateUserResponse]);
    }),
  ),
];
