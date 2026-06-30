"use client";

import React, { useEffect, useMemo, useState, useContext } from "react";
import { Input, Chip, Tab, Tabs, Pagination } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiX, FiFolder, FiPackage, FiLayers, FiChevronRight, FiGrid } from "react-icons/fi";
import { ProductList } from "@/components/dashboard/Catalog/product-list";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import CatalogBreadcrumbs from "@/components/dashboard/Catalog/catalog-breadcrumbs";
import CategoryGrid from "@/components/dashboard/Catalog/category-grid";
import AuthContext from "@/context/AuthContext";
import AddModal from "@/components/CurdTable/add-model";
import EditModal from "@/components/CurdTable/edit-model";
import UserDeleteModal from "@/components/CurdTable/delete";
import { motion, AnimatePresence } from "framer-motion";
import { getClassificationOptions, getClassificationTheme, resolveActiveClassificationTheme } from "@/utils/classificationTheme";
import { getData } from "@/core/api/apiHandler";

const CATALOG_PAGE_SIZE = 24;
const CATALOG_SEARCH_PAGE_SIZE = 12;
const CATALOG_ENRICHMENT_LIMIT = 250;

const extractRows = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

// ─── Deep Search Result Card ─────────────────────────────────────────────────
function DeepSearchResult({
  item,
  type,
  breadcrumb,
  onNavigate,
}: {
  item: any;
  type: "category" | "subCategory" | "product";
  breadcrumb: string[];
  onNavigate: (item: any, type: string) => void;
}) {
  const icons = {
    category: <FiFolder size={20} className="text-warning-500" />,
    subCategory: <FiLayers size={20} className="text-warning-600" />,
    product: <FiPackage size={20} className="text-warning-700" />,
  };
  const labels = { category: "Category", subCategory: "Sub Category", product: "Product" };
  const typeColors = {
    category: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400",
    subCategory: "bg-warning-200 text-warning-800 dark:bg-warning-500/30 dark:text-warning-300",
    product: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] hover:bg-warning-500/5 hover:border-warning-500/20 transition-all outline-none focus:outline-none"
      onClick={() => onNavigate(item, type)}
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-warning-500/10 flex items-center justify-center group-hover:bg-warning-500/20 transition-colors">
        {icons[type]}
      </div>

      <div className="flex-1 min-w-0">
        {/* Hierarchy breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                <span className="text-[10px] font-bold text-default-400 uppercase tracking-wide">{crumb}</span>
                {i < breadcrumb.length - 1 && <FiChevronRight size={10} className="text-default-300 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        )}
        <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-default-400 truncate mt-0.5">{item.description}</p>
        )}
      </div>

      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${typeColors[type]}`}>
        {labels[type]}
      </span>
    </motion.button>
  );
}

// ─── Deep Search Panel ────────────────────────────────────────────────────────
function DeepSearchPanel({
  search,
  classifications,
  onNavigate,
}: {
  search: string;
  classifications: string[];
  onNavigate: (item: any, type: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Categories */}
      <QueryComponent
        api={apiRoutesByRole["category"]}
        queryKey={["search-category", search]}
        page={1}
        limit={CATALOG_SEARCH_PAGE_SIZE}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = extractRows(data);
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-warning-500 mb-3 flex items-center gap-2">
                <FiFolder size={12} /> Categories
              </p>
              <div className="flex flex-col gap-2">
                {items.map(item => (
                  <DeepSearchResult key={item._id} item={item} type="category" breadcrumb={[]} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        }}
      </QueryComponent>

      {/* SubCategories */}
      <QueryComponent
        api={apiRoutesByRole["subCategory"]}
        queryKey={["search-subCategory", search]}
        page={1}
        limit={CATALOG_SEARCH_PAGE_SIZE}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = extractRows(data);
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-warning-600 mb-3 flex items-center gap-2">
                <FiLayers size={12} /> Sub Categories
              </p>
              <div className="flex flex-col gap-2">
                {items.map(item => (
                  <DeepSearchResult
                    key={item._id}
                    item={item}
                    type="subCategory"
                    breadcrumb={item.category?.name ? [item.category.name] : []}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          );
        }}
      </QueryComponent>

      {/* Products */}
      <QueryComponent
        api={apiRoutesByRole["product"]}
        queryKey={["search-product", search]}
        page={1}
        limit={CATALOG_SEARCH_PAGE_SIZE}
        additionalParams={{
          search,
          ...(classifications.length ? { classifications } : {}),
        }}
      >
        {(data: any) => {
          const items: any[] = extractRows(data);
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-3 flex items-center gap-2">
                <FiPackage size={12} /> Products
              </p>
              <div className="flex flex-col gap-2">
                {items.map(item => {
                  const crumbs = [
                    item.subCategory?.category?.name,
                    item.subCategory?.name,
                  ].filter(Boolean);
                  return (
                    <DeepSearchResult
                      key={item._id}
                      item={item}
                      type="product"
                      breadcrumb={crumbs}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </div>
            </div>
          );
        }}
      </QueryComponent>

      {/* Companies */}
      <QueryComponent
        api={apiRoutesByRole["associateCompany"]}
        queryKey={["search-company", search]}
        page={1}
        limit={CATALOG_SEARCH_PAGE_SIZE}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = extractRows(data);
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 flex items-center gap-2">
                <FiSearch size={12} /> Companies
              </p>
              <div className="flex flex-col gap-2">
                {items.map(item => (
                  <motion.button
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] hover:bg-blue-500/5 hover:border-blue-500/20 transition-all outline-none"
                    onClick={() => {
                      // For now just clear search or maybe we could navigate to a company profile?
                      // Catalog doesn't have a company view yet, so we'll just clear or show alert.
                      window.location.href = `/dashboard/marketplace?search=${item.name}`;
                    }}
                  >
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <FiSearch size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                      <p className="text-xs text-default-400 truncate mt-0.5">{item.email} · {item.phone}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      Company
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        }}
      </QueryComponent>
    </div>
  );
}

// ─── Main Catalog Page ────────────────────────────────────────────────────────
export default function CatalogPage() {
  const { user } = useContext(AuthContext);
  const tableConfig = { ...initialTableConfig };
  const isAdmin = user?.role !== "Associate";
  const isAssociateUser = user?.role === "Associate";
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);

  const [navigation, setNavigation] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Global Catalog" }
  ]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [classificationTab, setClassificationTab] = useState<"all" | "conventional" | "natural" | "organic" | "ipm" | "gi-tag">("all");
  const [browsePage, setBrowsePage] = useState(1);
  const [browseMeta, setBrowseMeta] = useState<{ totalPages?: number; currentPage?: number } | undefined>();

  // Management State
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentLevel = navigation.length - 1;
  const currentNav = navigation[currentLevel];
  const isSearching = search.trim().length > 0;
  const effectiveClassifications = classificationTab === "all" ? [] : [classificationTab];
  const activeTheme = resolveActiveClassificationTheme(effectiveClassifications);
  const showWatermark = classificationTab !== "all";
  const WatermarkIcon = activeTheme.icon;
  const catalogItemsQuery = useQuery({
    queryKey: ["my-catalog-items-enrichment", refreshKey, user?.id],
    queryFn: () =>
      getData(apiRoutesByRole["catalogItem"], {
        page: 1,
        limit: CATALOG_ENRICHMENT_LIMIT,
      }),
    enabled: !isSearching,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const myItems = useMemo(
    () => extractRows(catalogItemsQuery.data?.data?.data ?? catalogItemsQuery.data?.data),
    [catalogItemsQuery.data]
  );

  useEffect(() => {
    setBrowsePage(1);
  }, [currentLevel, currentNav?.id, classificationTab, search]);

  const handleSelect = (item: any, selectionType: "category" | "subCategory" | "product") => {
    setNavigation(prev => {
      const latestLevel = prev.length - 1;
      const latestNav = prev[latestLevel];
      const isSameSelection = latestNav?.id === item._id;
      const expectedType =
        latestLevel === 0 ? "category" :
          latestLevel === 1 ? "subCategory" :
            latestLevel === 2 ? "product" :
              null;

      if (!expectedType || isSameSelection || selectionType !== expectedType) return prev;

      if (latestLevel < 2) {
        setSelectedProduct(null);
        return [...prev, { id: item._id, name: item.name }];
      }

      if (selectedProduct?._id === item._id) return prev;

      setSelectedProduct(item);
      return [...prev, { id: item._id, name: item.name }];
    });
  };

  // Navigate to a specific item from search
  const handleSearchNavigate = (item: any, type: string) => {
    setSearch(""); // Clear search
    if (type === "category") {
      setNavigation([{ id: null, name: "Global Catalog" }, { id: item._id, name: item.name }]);
    } else if (type === "subCategory") {
      const catName = item.category?.name ?? "Category";
      setNavigation([
        { id: null, name: "Global Catalog" },
        { id: item.category?._id ?? null, name: catName },
        { id: item._id, name: item.name },
      ]);
    } else if (type === "product") {
      const catName = item.subCategory?.category?.name ?? "Category";
      const subName = item.subCategory?.name ?? "Sub Category";
      setNavigation([
        { id: null, name: "Global Catalog" },
        { id: item.subCategory?.category?._id ?? null, name: catName },
        { id: item.subCategory?._id ?? null, name: subName },
      ]);
      setSelectedProduct(item);
    }
    setSelectedProduct(type === "product" ? item : null);
  };

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === navigation.length - 1) return;
    setNavigation(prev => prev.slice(0, index + 1));
    setSelectedProduct(null);
  };

  const refetchData = () => {
    setRefreshKey(prev => prev + 1);
    setEditItem(null);
    setDeleteItem(null);
  };

  const getLevelConfig = () => {
    if (currentLevel === 0) return { type: "category", label: "Category", table: "category" };
    if (currentLevel === 1) return { type: "subCategory", label: "Sub Category", table: "subCategory" };
    return { type: "product", label: "Product", table: "product" };
  };

  const config = getLevelConfig();

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] w-full py-6 md:py-7 relative">
      {/* Background Classification Watermark */}
      <AnimatePresence mode="wait">
        {showWatermark && (
          <motion.div
            key={activeTheme.key}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <div className={`absolute inset-0 ${activeTheme.pageWashClass}`} />
            <div className={`absolute inset-0 ${activeTheme.pageWashOverlayClass}`} />
            <div className={`absolute ${activeTheme.watermarkPositionClass}`}>
              <WatermarkIcon
                className={`${activeTheme.watermarkIconClass} ${activeTheme.watermarkOpacityClass} ${activeTheme.watermarkSizeClass} ${activeTheme.watermarkBlurClass}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1400px] px-4 sm:px-5 lg:px-6 relative z-10 flex flex-col h-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6 border-b border-foreground/5 pb-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1 uppercase">
              Global <span className="text-warning-500">Catalog</span>
            </h1>
            <p className="text-default-400 text-sm font-medium tracking-wide">
              Browse through our premium selection of commodities and variants.
            </p>
            {isAssociateUser && !hasLinkedCompany && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip size="sm" color="warning" variant="flat">
                  Personal Catalog Mode
                </Chip>
                <Chip size="sm" variant="bordered" className="border-warning-400/50 text-warning-700 dark:text-warning-300">
                  Own rates require company linkage
                </Chip>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-[380px] relative">
              <Input
                placeholder="Deep search — products, categories, variants..."
                value={search}
                onValueChange={setSearch}
                startContent={<FiSearch className={isSearching ? "text-warning-500" : "text-default-400"} />}
                endContent={search && <FiX className="cursor-pointer text-default-400 hover:text-warning-500 transition-colors" onClick={() => setSearch("")} />}
                classNames={{
                  inputWrapper: `bg-foreground/[0.03] border shadow-xl backdrop-blur-md h-12 px-4 transition-all ${isSearching ? "border-warning-500/40 bg-warning-500/5" : "border-transparent"}`,
                  input: "text-sm",
                }}
              />
              {isSearching && (
                <div className="absolute -bottom-1.5 left-4 right-4 h-[2px] bg-gradient-to-r from-warning-400 to-orange-500 rounded-full" />
              )}
            </div>

            {isAdmin && !selectedProduct && !isSearching && (
              <AddModal
                name={config.label}
                currentTable={config.table}
                formFields={tableConfig[config.table].filter((f: any) =>
                  currentLevel === 0 ? true :
                    currentLevel === 1 ? f.key !== "category" :
                      f.key !== "subCategory"
                )}
                apiEndpoint={apiRoutesByRole[config.type]}
                additionalVariable={
                  currentLevel === 1 ? { category: currentNav.id } :
                    currentLevel === 2 ? { subCategory: currentNav.id } :
                      {}
                }
                refetchData={refetchData}
              />
            )}
          </div>
        </div>
        <div className={`mb-5 flex flex-col gap-2.5 rounded-2xl border p-2.5 sm:p-3 ${activeTheme.shellClass} ${activeTheme.shellBorderClass}`}>
          <Tabs
            aria-label="Catalog Classification Tabs"
            selectedKey={classificationTab}
            onSelectionChange={(key) => setClassificationTab(key as any)}
            variant="underlined"
            color="warning"
            classNames={{
              tabList: "gap-3 relative rounded-none p-0 border-b border-divider/30",
              cursor: "bg-transparent h-0",
              tab: "max-w-fit px-0 h-11 data-[hover-unselected=true]:opacity-100",
              tabContent: "p-0"
            }}
          >
            <Tab
              key="all"
              title={(
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 transition-all ${
                  classificationTab === "all"
                    ? "bg-warning-500/15 border-warning-400/45 text-warning-600 shadow-sm font-bold"
                    : "bg-transparent border-transparent text-default-400 hover:bg-default-500/10 font-semibold"
                }`}>
                  <FiGrid size={14} className={classificationTab === "all" ? "text-warning-500" : "text-default-400"} />
                  <span>All</span>
                </span>
              )}
            />
            {getClassificationOptions().map((item) => {
              const theme = getClassificationTheme(item.key);
              const isSelected = classificationTab === item.key;
              return (
                <Tab
                  key={item.key}
                  title={(
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 transition-all ${
                        isSelected ? `${theme.tabPillActiveClass} ${theme.tabActiveClass} font-bold` : `${theme.tabPillIdleClass} ${theme.tabIdleClass} font-semibold`
                      }`}
                    >
                      <item.icon size={14} className={isSelected ? theme.tabIconActiveClass : theme.tabIconIdleClass} />
                      <span>{item.label}</span>
                    </span>
                  )}
                />
              );
            })}
          </Tabs>
        </div>

        {/* Navigation Breadcrumbs */}
        {!isSearching && <CatalogBreadcrumbs paths={navigation} onNavigate={handleBreadcrumbNavigate} />}

        {/* Search Mode Label */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 mb-5"
            >
              <FiSearch className="text-warning-500" size={16} />
              <span className="text-sm font-semibold text-default-500">
                Searching across all levels for{" "}
                <span className="text-warning-500 font-bold">&quot;{search}&quot;</span>
              </span>
              <button
                onClick={() => setSearch("")}
                className="ml-auto text-xs font-bold text-default-400 hover:text-warning-500 transition-colors flex items-center gap-1"
              >
                <FiX size={12} /> Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 w-full min-h-[600px]">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DeepSearchPanel search={search} classifications={effectiveClassifications} onNavigate={handleSearchNavigate} />
              </motion.div>
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {selectedProduct ? (
                  <div className={`rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden border ${activeTheme.shellClass} ${activeTheme.shellBorderClass}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning-400 to-orange-500 opacity-50" />
                    <ProductList
                      product={selectedProduct}
                      setProduct={setSelectedProduct}
                      themeShellClass={activeTheme.shellClass}
                      themeBorderClass={activeTheme.shellBorderClass}
                      onProductDeleted={() => {
                        setSelectedProduct(null);
                        handleBreadcrumbNavigate(2);
                        refetchData();
                      }}
                      myCatalogItems={myItems}
                    />
                  </div>
                ) : (
                  <QueryComponent
                    api={apiRoutesByRole[config.type]}
                    queryKey={[config.type, currentNav.id || "root", refreshKey, effectiveClassifications.join(",")]}
                    page={browsePage}
                    limit={CATALOG_PAGE_SIZE}
                    additionalParams={{
                      ...(currentLevel === 1 ? { category: currentNav.id } : {}),
                      ...(currentLevel === 2 ? { subCategory: currentNav.id } : {}),
                      ...(config.type === "product" && effectiveClassifications.length
                        ? { classifications: effectiveClassifications }
                        : {}),
                    }}
                    onMetaChange={setBrowseMeta}
                  >
                    {(data: any, _refetch, meta) => {
                      const items = extractRows(data);
                      const counts: Record<string, number> = {};
                      myItems.forEach((item: any) => {
                        let id = null;
                        if (currentLevel === 0) id = item.productVariantId?.product?.category?._id || item.productVariantId?.product?.subCategory?.category?._id;
                        else if (currentLevel === 1) id = item.productVariantId?.product?.subCategory?._id;
                        else if (currentLevel === 2) id = item.productVariantId?.product?._id;
                        if (id) counts[id] = (counts[id] || 0) + 1;
                      });
                      const pageCount = meta?.totalPages || browseMeta?.totalPages || 1;

                      return (
                        <div className="flex flex-col gap-6">
                          {items.length > 0 ? (
                            <>
                              <CategoryGrid
                                items={items}
                                onSelect={(item) => handleSelect(item, config.type as "category" | "subCategory" | "product")}
                                type={config.type as any}
                                cardThemeClass={activeTheme.shellClass}
                                cardBorderClass={activeTheme.shellBorderClass}
                                counts={counts}
                                isAdmin={isAdmin}
                                onEdit={setEditItem}
                                onDelete={setDeleteItem}
                              />
                              {pageCount > 1 && (
                                <div className="flex justify-center pt-2">
                                  <Pagination
                                    isCompact
                                    showControls
                                    color="warning"
                                    page={meta?.currentPage || browsePage}
                                    total={pageCount}
                                    onChange={setBrowsePage}
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center gap-4 text-default-400">
                              <div className="w-24 h-24 rounded-[2rem] bg-foreground/5 flex items-center justify-center mb-4 border border-foreground/10 rotate-12">
                                <FiX size={40} className="opacity-20" />
                              </div>
                              <h3 className="text-2xl font-bold text-foreground">No Items Found</h3>
                              <p className="max-w-md mx-auto text-sm leading-relaxed">
                                We couldn&apos;t find any results here. Try searching or navigate back.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </QueryComponent>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden Management Modals */}
      {editItem && (
        <EditModal
          _id={editItem._id}
          initialData={editItem}
          currentTable={config.label}
          formFields={tableConfig[config.table].filter((f: any) =>
            currentLevel === 0 ? true :
              currentLevel === 1 ? f.key !== "category" :
                f.key !== "subCategory"
          )}
          apiEndpoint={apiRoutesByRole[config.type]}
          refetchData={refetchData}
          onClose={() => setEditItem(null)}
          isOpen={!!editItem}
        />
      )}
      {deleteItem && (
        <UserDeleteModal
          _id={deleteItem._id}
          name={deleteItem.name}
          deleteApiEndpoint={apiRoutesByRole[config.type]}
          refetchData={refetchData}
          onClose={() => setDeleteItem(null)}
          isOpen={!!deleteItem}
        />
      )}
    </div>
  );
}
