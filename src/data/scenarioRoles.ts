import { associateRoleDefinitions, getAssociateRoleBySlug, getAssociateRolePath } from "@/data/associateRoles";

export const OPERATOR_SCENARIO_ROLE = {
  slug: "operator",
  displayName: "Operators",
  audienceLabel: "Operator role",
} as const;

export const scenarioRoleOptions = [
  ...associateRoleDefinitions.map((role) => ({ slug: role.slug, displayName: role.displayName })),
  OPERATOR_SCENARIO_ROLE,
];

export const isOperatorScenarioRole = (roleSlug: string) => roleSlug === OPERATOR_SCENARIO_ROLE.slug;

export const getScenarioRole = (roleSlug: string) => {
  if (isOperatorScenarioRole(roleSlug)) return OPERATOR_SCENARIO_ROLE;
  const role = getAssociateRoleBySlug(roleSlug);
  return role ? { slug: role.slug, displayName: role.displayName, audienceLabel: "Associate roles" } : null;
};

export const getScenarioRolePath = (roleSlug: string) =>
  isOperatorScenarioRole(roleSlug) ? "/roles/operator" : getAssociateRolePath(roleSlug);

export const getScenarioStoryPath = (roleSlug: string, storySlug: string) =>
  `${getScenarioRolePath(roleSlug)}/real-life-scenarios/${storySlug}`;

export const getScenarioPreviewPath = (roleSlug: string, id: string) =>
  `${getScenarioRolePath(roleSlug)}/real-life-scenarios/preview/${id}`;
