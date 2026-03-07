"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { FiRefreshCw, FiX } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

type EmployeeBasic = {
  employeeId: string;
  name: string;
  email?: string;
};

type LeadershipMember = {
  employeeId: string;
  name: string;
  level: number;
  email?: string;
};

type TeamMember = {
  employeeId: string;
  name: string;
  mentorEmployee?: { employeeId: string; name: string } | null;
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
  const memberId = toId(member.employeeId);
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
      mentorName: toName(member.mentorEmployee?.name || "-"),
      teamSize,
      email: "",
      totalCommission: toNumber(member.totalCommission),
      hasLazyChildren: teamSize > 0,
      loaded: teamSize <= 0,
    },
  };
};

const buildInitialTree = ({
  employee,
  mentor,
  leadershipChain,
  directTeam,
}: {
  employee: EmployeeBasic;
  mentor: EmployeeBasic | null;
  leadershipChain: LeadershipMember[];
  directTeam: TeamMember[];
}): TreeNode | null => {
  const employeeId = toId(employee?.employeeId);
  if (!employeeId) return null;

  const sortedLeadership = [...leadershipChain].sort((a, b) => toNumber(a.level) - toNumber(b.level));
  const selfLevel = sortedLeadership.length + 1;

  const selfNode: TreeNode = {
    name: toName(employee.name),
    attributes: {
      level: `L${selfLevel}`,
      teamSize: String(directTeam.length),
    },
    children: directTeam.map((member) => buildTeamNode(member, "direct_team", selfLevel + 1)),
    __meta: {
      id: employeeId,
      kind: "self",
      level: selfLevel,
      mentorName: mentor ? toName(mentor.name) : "No mentor",
      teamSize: directTeam.length,
      email: String(employee.email || ""),
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
          id: toId(leader.employeeId),
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
  onToggle: (node: TreeNode) => void;
};

function HierarchyBranch({
  node,
  collapsedByNode,
  loadingChildrenByNode,
  onSelect,
  onToggle,
}: BranchProps) {
  const isCollapsed = Boolean(collapsedByNode[node.__meta.id]);
  const loadingChildren = Boolean(loadingChildrenByNode[node.__meta.id]);
  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;
  const canExpand = hasChildren || node.__meta.hasLazyChildren;

  return (
    <li className="hierarchy-node">
      <button
        type="button"
        onClick={() => onSelect(node.__meta)}
        className={`w-[220px] rounded-xl border px-3 py-2 shadow-md text-left ${toneByKind[node.__meta.kind]} bg-content1/95`}
      >
        <p className="truncate text-sm font-semibold">{toName(node.name)}</p>
        <p className="mt-1 text-[11px] opacity-80">{String(node.attributes?.level || `L${node.__meta.level}`)}</p>
        <p className="text-[11px] opacity-80">Team: {String(node.attributes?.teamSize || node.__meta.teamSize || 0)}</p>
      </button>

      <div className="mt-2 flex justify-center gap-2">
        {canExpand ? (
          <Button size="sm" variant="flat" className="h-7 min-w-16" onPress={() => onToggle(node)}>
            {isCollapsed ? "Expand" : "Collapse"}
          </Button>
        ) : null}
      </div>

      {loadingChildren ? <p className="mt-1 text-[11px] text-default-500">Loading branch...</p> : null}

      {hasChildren && !isCollapsed ? (
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

export default function EmployeeHierarchyPage() {
  const { user } = useContext(AuthContext);
  const selfEmployeeId = toId(user?.id);
  const roleLower = String(user?.role || "").trim().toLowerCase();
  const isAdmin = roleLower === "admin";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<TreeMeta | null>(null);
  const [loadingChildrenByNode, setLoadingChildrenByNode] = useState<Record<string, boolean>>({});
  const [collapsedByNode, setCollapsedByNode] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);

  const employeesQuery = useQuery({
    queryKey: ["employee-hierarchy", "employees", isAdmin],
    queryFn: async () => getData(apiRoutes.employee.getAll, { page: 1, limit: 5000 }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const employeeOptions = useMemo(() => {
    const rows = extractList(employeesQuery.data);
    return rows
      .map((row: any) => ({
        id: toId(row?._id || row?.id),
        name: toName(row?.name),
      }))
      .filter((row: any) => Boolean(row.id));
  }, [employeesQuery.data]);

  useEffect(() => {
    if (!isAdmin) {
      setSelectedEmployeeId(selfEmployeeId);
      return;
    }
    const validIds = new Set(employeeOptions.map((option: any) => String(option.id)));
    if (employeeOptions.length === 0) {
      if (selectedEmployeeId) setSelectedEmployeeId("");
      return;
    }
    if (selectedEmployeeId && validIds.has(selectedEmployeeId)) return;
    setSelectedEmployeeId(employeeOptions[0].id);
  }, [employeeOptions, isAdmin, selfEmployeeId, selectedEmployeeId]);

  const employeeId = isAdmin ? selectedEmployeeId : selfEmployeeId;

  const leadershipQuery = useQuery({
    queryKey: ["employee-hierarchy", "leadership", employeeId],
    queryFn: async () => getData(apiRoutes.employeeHierarchy.leadership(employeeId)),
    enabled: Boolean(employeeId),
    refetchOnWindowFocus: false,
  });

  const teamQuery = useQuery({
    queryKey: ["employee-hierarchy", "team", employeeId],
    queryFn: async () => getData(apiRoutes.employeeHierarchy.team(employeeId)),
    enabled: Boolean(employeeId),
    refetchOnWindowFocus: false,
  });

  const selfSummaryQuery = useQuery({
    queryKey: ["employee-hierarchy", "summary", employeeId],
    queryFn: async () =>
      getData(apiRoutes.commissions.employeeHistory(employeeId), {
        page: 1,
        limit: 1,
      }),
    enabled: Boolean(employeeId),
    refetchOnWindowFocus: false,
  });

  const selectedNodeEmployeeId = selectedMeta?.id || "";
  const selectedSummaryQuery = useQuery({
    queryKey: ["employee-hierarchy", "node-summary", selectedNodeEmployeeId],
    queryFn: async () =>
      getData(apiRoutes.commissions.employeeHistory(selectedNodeEmployeeId), {
        page: 1,
        limit: 1,
      }),
    enabled: Boolean(selectedNodeEmployeeId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const leadershipData = leadershipQuery.data?.data?.data || {};
  const teamData = teamQuery.data?.data?.data || {};

  const employee: EmployeeBasic = leadershipData.employee || { employeeId: employeeId, name: user?.name || "You" };
  const mentor: EmployeeBasic | null = leadershipData.mentor || null;
  const leadershipChain: LeadershipMember[] = Array.isArray(leadershipData.leadershipChain)
    ? leadershipData.leadershipChain
    : [];
  const directTeam: TeamMember[] = Array.isArray(teamData.directTeam) ? teamData.directTeam : [];

  const summary = selfSummaryQuery.data?.data?.data?.summary || {};

  const initialTree = useMemo(
    () =>
      buildInitialTree({
        employee,
        mentor,
        leadershipChain,
        directTeam,
      }),
    [employee, mentor, leadershipChain, directTeam]
  );

  useEffect(() => {
    setTreeData(initialTree);
    setSelectedMeta(null);
    setLoadingChildrenByNode({});
    setCollapsedByNode({});
    setZoom(1);
  }, [employeeId, initialTree]);

  const loadNodeChildren = useCallback(async (nodeMeta: TreeMeta) => {
    if (!nodeMeta?.id || nodeMeta.loaded || !nodeMeta.hasLazyChildren) return;

    setLoadingChildrenByNode((prev) => ({ ...prev, [nodeMeta.id]: true }));

    try {
      const response = await getData(apiRoutes.employeeHierarchy.team(nodeMeta.id));
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
    (node: TreeNode) => {
      const nodeId = node.__meta.id;
      const currentlyCollapsed = Boolean(collapsedByNode[nodeId]);
      const isExpanding = currentlyCollapsed;

      setCollapsedByNode((prev) => ({
        ...prev,
        [nodeId]: !prev[nodeId],
      }));

      if (isExpanding && !node.__meta.loaded && node.__meta.hasLazyChildren && !loadingChildrenByNode[nodeId]) {
        void loadNodeChildren(node.__meta);
      }
    },
    [collapsedByNode, loadNodeChildren, loadingChildrenByNode]
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

  const selectedSummary = selectedSummaryQuery.data?.data?.data?.summary || {};
  const selectedSummaryStatus = (selectedSummaryQuery.error as any)?.response?.status;
  const hasRestrictedMetrics = selectedSummaryStatus === 403 || selectedSummaryStatus === 401;

  const rootLoading =
    leadershipQuery.isLoading || teamQuery.isLoading || (isAdmin && employeesQuery.isLoading && !selectedEmployeeId);
  const rootError = leadershipQuery.isError || teamQuery.isError;

  const teamSizeFromSummary = toNumber(summary.teamSize);
  const networkCount = Math.max(teamSizeFromSummary, directTeam.length);
  const employeeLevel = leadershipChain.length + 1;

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

  if (!employeeId) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-default-300/70 bg-content1 px-4 py-3 text-sm text-default-600">
          {isAdmin && employeeOptions.length === 0
            ? "No employees available to inspect."
            : "Select an employee to view hierarchy."}
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
        <h1 className="text-2xl font-bold text-foreground">Employee Network</h1>
        <p className="text-sm text-default-500">
          Visual leadership structure for mentor chain, direct team, and growth visibility.
        </p>
      </div>

      {isAdmin ? (
        <Card className="border border-default-200/80">
          <CardBody className="gap-2">
            <p className="text-xs uppercase tracking-wide text-default-500">Select Employee</p>
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(String(event.target.value || ""))}
              className="h-10 rounded-lg border border-default-300 bg-content1 px-3 text-sm text-foreground"
            >
              {employeeOptions.length === 0 ? <option value="">No employees found</option> : null}
              {employeeOptions.map((option: any) => (
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
            <p className="text-xs uppercase tracking-wide text-default-500">Employee Name</p>
            <p className="text-lg font-semibold text-foreground truncate">{toName(employee.name)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Employee Level</p>
            <p className="text-lg font-semibold text-foreground">L{employeeLevel}</p>
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
        <CardBody className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-default-500">
              Click any node for details. Blue: you, Green: your team, Orange: leadership chain.
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="flat" onPress={() => setZoom((prev) => Math.max(0.65, Number((prev - 0.1).toFixed(2))))}>
                -
              </Button>
              <span className="text-xs text-default-500 min-w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="flat" onPress={() => setZoom((prev) => Math.min(1.6, Number((prev + 0.1).toFixed(2))))}>
                +
              </Button>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-default-200/70 bg-content1/80 p-4">
            <div className="min-w-[900px] origin-top transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
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
              <h3 className="text-lg font-semibold text-foreground">Employee Details</h3>
              <Button isIconOnly size="sm" variant="light" onPress={() => setSelectedMeta(null)}>
                <FiX />
              </Button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-default-500">Employee Name</p>
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
          border-top: 1px solid rgba(148, 163, 184, 0.35);
          width: 50%;
          height: 1.2rem;
        }

        .hierarchy-root li::after {
          right: auto;
          left: 50%;
          border-left: 1px solid rgba(148, 163, 184, 0.35);
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
          border-right: 1px solid rgba(148, 163, 184, 0.35);
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
          border-left: 1px solid rgba(148, 163, 184, 0.35);
          width: 0;
          height: 1.2rem;
        }
      `}</style>
    </div>
  );
}
