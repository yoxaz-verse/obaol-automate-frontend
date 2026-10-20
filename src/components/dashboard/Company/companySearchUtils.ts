export type CompanySearchPage<T> = {
  companies: T[];
  currentPage: number;
  totalPages: number;
};

const asPositiveNumber = (value: unknown, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const parseCompanySearchPage = <T>(response: any): CompanySearchPage<T> => {
  const payload = response?.data?.data;
  const result = payload?.data && !Array.isArray(payload) ? payload : response?.data;
  const companies = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    companies,
    currentPage: asPositiveNumber(result?.currentPage, 1),
    totalPages: asPositiveNumber(result?.totalPages, 1),
  };
};

export const getNextCompanySearchPage = <T>(lastPage: CompanySearchPage<T>) =>
  lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;

export const mergeCompanySearchPages = <T extends { _id: string; name?: string }>(
  pages: Array<CompanySearchPage<T>>,
) => {
  const byId = new Map<string, T>();

  pages.forEach((page) => {
    page.companies.forEach((company) => {
      if (company?._id) byId.set(String(company._id), company);
    });
  });

  return Array.from(byId.values()).sort((left, right) =>
    String(left.name || "").localeCompare(String(right.name || ""), undefined, {
      sensitivity: "base",
    }),
  );
};
