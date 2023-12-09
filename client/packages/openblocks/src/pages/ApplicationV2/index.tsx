import {
  ALL_APPLICATIONS_URL,
  FOLDER_URL,
  FOLDER_URL_PREFIX,
  FOLDERS_URL,
  MODULE_APPLICATIONS_URL,
  SETTING,
  TRASH_URL,
} from "constants/routesURL";
import { getUser, isFetchingUser } from "redux/selectors/usersSelectors";
import { useDispatch, useSelector } from "react-redux";
import {
  EditPopover,
  EllipsisTextCss,
  FolderIcon,
  HomeActiveIcon,
  HomeIcon,
  HomeModuleActiveIcon,
  HomeModuleIcon,
  HomeSettingsActiveIcon,
  HomeSettingsIcon,
  PlusIcon,
  PointIcon,
  RecyclerActiveIcon,
  RecyclerIcon,
} from "openblocks-design";
import React, { useEffect, useState } from "react";
import { fetchAllApplications, fetchHomeData } from "redux/reduxActions/applicationActions";
import { getHomeOrg, normalAppListSelector } from "redux/selectors/applicationSelector";
import { clearStyleEval, evalStyle } from "openblocks-core";
import { ProductLoading } from "components/ProductLoading";
import { Layout } from "../../components/layout/Layout";
import { HomeView } from "./HomeView";
import styled, { css } from "styled-components";
import history from "../../util/history";
import { FolderView } from "./FolderView";
import { TrashView } from "./TrashView";
import { SideBarItemType } from "../../components/layout/SideBarSection";
import { RootFolderListView } from "./RootFolderListView";
import { fetchFolderElements, updateFolder } from "../../redux/reduxActions/folderActions";
import { ModuleView } from "./ModuleView";
import { useCreateFolder } from "./useCreateFolder";
import { trans } from "../../i18n";
import { foldersSelector } from "../../redux/selectors/folderSelector";
import Setting from "pages/setting";
import { message } from "antd";
import { TypographyText } from "../../components/TypographyText";

const TabLabel = styled.div`
  font-weight: 500;
`;

const FolderSectionLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 14px;
  padding: 0 8px 0 26px;
  height: 30px;
`;

const FolderCountLabel = styled.span`
  margin-left: 8px;
  font-size: 14px;
  line-height: 14px;
  color: #b8b9bf;
`;

const FolderNameWrapper = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  ${EllipsisTextCss};
  height: 100%;

  ${(props) => {
    if (props.selected) {
      return css`
        font-weight: 500;

        svg {
          display: inline-block;
        }
      `;
    }
  }}
  .ant-typography {
    max-width: 138px;
    line-height: 16px;
  }

  :hover {
    svg {
      display: inline-block;
    }
  }
`;

const FolderName = (props: { id: string; name: string, orgDev?: boolean }) => {
  const dispatch = useDispatch();
  const [folderNameEditing, setFolderNameEditing] = useState(false);

  return (
    <>
      <TypographyText
        value={props.name}
        editing={folderNameEditing}
        onChange={(value) => {
          if (!value.trim()) {
            message.warn(trans("home.nameCheckMessage"));
            return;
          }
          dispatch(updateFolder({ id: props.id, name: value }));
          setFolderNameEditing(false);
        }}
      />
      {props.orgDev ? (
        <EditPopover items={[{ text: trans("rename"), onClick: () => setFolderNameEditing(true) }]}>
          <PopoverIcon tabIndex={-1} />
        </EditPopover>
      ): null}
    </>
  );
};

const MoreFoldersWrapper = styled.div<{ selected: boolean }>`
  ${(props) => {
    if (props.selected) {
      return css`
        font-weight: 500;
      `;
    }
  }}
`;

const MoreFoldersIcon = styled(PointIcon)<{ selected: boolean }>`
  cursor: pointer;
  flex-shrink: 0;

  g {
    fill: ${(props) => (props.selected ? "#4965f2" : "#8b8fa3")};
  }
`;

const PopoverIcon = styled(PointIcon)`
  cursor: pointer;
  flex-shrink: 0;
  display: none;

  g {
    fill: #8b8fa3;
  }

  :hover {
    background-color: #e1e3eb;
    border-radius: 4px;
    cursor: pointer;

    g {
      fill: #3377ff;
    }
  }
`;

const CreateFolderIcon = styled.div`
  margin-left: auto;
  cursor: pointer;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  :hover {
    g {
      stroke: #315efb;
    }

    background-color: #e1e3eb;
  }
`;

const DivStyled = styled.div`
  @media screen and (max-width: 500px) {
    .ant-layout-sider {
      visibility: hidden;
      padding: 0;
      max-width: 0 !important;
      min-width: 0 !important;
    }

    > div {
      display: none;
    }

    .ant-layout > div {
      display: none;
    }
  }
`;

export default function ApplicationHome() {
  const dispatch = useDispatch();
  const [isPreloadCompleted, setIsPreloadCompleted] = useState(false);
  const fetchingUser = useSelector(isFetchingUser);
  const allApplications = useSelector(normalAppListSelector);
  const allFolders = useSelector(foldersSelector);
  const user = useSelector(getUser);
  const org = useSelector(getHomeOrg);
  const allAppCount = allApplications.length;
  const allFoldersCount = allFolders.length;
  const orgHomeId = "root";

  const handleFolderCreate = useCreateFolder();

  useEffect(() => {
    dispatch(fetchHomeData({}));
  }, [dispatch, user.currentOrgId]);

  useEffect(() => {
    if (!org) {
      return;
    }
    const { applyPreloadCSSToHomePage, preloadCSS } = org.commonSettings || {};
    if (applyPreloadCSSToHomePage && preloadCSS) {
      evalStyle(orgHomeId, [preloadCSS]);
    } else {
      clearStyleEval();
    }
    setIsPreloadCompleted(true);
  }, [org, orgHomeId]);

  useEffect(() => {
    if (allAppCount !== 0) {
      return;
    }
    user.currentOrgId && dispatch(fetchAllApplications({}));
  }, [dispatch, allAppCount, user.currentOrgId]);

  useEffect(() => {
    if (allFoldersCount !== 0) {
      return;
    }
    user.currentOrgId && dispatch(fetchFolderElements({}));
  }, [dispatch, allFoldersCount, user.currentOrgId]);

  if (fetchingUser || !isPreloadCompleted) {
    return <ProductLoading />;
  }

  let folderItems: SideBarItemType[] = allFolders
    .sort((a, b) => {
      if (a.createAt === b.createAt) {
        return 0;
      }
      return a.createAt < b.createAt ? 1 : -1;
    })
    .slice(0, 5)
    .map((folder) => {
      const path = FOLDER_URL_PREFIX + `/${folder.folderId}`;
      return {
        onSelected: (_, currentPath) => currentPath === path,
        text: (props: { selected: boolean }) => (
          <FolderNameWrapper selected={props.selected}>
            <FolderName name={folder.name} id={folder.folderId} orgDev={user.orgDev} />
          </FolderNameWrapper>
        ),
        routePath: FOLDER_URL,
        routePathExact: false,
        routeComp: FolderView,
        icon: FolderIcon,
        size: "small",
        onClick: (currentPath) => currentPath !== path && history.push(path),
      };
    });

  if (allFolders.length > 5) {
    folderItems = [
      ...folderItems,
      {
        text: (props: { selected: boolean }) => (
          <MoreFoldersWrapper selected={props.selected}>{trans("more")}</MoreFoldersWrapper>
        ),
        routePath: FOLDERS_URL,
        routeComp: RootFolderListView,
        icon: MoreFoldersIcon,
        size: "small",
      },
    ];
  }

  if (folderItems.length > 0) {
    folderItems[folderItems.length - 1] = {
      ...folderItems[folderItems.length - 1],
      style: { marginBottom: "4px" },
    };
  }

  return (
    <DivStyled>
      <Layout
        sections={[
          {
            items: [
              {
                text: <TabLabel>{trans("home.allApplications")}</TabLabel>,
                routePath: ALL_APPLICATIONS_URL,
                routeComp: HomeView,
                icon: ({ selected, ...otherProps }) =>
                  selected ? <HomeActiveIcon {...otherProps} /> : <HomeIcon {...otherProps} />,
              },
              {
                text: <TabLabel>{trans("home.modules")}</TabLabel>,
                routePath: MODULE_APPLICATIONS_URL,
                routeComp: ModuleView,
                icon: ({ selected, ...otherProps }) =>
                  selected ? (
                    <HomeModuleActiveIcon {...otherProps} />
                  ) : (
                    <HomeModuleIcon {...otherProps} />
                  ),
                visible: ({ user }) => user.orgDev,
              },
              {
                text: <TabLabel>{trans("home.trash")}</TabLabel>,
                routePath: TRASH_URL,
                routeComp: TrashView,
                icon: ({ selected, ...otherProps }) =>
                  selected ? (
                    <RecyclerActiveIcon {...otherProps} />
                  ) : (
                    <RecyclerIcon {...otherProps} />
                  ),
                visible: ({ user }) => user.orgDev,
              },
            ],
          },
          allFolders.length > 0
            ? {
                title: (
                  <FolderSectionLabel>
                    {trans("home.folders")}
                    <FolderCountLabel>{`(${allFolders.length})`}</FolderCountLabel>
                    {user.orgDev && (
                      <CreateFolderIcon onClick={handleFolderCreate}>
                        <PlusIcon />
                      </CreateFolderIcon>
                    )}
                  </FolderSectionLabel>
                ),
                items: folderItems,
                style: { marginTop: "8px" },
              }
            : { items: [] },
          {
            items: [
              {
                text: <TabLabel>{trans("settings.title")}</TabLabel>,
                routePath: SETTING,
                routePathExact: false,
                routeComp: Setting,
                icon: ({ selected, ...otherProps }) =>
                  selected ? (
                    <HomeSettingsActiveIcon {...otherProps} />
                  ) : (
                    <HomeSettingsIcon {...otherProps} />
                  ),
                visible: ({ user }) => user.orgDev,
                onSelected: (_, currentPath) => currentPath.split("/")[1] === "setting",
              },
            ],
          },
        ]}
      />
    </DivStyled>
  );
}
