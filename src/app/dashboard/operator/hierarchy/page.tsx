"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { FiChevronDown, FiChevronUp, FiMinus, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

type OperatorBasic = {
  operatorId: string;
  name: string;
  email?: string;
};

type LeadershipMember = {
  operatorId: string;
  name: string;
  level: number;
  email?: string;
};

type TeamMember = {
  operatorId: string;
  name: string;
  mentorOperator?: { operatorId: string; name: string } | null;
  teamSize?: number;
  totalCommission?: number;
};

type TreeNodeKind = "self" | "direct_team" | "leadership" | "team";

type TreeMeta = {
  id: string;
  kind: TreeNodeKind;
  level: number;
  mentorName: string;
  teamSize: number;
  email: string;
  totalCommission: number;
  hasLazyChildren: boolean;
  loaded: boolean;
};

type TreeNode = {
  name: string;
  children?: TreeNode[];
  attributes?: {
    level: string;
    teamSize: string;
  };
  __meta: TreeMeta;
};

const toId = (value: unknown) => String(value || "").trim();
const toName = (value: unknown) => String(value || "").trim() || "Unknown";
const toNumber = (value: unknown) => Number(value || 0);

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const buildTeamNode = (member: TeamMember, kind: TreeNodeKind, level: number): TreeNode => {
  const memberId = toId(member.operatorId);
  const teamSize = toNumber(member.teamSize);

  return {
    name: toName(member.name),
    attributes: {
      level: `L${Math.max(1, level)}`,
      teamSize: String(teamSize),
    },
    __meta: {
      id: memberId,
      kind,
      level,
      mentorName: toName(member.mentorOperator?.name || "-"),
      teamSize,
      email: "",
      totalCommission: toNumber(member.totalCommission),
      hasLazyChildren: teamSize > 0,
      loaded: teamSize <= 0,
    },
  };
};

const buildInitialTree = ({
  operator,
  mentor,
  leadershipChain,
  directTeam,
}: {
  operator: OperatorBasic;
  mentor: OperatorBasic | null;
  leadershipChain: LeadershipMember[];
  directTeam: TeamMember[];
}): TreeNode | null => {
  const operatorId = toId(operator?.operatorId);
  if (!operatorId) return null;

  const sortedLeadership = [...leadershipChain].sort((a, b) => toNumber(a.level) - toNumber(b.level));
  const selfLevel = sortedLeadership.length + 1;

  const selfNode: TreeNode = {
    name: toName(operator.name),
    attributes: {
      level: `L${selfLevel}`,
      teamSize: String(directTeam.length),
    },
    children: directTeam.map((member) => buildTeamNode(member, "direct_team", selfLevel + 1)),
    __meta: {
      id: operatorId,
      kind: "self",
      level: selfLevel,
      mentorName: mentor ? toName(mentor.name) : "No mentor",
      teamSize: directTeam.length,
      email: String(operator.email || ""),
      totalCommission: 0,
      hasLazyChildren: directTeam.length > 0,
      loaded: true,
    },
  };

  return sortedLeadership
    .slice()
    .reverse()
    .reduce<TreeNode>((child, leader) => {
      const leaderLevel = Math.max(1, toNumber(leader.level));
      return {
        name: toName(leader.name),
        attributes: {
          level: `L${leaderLevel}`,
          teamSize: "-",
        },
        children: [child],
        __meta: {
          id: toId(leader.operatorId),
          kind: "leadership",
          level: leaderLevel,
          mentorName: "-",
          teamSize: 0,
          email: String(leader.email || ""),
          totalCommission: 0,
          hasLazyChildren: false,
          loaded: true,
        },
      };
    }, selfNode);
};

const updateNodeById = (node: TreeNode, nodeId: string, updater: (node: TreeNode) => TreeNode): TreeNode => {
  if (node.__meta.id === nodeId) {
    return updater(node);
  }

  if (!Array.isArray(node.children) || node.children.length === 0) {
    return node;
  }

  let changed = false;
  const nextChildren = node.children.map((child) => {
    const updatedChild = updateNodeById(child, nodeId, updater);
    if (updatedChild !== child) changed = true;
    return updatedChild;
  });

  return changed ? { ...node, children: nextChildren } : node;
};

const findNodeById = (node: TreeNode | null, nodeId: string): TreeNode | null => {
  if (!node) return null;
  if (node.__meta.id === nodeId) return node;

  if (!node.children?.length) return null;
  for (const child of node.children) {
    const found = findNodeById(child, nodeId);
    if (found) return found;
  }
  return null;
};

const collectExpandableIds = (node: TreeNode | null): string[] => {
  if (!node) return [];
  const ids: string[] = [];
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length > 0 || node.__meta.hasLazyChildren) {
    ids.push(node.__meta.id);
  }
  children.forEach((child) => {
    ids.push(...collectExpandableIds(child));
  });
  return ids;
};

const findPathToNode = (node: TreeNode | null, targetId: string, path: string[] = []): string[] | null => {
  if (!node) return null;
  const nextPath = [...path, node.__meta.id];
  if (node.__meta.id === targetId) return nextPath;
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) {
    const found = findPathToNode(child, targetId, nextPath);
    if (found) return found;
  }
  return null;
};

const toneByKind: Record<TreeNodeKind, string> = {
  self: "border-primary-400 bg-primary-100/70 dark:bg-primary-500/20 text-primary-700 dark:text-primary-200",
  direct_team: "border-success-400 bg-success-100/70 dark:bg-success-500/20 text-success-700 dark:text-success-200",
  team: "border-success-300 bg-success-100/60 dark:bg-success-500/15 text-success-700 dark:text-success-200",
  leadership: "border-warning-400 bg-warning-100/70 dark:bg-warning-500/20 text-warning-700 dark:text-warning-200",
};

type BranchProps = {
  node: TreeNode;
  collapsedByNode: Record<string, boolean>;
  loadingChildrenByNode: Record<string, boolean>;
  onSelect: (meta: TreeMeta) => void;
  onToggle: (node: TreeNode, action: "load_expand" | "expand" | "collapse") => void;
};

function HierarchyBranch({
  node,
  collapsedByNode,
  loadingChildrenByNode,
  onSelect,
  onToggle,
}: BranchProps) {
  const nodeId = node.__meta.id;
  const isCollapsed = Boolean(collapsedByNode[nodeId]);
  const loadingChildren = Boolean(loadingChildrenByNode[nodeId]);
  const children = Array.isArray(node.children) ? node.children : [];
  const hasRenderedChildren = children.length > 0;
  const canLazyLoad = node.__meta.hasLazyChildren && !node.__meta.loaded;
  const isExpandedVisible = hasRenderedChildren && !isCollapsed;

  let actionLabel = "";
  let actionKind: "load_expand" | "expand" | "collapse" | null = null;
  let actionIcon: JSX.Element | null = null;
  if (loadingChildren) {
    actionLabel = "Loading...";
    actionIcon = <FiRefreshCw className="animate-spin" size={12} />;
  } else if (canLazyLoad) {
    actionLabel = "Load & Expand";
    actionKind = "load_expand";
    actionIcon = <FiChevronDown size={12} />;
  } else if (isExpandedVisible) {
    actionLabel = "Collapse";
    actionKind = "collapse";
    actionIcon = <FiChevronUp size={12} />;
  } else if (hasRenderedChildren) {
    actionLabel = "Expand";
    actionKind = "expand";
    actionIcon = <FiChevronDown size={12} />;
  }

  return (
    <li className="hierarchy-node" data-node-id={node.__meta.id}>
      <button
        type="button"
        onClick={() => onSelect(node.__meta)}
        className={`w-[220px] rounded-xl border px-3 py-2 shadow-md text-left ${toneByKind[node.__meta.kind]} bg-content1/95 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{toName(node.name)}</p>
          <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] font-semibold">
            {String(node.attributes?.level || `L${node.__meta.level}`)}
          </span>
        </div>
        <p className="mt-1 text-[11px] opacity-85">
          Team <span className="font-semibold">{String(node.attributes?.teamSize || node.__meta.teamSize || 0)}</span>
        </p>
      </button>

      <div className="mt-3 flex justify-center gap-2">
        {actionLabel ? (
          <Button
            size="sm"
            variant="flat"
            className="h-8 min-w-[124px] text-xs font-medium"
            isDisabled={loadingChildren || !actionKind}
            startContent={actionIcon}
            onPress={() => {
              if (!actionKind) return;
              onToggle(node, actionKind);
            }}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>

      {loadingChildren ? <p className="mt-1 text-[11px] text-default-500">Loading branch...</p> : null}

      {hasRenderedChildren && !isCollapsed ? (
        <ul className="hierarchy-list">
          {children.map((child) => (
            <HierarchyBranch
              key={child.__meta.id}
              node={child}
              collapsedByNode={collapsedByNode}
              loadingChildrenByNode={loadingChildrenByNode}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function OperatorHierarchyPage() {
  const { user } = useContext(AuthContext);
  const selfOperatorId = toId(user?.id);
  const roleLower = String(user?.role || "").trim().toLowerCase();
  const isAdmin = roleLower === "admin";
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<TreeMeta | null>(null);
  const [loadingChildrenByNode, setLoadingChildrenByNode] = useState<Record<string, boolean>>({});
  const [collapsedByNode, setCollapsedByNode] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef<{ x: number; y: number; baseX: number; baseY: number } | null>(null);

  const operatorsQuery = useQuery({
    queryKey: ["operator-hierarchy", "operators", isAdmin],
    queryFn: async () => getData(apiRoutes.operator.getAll, { page: 1, limit: 5000 }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const operatorOptions = useMemo(() => {
    const rows = extractList(operatorsQuery.data);
    return rows
      .map((row: any) => ({
        id: toId(row?._id || row?.id),
        name: toName(row?.name),
      }))
      .filter((row: any) => Boolean(row.id));
  }, [operatorsQuery.data]);

  useEffect(() => {
    if (!isAdmin) {
      setSelectedOperatorId(selfOperatorId);
      return;
    }
    const validIds = new Set(operatorOptions.map((option: any) => String(option.id)));
    if (operatorOptions.length === 0) {
      if (selectedOperatorId) setSelectedOperatorId("");
      return;
    }
    if (selectedOperatorId && validIds.has(selectedOperatorId)) return;
    setSelectedOperatorId(operatorOptions[0].id);
  }, [operatorOptions, isAdmin, selfOperatorId, selectedOperatorId]);

  const operatorId = isAdmin ? selectedOperatorId : selfOperatorId;

  const leadershipQuery = useQuery({
    queryKey: ["operator-hierarchy", "leadership", operatorId],
    queryFn: async () => getData(apiRoutes.operatorHierarchy.leadership(operatorId)),
    enabled: Boolean(operatorId),
    refetchOnWindowFocus: false,
  });

  const teamQuery = useQuery({
    queryKey: ["operator-hierarchy", "team", operatorId],
    queryFn: async () => getData(apiRoutes.operatorHierarchy.team(operatorId)),
    enabled: Boolean(operatorId),
    refetchOnWindowFocus: false,
  });

  const selfSummaryQuery = useQuery({
    queryKey: ["operator-hierarchy", "summary", operatorId],
    queryFn: async () =>
      getData(apiRoutes.commissions.operatorHistory(operatorId), {
        page: 1,
        limit: 1,
      }),
    enabled: Boolean(operatorId),
    refetchOnWindowFocus: false,
  });

  const selectedNodeOperatorId = selectedMeta?.id || "";
  const selectedSummaryQuery = useQuery({
    queryKey: ["operator-hierarchy", "node-summary", selectedNodeOperatorId],
    queryFn: async () =>
      getData(apiRoutes.commissions.operatorHistory(selectedNodeOperatorId), {
        page: 1,
        limit: 1,
      }),
    enabled: Boolean(selectedNodeOperatorId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const leadershipData = leadershipQuery.data?.data?.data || {};
  const teamData = teamQuery.data?.data?.data || {};

  const operator: OperatorBasic = leadershipData.operator || { operatorId: operatorId, name: user?.name || "You" };
  const mentor: OperatorBasic | null = leadershipData.mentor || null;
  const leadershipChain: LeadershipMember[] = Array.isArray(leadershipData.leadershipChain)
    ? leadershipData.leadershipChain
    : [];
  const directTeam: TeamMember[] = Array.isArray(teamData.directTeam) ? teamData.directTeam : [];

  const summary = selfSummaryQuery.data?.data?.data?.summary || {};

  const initialTree = useMemo(
    () =>
      buildInitialTree({
        operator,
        mentor,
        leadershipChain,
        directTeam,
      }),
    [operator, mentor, leadershipChain, directTeam]
  );

  useEffect(() => {
    setTreeData(initialTree);
    setSelectedMeta(null);
    setLoadingChildrenByNode({});
    setCollapsedByNode({});
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, [operatorId, initialTree]);

  const clampZoom = useCallback((value: number) => Math.max(0.6, Math.min(1.8, Number(value.toFixed(2)))), []);

  const applyZoom = useCallback(
    (nextZoomRaw: number, anchorClientX?: number, anchorClientY?: number) => {
      const nextZoom = clampZoom(nextZoomRaw);
      setZoom((prevZoom) => {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) {
          return nextZoom;
        }

        setTranslate((prevTranslate) => {
          const localX = anchorClientX == null ? rect.width / 2 : anchorClientX - rect.left;
          const localY = anchorClientY == null ? rect.height / 2 : anchorClientY - rect.top;
          const zoomRatio = nextZoom / prevZoom;
          return {
            x: localX - (localX - prevTranslate.x) * zoomRatio,
            y: localY - (localY - prevTranslate.y) * zoomRatio,
          };
        });

        return nextZoom;
      });
    },
    [clampZoom]
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const loadNodeChildren = useCallback(async (nodeMeta: TreeMeta) => {
    if (!nodeMeta?.id || nodeMeta.loaded || !nodeMeta.hasLazyChildren) return;

    setLoadingChildrenByNode((prev) => ({ ...prev, [nodeMeta.id]: true }));

    try {
      const response = await getData(apiRoutes.operatorHierarchy.team(nodeMeta.id));
      const responseData = response?.data?.data || {};
      const childrenRows: TeamMember[] = Array.isArray(responseData.directTeam) ? responseData.directTeam : [];

      setTreeData((prevTree) => {
        if (!prevTree) return prevTree;
        return updateNodeById(prevTree, nodeMeta.id, (target) => {
          const nextChildren = childrenRows.map((member) =>
            buildTeamNode(member, target.__meta.kind === "self" ? "direct_team" : "team", target.__meta.level + 1)
          );

          return {
            ...target,
            children: nextChildren,
            __meta: {
              ...target.__meta,
              loaded: true,
            },
          };
        });
      });
    } catch {
      setTreeData((prevTree) => {
        if (!prevTree) return prevTree;
        return updateNodeById(prevTree, nodeMeta.id, (target) => ({
          ...target,
          __meta: {
            ...target.__meta,
            loaded: false,
          },
        }));
      });
    } finally {
      setLoadingChildrenByNode((prev) => {
        const next = { ...prev };
        delete next[nodeMeta.id];
        return next;
      });
    }
  }, []);

  const onToggleNode = useCallback(
    (node: TreeNode, action: "load_expand" | "expand" | "collapse") => {
      const nodeId = node.__meta.id;
      if (loadingChildrenByNode[nodeId]) return;

      if (action === "load_expand") {
        setCollapsedByNode((prev) => ({ ...prev, [nodeId]: false }));
        void loadNodeChildren(node.__meta);
        return;
      }

      setCollapsedByNode((prev) => ({
        ...prev,
        [nodeId]: action === "collapse",
      }));
    },
    [loadNodeChildren, loadingChildrenByNode]
  );

  const onSelectNode = useCallback(
    (meta: TreeMeta) => {
      setSelectedMeta(meta);
      if (!meta.loaded && meta.hasLazyChildren && !loadingChildrenByNode[meta.id]) {
        void loadNodeChildren(meta);
      }
    },
    [loadNodeChildren, loadingChildrenByNode]
  );

  const selectedNodeFromTree = selectedMeta ? findNodeById(treeData, selectedMeta.id) : null;
  const selectedNode = selectedNodeFromTree?.__meta || selectedMeta;

  const collapseAll = useCallback(() => {
    if (!treeData) return;
    const ids = collectExpandableIds(treeData);
    const next: Record<string, boolean> = {};
    ids.forEach((id) => {
      next[id] = true;
    });
    setCollapsedByNode(next);
  }, [treeData]);

  const expandDirectTeam = useCallback(() => {
    if (!treeData) return;
    const ids = collectExpandableIds(treeData);
    const next: Record<string, boolean> = {};
    ids.forEach((id) => {
      next[id] = true;
    });

    const selfNode = findNodeById(treeData, operatorId);
    const path = findPathToNode(treeData, operatorId) || [];
    path.forEach((id) => {
      next[id] = false;
    });

    if (selfNode) {
      next[selfNode.__meta.id] = false;
      const children = Array.isArray(selfNode.children) ? selfNode.children : [];
      children.forEach((child) => {
        next[child.__meta.id] = false;
      });
    }

    setCollapsedByNode(next);
  }, [operatorId, treeData]);

  const centerOnSelf = useCallback(() => {
    if (!viewportRef.current || !operatorId) return;
    const nodeEl = viewportRef.current.querySelector(`[data-node-id="${operatorId}"]`) as HTMLElement | null;
    if (!nodeEl) return;
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const viewportCenterX = viewportRect.left + viewportRect.width / 2;
    const viewportCenterY = viewportRect.top + viewportRect.height / 2;
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    setTranslate((prev) => ({
      x: prev.x + (viewportCenterX - nodeCenterX),
      y: prev.y + (viewportCenterY - nodeCenterY),
    }));
  }, [operatorId]);

  const onViewportPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      baseX: translate.x,
      baseY: translate.y,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [translate.x, translate.y]);

  const onViewportPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!panStartRef.current) return;
    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;
    setTranslate({
      x: panStartRef.current.baseX + dx,
      y: panStartRef.current.baseY + dy,
    });
  }, []);

  const stopPanning = useCallback(() => {
    panStartRef.current = null;
    setIsPanning(false);
  }, []);

  const onViewportWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    const rect = viewportRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : undefined;
    const centerY = rect ? rect.top + rect.height / 2 : undefined;
    applyZoom(zoom + delta, centerX, centerY);
  }, [applyZoom, zoom]);

  const onViewportKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      applyZoom(zoom + 0.1);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      applyZoom(zoom - 0.1);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      resetView();
      return;
    }
    const step = 36;
    if (event.key === "ArrowLeft") setTranslate((prev) => ({ ...prev, x: prev.x + step }));
    if (event.key === "ArrowRight") setTranslate((prev) => ({ ...prev, x: prev.x - step }));
    if (event.key === "ArrowUp") setTranslate((prev) => ({ ...prev, y: prev.y + step }));
    if (event.key === "ArrowDown") setTranslate((prev) => ({ ...prev, y: prev.y - step }));
  }, [applyZoom, resetView, zoom]);

  const selectedSummary = selectedSummaryQuery.data?.data?.data?.summary || {};
  const selectedSummaryStatus = (selectedSummaryQuery.error as any)?.response?.status;
  const hasRestrictedMetrics = selectedSummaryStatus === 403 || selectedSummaryStatus === 401;

  const rootLoading =
    leadershipQuery.isLoading || teamQuery.isLoading || (isAdmin && operatorsQuery.isLoading && !selectedOperatorId);
  const rootError = leadershipQuery.isError || teamQuery.isError;

  const teamSizeFromSummary = toNumber(summary.teamSize);
  const networkCount = Math.max(teamSizeFromSummary, directTeam.length);
  const operatorLevel = leadershipChain.length + 1;

  if (rootLoading) {
    return (
      <div className="w-full p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="border border-default-200/80">
              <CardBody className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </CardBody>
            </Card>
          ))}
        </div>
        <Card className="border border-default-200/80">
          <CardBody>
            <Skeleton className="h-[520px] w-full rounded-xl" />
            <p className="mt-3 text-sm text-default-500">Loading hierarchy...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!operatorId) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-default-300/70 bg-content1 px-4 py-3 text-sm text-default-600">
          {isAdmin && operatorOptions.length === 0
            ? "No operators available to inspect."
            : "Select an operator to view hierarchy."}
        </div>
      </div>
    );
  }

  if (rootError || !treeData) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-danger-300/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-300">
          Unable to load network.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operator Network</h1>
        <p className="text-sm text-default-500">
          Visual leadership structure for mentor chain, direct team, and growth visibility.
        </p>
      </div>

      {isAdmin ? (
        <Card className="border border-default-200/80">
          <CardBody className="gap-2">
            <p className="text-xs uppercase tracking-wide text-default-500">Select Operator</p>
            <select
              value={selectedOperatorId}
              onChange={(event) => setSelectedOperatorId(String(event.target.value || ""))}
              className="h-10 rounded-lg border border-default-300 bg-content1 px-3 text-sm text-foreground"
            >
              {operatorOptions.length === 0 ? <option value="">No operators found</option> : null}
              {operatorOptions.map((option: any) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Operator Name</p>
            <p className="text-lg font-semibold text-foreground truncate">{toName(operator.name)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Operator Level</p>
            <p className="text-lg font-semibold text-foreground">L{operatorLevel}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Mentor Name</p>
            <p className="text-lg font-semibold text-foreground truncate">{mentor ? toName(mentor.name) : "No mentor"}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Team Size</p>
            <p className="text-lg font-semibold text-foreground">{teamSizeFromSummary}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Total Commission</p>
            <p className="text-lg font-semibold text-foreground">₹{formatCurrency(summary.totalEarnings || 0)}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-default-200/80 overflow-hidden">
        <CardBody className="space-y-3 p-0">
          <div className="sticky top-0 z-10 border-b border-default-200/70 bg-content1/90 px-4 py-3 backdrop-blur">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <p className="text-xs text-default-500">
                Drag to move, scroll to zoom, click node for details.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-100 px-2 py-1 text-[10px] font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">Self</span>
                <span className="rounded-full bg-success-100 px-2 py-1 text-[10px] font-semibold text-success-700 dark:bg-success-500/20 dark:text-success-200">Team</span>
                <span className="rounded-full bg-warning-100 px-2 py-1 text-[10px] font-semibold text-warning-700 dark:bg-warning-500/20 dark:text-warning-200">Leadership</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="flat" onPress={() => applyZoom(zoom - 0.1)}>
                <FiMinus />
              </Button>
              <span className="min-w-14 text-center text-xs text-default-500">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="flat" onPress={() => applyZoom(zoom + 0.1)}>
                <FiPlus />
              </Button>
              <Button size="sm" variant="flat" onPress={resetView}>
                Reset View
              </Button>
              <Button size="sm" variant="flat" onPress={centerOnSelf}>
                Center on You
              </Button>
              <Button size="sm" variant="flat" onPress={collapseAll}>
                Collapse All
              </Button>
              <Button size="sm" variant="flat" onPress={expandDirectTeam}>
                Expand Direct Team
              </Button>
            </div>
          </div>

          <div
            ref={viewportRef}
            tabIndex={0}
            onKeyDown={onViewportKeyDown}
            onWheel={onViewportWheel}
            onPointerDown={onViewportPointerDown}
            onPointerMove={onViewportPointerMove}
            onPointerUp={stopPanning}
            onPointerCancel={stopPanning}
            className={`overflow-auto rounded-xl border border-default-200/70 bg-content1/80 p-4 outline-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <div
              className={`min-w-[900px] origin-top ${isPanning ? "" : "transition-transform duration-150"}`}
              style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})` }}
            >
              <ul className="hierarchy-root">
                <HierarchyBranch
                  node={treeData}
                  collapsedByNode={collapsedByNode}
                  loadingChildrenByNode={loadingChildrenByNode}
                  onSelect={onSelectNode}
                  onToggle={onToggleNode}
                />
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border border-success-300/70 bg-success-500/10">
        <CardBody>
          <p className="text-sm text-success-800 dark:text-success-300">
            Your network currently contains <span className="font-semibold">{networkCount}</span> members.
          </p>
          <p className="mt-1 text-sm text-success-700/90 dark:text-success-200/90">
            Growing your team increases leadership earnings. Help your team activate suppliers and close trades to
            expand your commission potential.
          </p>
        </CardBody>
      </Card>

      {selectedNode ? (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px]" onClick={() => setSelectedMeta(null)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl border border-default-200/80 bg-content1 p-4 shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[360px] sm:max-h-none sm:rounded-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Operator Details</h3>
              <Button isIconOnly size="sm" variant="light" onPress={() => setSelectedMeta(null)}>
                <FiX />
              </Button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">Operator Name</p>
                <p className="font-medium text-foreground">{toName(selectedNodeFromTree?.name || selectedNode.id)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">Level</p>
                <p className="font-medium text-foreground">L{Math.max(1, selectedNode.level || 1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">Mentor</p>
                <p className="font-medium text-foreground">{toName(selectedNode.mentorName || "-")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">Team Size</p>
                <p className="font-medium text-foreground">{toNumber(selectedNode.teamSize)}</p>
              </div>

              {selectedSummaryQuery.isFetching ? (
                <div className="rounded-lg border border-default-200/70 p-3 text-default-500 flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" /> Loading metrics...
                </div>
              ) : hasRestrictedMetrics ? (
                <div className="rounded-lg border border-warning-300/70 bg-warning-500/10 p-3 text-warning-700 dark:text-warning-300">
                  Metrics are restricted for this node with your current access scope.
                </div>
              ) : selectedSummaryQuery.isError ? (
                <div className="rounded-lg border border-danger-300/70 bg-danger-500/10 p-3 text-danger-700 dark:text-danger-300">
                  Unable to load metrics for this node.
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-default-500">Total Commission</p>
                    <p className="font-medium text-foreground">₹{formatCurrency(selectedSummary.totalEarnings || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-default-500">Deals Closed</p>
                    <p className="font-medium text-foreground">{toNumber(selectedSummary.dealsClosed)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .hierarchy-root,
        .hierarchy-root ul {
          margin: 0;
          padding: 1.2rem 0 0;
          position: relative;
          display: flex;
          justify-content: center;
        }

        .hierarchy-root li {
          list-style: none;
          text-align: center;
          position: relative;
          padding: 1.2rem 0.8rem 0;
        }

        .hierarchy-root li::before,
        .hierarchy-root li::after {
          content: "";
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 1px solid rgba(148, 163, 184, 0.28);
          width: 50%;
          height: 1.2rem;
        }

        .hierarchy-root li::after {
          right: auto;
          left: 50%;
          border-left: 1px solid rgba(148, 163, 184, 0.28);
        }

        .hierarchy-root li:only-child::after,
        .hierarchy-root li:only-child::before {
          display: none;
        }

        .hierarchy-root li:only-child {
          padding-top: 0;
        }

        .hierarchy-root li:first-child::before,
        .hierarchy-root li:last-child::after {
          border: 0 none;
        }

        .hierarchy-root li:last-child::before {
          border-right: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 0 5px 0 0;
        }

        .hierarchy-root li:first-child::after {
          border-radius: 5px 0 0 0;
        }

        .hierarchy-root ul ul::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 1px solid rgba(148, 163, 184, 0.28);
          width: 0;
          height: 1.2rem;
        }
      `}</style>
    </div>
  );
}
