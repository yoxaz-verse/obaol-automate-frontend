"use client";

import React, { useState, useContext } from "react";
import { Input, Chip } from "@heroui/react";
import { FiSearch, FiX, FiFolder, FiPackage, FiLayers, FiChevronRight } from "react-icons/fi";
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

const CATALOG_FETCH_LIMIT = 5000;

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
                <span className="text-[10px] font-semibold text-default-400 uppercase tracking-wide">{crumb}</span>
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
  onNavigate,
}: {
  search: string;
  onNavigate: (item: any, type: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Categories */}
      <QueryComponent
        api={apiRoutesByRole["category"]}
        queryKey={["search-category", search]}
        page={1}
        limit={CATALOG_FETCH_LIMIT}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-warning-500 mb-3 flex items-center gap-2">
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
        limit={CATALOG_FETCH_LIMIT}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-warning-600 mb-3 flex items-center gap-2">
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
        limit={CATALOG_FETCH_LIMIT}
        additionalParams={{ search }}
      >
        {(data: any) => {
          const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
          if (!items.length) return null;
          return (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 mb-3 flex items-center gap-2">
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
    </div>
  );
}

// ─── Main Catalog Page ────────────────────────────────────────────────────────
export default function CatalogPage() {
  const { user } = useContext(AuthContext);
  const tableConfig = { ...initialTableConfig };
  const isAdmin = user?.role !== "Associate";

  const [navigation, setNavigation] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Catalog" }
  ]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  // Management State
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentLevel = navigation.length - 1;
  const currentNav = navigation[currentLevel];
  const isSearching = search.trim().length > 0;

  const handleSelect = (item: any) => {
    if (currentLevel < 2) {
      setNavigation(prev => [...prev, { id: item._id, name: item.name }]);
    } else {
      setSelectedProduct(item);
      setNavigation(prev => [...prev, { id: item._id, name: item.name }]);
    }
  };

  // Navigate to a specific item from search
  const handleSearchNavigate = (item: any, type: string) => {
    setSearch(""); // Clear search
    if (type === "category") {
      setNavigation([{ id: null, name: "Catalog" }, { id: item._id, name: item.name }]);
    } else if (type === "subCategory") {
      const catName = item.category?.name ?? "Category";
      setNavigation([
        { id: null, name: "Catalog" },
        { id: item.category?._id ?? null, name: catName },
        { id: item._id, name: item.name },
      ]);
    } else if (type === "product") {
      const catName = item.subCategory?.category?.name ?? "Category";
      const subName = item.subCategory?.name ?? "Sub Category";
      setNavigation([
        { id: null, name: "Catalog" },
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
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] w-full py-8 relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-warning/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-warning/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1400px] px-6 relative z-10 flex flex-col h-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-foreground/5 pb-8">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1 uppercase">
              Global <span className="text-warning-500">Catalog</span>
            </h1>
            <p className="text-default-400 text-sm font-medium tracking-wide">
              Browse through our premium selection of commodities and variants.
            </p>
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
              <div className="shadow-xl rounded-xl overflow-hidden">
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
              </div>
            )}
          </div>
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
              className="flex items-center gap-3 mb-6"
            >
              <FiSearch className="text-warning-500" size={16} />
              <span className="text-sm font-semibold text-default-500">
                Searching across all levels for{" "}
                <span className="text-warning-500 font-black">&quot;{search}&quot;</span>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DeepSearchPanel search={search} onNavigate={handleSearchNavigate} />
              </motion.div>
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <QueryComponent
                  api={apiRoutesByRole["catalogItem"]}
                  queryKey={["my-catalog-items", refreshKey]}
                  page={1}
                  limit={CATALOG_FETCH_LIMIT}
                >
                  {(catalogItemsData: any) => {
                    const myItems = Array.isArray(catalogItemsData)
                      ? catalogItemsData
                      : (Array.isArray(catalogItemsData?.data)
                        ? catalogItemsData.data
                        : (Array.isArray(catalogItemsData?.data?.data)
                          ? catalogItemsData.data.data
                          : []));

                    if (selectedProduct) {
                      return (
                        <div className="bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning-400 to-orange-500 opacity-50" />
                          <ProductList
                            product={selectedProduct}
                            setProduct={setSelectedProduct}
                            onProductDeleted={() => {
                              setSelectedProduct(null);
                              handleBreadcrumbNavigate(2);
                              refetchData();
                            }}
                            myCatalogItems={myItems}
                          />
                        </div>
                      );
                    }

                    const api = apiRoutesByRole[config.type];
                    const queryKey = [config.type, currentNav.id || "root", refreshKey];
                    const params = currentLevel === 1 ? { category: currentNav.id } : currentLevel === 2 ? { subCategory: currentNav.id } : {};

                    return (
                      <QueryComponent
                        api={api}
                        queryKey={[...queryKey]}
                        page={1}
                        limit={CATALOG_FETCH_LIMIT}
                        additionalParams={params}
                      >
                        {(data: any) => {
                          const items = Array.isArray(data)
                            ? data
                            : (Array.isArray(data?.data)
                              ? data.data
                              : (Array.isArray(data?.data?.data)
                                ? data.data.data
                                : []));

                          const counts: Record<string, number> = {};
                          myItems.forEach((item: any) => {
                            let id = null;
                            if (currentLevel === 0) id = item.productVariantId?.product?.category?._id || item.productVariantId?.product?.subCategory?.category?._id;
                            else if (currentLevel === 1) id = item.productVariantId?.product?.subCategory?._id;
                            else if (currentLevel === 2) id = item.productVariantId?.product?._id;
                            if (id) counts[id] = (counts[id] || 0) + 1;
                          });

                          return (
                            <div className="flex flex-col gap-8">
                              {items.length > 0 ? (
                                <CategoryGrid
                                  items={items}
                                  onSelect={handleSelect}
                                  type={config.type as any}
                                  counts={counts}
                                  isAdmin={isAdmin}
                                  onEdit={setEditItem}
                                  onDelete={setDeleteItem}
                                />
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
                    );
                  }}
                </QueryComponent>
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
