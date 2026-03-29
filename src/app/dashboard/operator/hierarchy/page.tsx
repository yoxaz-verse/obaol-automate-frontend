"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { FiAward, FiBriefcase, FiChevronDown, FiChevronUp, FiMaximize, FiMinus, FiMinusCircle, FiMousePointer, FiPlus, FiPlusCircle, FiRefreshCw, FiShield, FiTarget, FiUsers, FiX, FiZap } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { AnimatePresence, motion } from "framer-motion";

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
  self: "border-primary-500/30 bg-primary-500/5 text-primary-600 dark:text-primary-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
  direct_team: "border-success-500/30 bg-success-500/5 text-success-600 dark:text-success-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
  team: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]",
  leadership: "border-warning-500/30 bg-warning-500/5 text-warning-600 dark:text-warning-400 shadow-[0_0_20px_rgba(245,165,36,0.1)]",
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

  let actionIcon: JSX.Element | null = null;
  let actionKind: "load_expand" | "expand" | "collapse" | null = null;

  if (loadingChildren) {
    actionIcon = <FiRefreshCw className="animate-spin text-primary" size={14} />;
  } else if (canLazyLoad) {
    actionKind = "load_expand";
    actionIcon = <FiPlusCircle className="text-primary group-hover:scale-125 transition-transform" size={18} />;
  } else if (isExpandedVisible) {
    actionKind = "collapse";
    actionIcon = <FiMinusCircle className="text-default-400 group-hover:scale-125 transition-transform" size={18} />;
  } else if (hasRenderedChildren) {
    actionKind = "expand";
    actionIcon = <FiPlusCircle className="text-primary group-hover:scale-125 transition-transform" size={18} />;
  }

  return (
    <li className="hierarchy-node" data-node-id={node.__meta.id}>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => onSelect(node.__meta)}
          className={`w-[260px] group/node relative rounded-xl border-l-[6px] border px-5 py-4 text-left ${toneByKind[node.__meta.kind]} bg-content1 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all duration-200 outline-none select-none`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-black uppercase tracking-tight text-foreground leading-tight">{toName(node.name)}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5 opacity-40">
                  <FiUsers size={11} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{String(node.attributes?.teamSize || node.__meta.teamSize || 0)} NODES</span>
                </div>
                {node.__meta.totalCommission > 0 && (
                  <div className="flex items-center gap-1.5 text-primary-500">
                    <FiZap size={11} />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">₹{formatCurrency(node.__meta.totalCommission)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-default-500 leading-none">
                {String(node.attributes?.level || `L${node.__meta.level}`)}
              </span>
            </div>
          </div>

          {actionIcon && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (actionKind) onToggle(node, actionKind);
                }}
                className="w-5 h-5 rounded-full bg-content2 border border-divider flex items-center justify-center shadow-lg hover:bg-primary-500 hover:text-white transition-all text-default-400"
              >
                {actionIcon}
              </button>
            </div>
          )}
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {hasRenderedChildren && !isCollapsed && (
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="hierarchy-list"
          >
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
          </motion.ul>
        )}
      </AnimatePresence>
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500 text-white flex items-center justify-center">
              <FiTarget size={18} />
            </div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">Operator Network</h1>
          </div>
          <p className="text-sm font-bold text-default-400 uppercase tracking-widest max-w-xl">
            Visual leadership structure for mentor chain, direct team, and growth visibility.
          </p>
        </div>

        {isAdmin && (
          <div className="min-w-[280px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-1">Network Inspector</p>
            <select
              value={selectedOperatorId}
              onChange={(event) => setSelectedOperatorId(String(event.target.value || ""))}
              className="w-full h-12 rounded-[1rem] border border-divider bg-content1/50 backdrop-blur-md px-4 text-xs font-black uppercase tracking-wider text-foreground hover:border-primary-500/50 transition-colors cursor-pointer outline-none"
            >
              {operatorOptions.length === 0 ? <option value="">No operators found</option> : null}
              {operatorOptions.map((option: any) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: "Active Agent", value: toName(operator.name), icon: <FiBriefcase className="text-primary-500" />, sub: "Identity" },
          { label: "Vantage Level", value: `L${operatorLevel}`, icon: <FiAward className="text-warning-500" />, sub: "Rank" },
          { label: "Strategic Mentor", value: mentor ? toName(mentor.name) : "Autonomous", icon: <FiTarget className="text-secondary-500" />, sub: "Upline" },
          { label: "Network Size", value: networkCount, icon: <FiUsers className="text-success-500" />, sub: "Members" },
          { label: "Total Yield", value: `₹${formatCurrency(summary.totalEarnings || 0)}`, icon: <FiZap className="text-yellow-500" />, sub: "Commissions" },
        ].map((card, i) => (
          <Card key={i} className="border border-divider/50 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-none rounded-[1.5rem] group hover:border-primary-500/30 transition-all duration-300">
            <CardBody className="p-5 flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-default-100 dark:bg-default-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-0.5">{card.label}</p>
                <p className="text-base font-black text-foreground truncate leading-tight uppercase tracking-tighter">{card.value}</p>
                <p className="text-[8px] font-bold text-default-300 uppercase tracking-widest mt-1">{card.sub}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="border border-divider/40 bg-white/5 dark:bg-black/10 rounded-2xl overflow-hidden shadow-none">
        <CardBody className="p-0 relative h-[620px]">
          {/* Diagnostic Hub Header */}
          <div className="absolute top-6 left-6 z-40 bg-content1 border border-divider p-4 rounded-xl shadow-xl space-y-4 pointer-events-auto backdrop-blur-md max-w-[240px]">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 leading-none mb-1.5">Network Telemetry</h3>
              <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest leading-relaxed">Direct Pointer Control • Multi-Axis Scaling</p>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-divider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-primary-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-default-400">SELF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-success-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-default-400">TEAM</span>
              </div>
            </div>
          </div>

          {/* Precision Controllers */}
          <div className="absolute top-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
            <div className="bg-content1 border border-divider p-1 rounded-xl shadow-xl pointer-events-auto flex flex-col">
              <Button isIconOnly variant="light" size="sm" radius="md" title="Zoom In" onPress={() => applyZoom(zoom + 0.1)}><FiPlus /></Button>
              <div className="h-px bg-divider mx-1" />
              <Button isIconOnly variant="light" size="sm" radius="md" title="Zoom Out" onPress={() => applyZoom(zoom - 0.1)}><FiMinus /></Button>
            </div>
            <div className="bg-content1 border border-divider p-1 rounded-xl shadow-xl pointer-events-auto flex gap-1">
              <Button isIconOnly variant="light" size="sm" radius="md" title="Collapse All" onPress={collapseAll}><FiMinusCircle /></Button>
              <Button isIconOnly variant="light" size="sm" radius="md" title="Expand Direct" onPress={expandDirectTeam}><FiPlusCircle /></Button>
              <div className="w-px bg-divider my-1" />
              <Button isIconOnly variant="light" size="sm" radius="md" title="Sync Target" onPress={centerOnSelf}><FiMousePointer /></Button>
              <Button isIconOnly variant="light" size="sm" radius="md" title="Reset View" onPress={resetView}><FiMaximize /></Button>
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
            className={`w-full h-full outline-none select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <div
              className="origin-top p-40"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
                transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)'
              }}
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
        <AnimatePresence>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" onClick={() => setSelectedMeta(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-content1 border-l border-divider p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-500 mb-1">Node Inspector</h3>
                  <p className="text-xl font-black text-foreground tracking-tight uppercase">Agent Intelligence</p>
                </div>
                <Button isIconOnly size="md" variant="light" radius="full" className="hover:bg-default-100" onPress={() => setSelectedMeta(null)}>
                  <FiX size={20} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                <div className="flex flex-col items-center py-6 bg-default-100/30 rounded-3xl border border-divider/50">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-black shadow-xl mb-4 border-4 border-white/10">
                    {toName(selectedNodeFromTree?.name || selectedNode.id).charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tight">{toName(selectedNodeFromTree?.name || selectedNode.id)}</h4>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 mt-1">
                    Ranked L{Math.max(1, selectedNode.level || 1)} Operative
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-divider bg-default-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Network Mentor</p>
                    <p className="font-black text-foreground uppercase truncate">{toName(selectedNode.mentorName || "-")}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-divider bg-default-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-1">Direct Force</p>
                    <p className="font-black text-foreground uppercase truncate">{toNumber(selectedNode.teamSize)} Nodes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-500 border-b border-divider pb-2">Yield Telemetry</h5>

                  {selectedSummaryQuery.isFetching ? (
                    <div className="rounded-2xl border border-divider p-6 text-default-500 flex flex-col items-center gap-3 animate-pulse">
                      <FiRefreshCw className="animate-spin text-primary" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</span>
                    </div>
                  ) : hasRestrictedMetrics ? (
                    <div className="rounded-2xl border border-warning-500/20 bg-warning-500/5 p-6 text-center space-y-2">
                      <FiShield className="mx-auto text-warning-500" size={24} />
                      <p className="text-[10px] font-black text-warning-600 uppercase tracking-widest">Access Restricted</p>
                      <p className="text-[11px] font-medium text-default-500 leading-relaxed">Financial metrics are isolated for nodes outside your immediate leadership scope.</p>
                    </div>
                  ) : selectedSummaryQuery.isError ? (
                    <div className="rounded-2xl border border-danger-500/20 bg-danger-500/5 p-6 text-center">
                      <p className="text-[10px] font-black text-danger-600 uppercase">Telemetry Link Failed</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 rounded-2xl border border-divider/50 bg-success-500/5 group hover:border-success-500/30 transition-all">
                        <div className="flex items-center gap-3 text-success-600">
                          <FiZap size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Total Earnings</span>
                        </div>
                        <span className="text-lg font-black text-success-700 tracking-tighter">₹{formatCurrency(selectedSummary.totalEarnings || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-2xl border border-divider/50 bg-primary-500/5 group hover:border-primary-500/30 transition-all">
                        <div className="flex items-center gap-3 text-primary-600">
                          <FiBriefcase size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Closed Trades</span>
                        </div>
                        <span className="text-lg font-black text-primary-700 tracking-tighter">{toNumber(selectedSummary.dealsClosed)} UNIT</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-8">
                <Button
                  className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-foreground text-background shadow-xl hover:-translate-y-1 transition-all"
                  onPress={() => setSelectedMeta(null)}
                >
                  Mission Complete
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      ) : null}

      <style jsx>{`
        .hierarchy-root,
        .hierarchy-root ul {
          margin: 0;
          padding: 2rem 0 0;
          position: relative;
          display: flex;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hierarchy-root li {
          list-style: none;
          text-align: center;
          position: relative;
          padding: 2.5rem 0.5rem 0;
        }

        /* The horizontal bar connecting siblings */
        .hierarchy-root li::before,
        .hierarchy-root li::after {
          content: "";
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 3px solid rgba(148, 163, 184, 0.6);
          width: 50%;
          height: 2.5rem;
          z-index: 0;
        }

        .hierarchy-root li::after {
          right: auto;
          left: 50%;
          border-left: 3px solid rgba(148, 163, 184, 0.6);
        }

        /* Remove the horizontal bar for single child */
        .hierarchy-root li:only-child::before,
        .hierarchy-root li:only-child::after {
          display: none;
        }

        /* But single child still needs a vertical line up */
        .hierarchy-root li:only-child {
          padding-top: 2.5rem;
        }
        
        .hierarchy-root li:only-child::before {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 3px solid rgba(148, 163, 184, 0.6);
          width: 0;
          height: 2.5rem;
        }

        .hierarchy-root li:first-child::before,
        .hierarchy-root li:last-child::after {
          border: 0 none;
        }

        .hierarchy-root li:last-child::before {
          border-right: 3px solid rgba(148, 163, 184, 0.6);
          border-radius: 0 1.5rem 0 0;
        }

        .hierarchy-root li:first-child::after {
          border-radius: 1.5rem 0 0 0;
        }

        /* The vertical line from parent down to children */
        .hierarchy-root ul ul::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 3px solid rgba(148, 163, 184, 0.6);
          width: 0;
          height: 2.5rem;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
