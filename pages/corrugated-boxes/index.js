import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Head from "next/head";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { getService, postService } from "../../services/service";
import CorrugatedBanner from "../../components/landing/CorrugatedBanner";
import { useRouter } from "next/router";
import Loader from "../../components/loader";

/* ------------ dynamic imports (lazy) so heavy card bundles & images load later ------------ */
const ListingCard = dynamic(
  () => import("../../components/listing/ListingCard"),
  {
    loading: () => <div style={{ height: 200 }} />,
  }
);
const DesktopListingCard = dynamic(
  () => import("../../components/listing/DesktopLisingCard"),
  { loading: () => <div style={{ height: 200 }} /> }
);

/* --------------------------
  Server-side props (paged)
  - fetch only first page to keep SSR payload small
---------------------------*/
export async function getServerSideProps(context) {
  const initialLimit = 24;
  const searchRes = await getService(`category/all`);
  const prod = await getService(`product/get?page=1&limit=${initialLimit}`);
  const query = context.query;

  let brandId = null;
  if (query?.brand) {
    const brands = await getService(`brand/all`);
    const brand = brands?.data?.data?.filter(
      (item) => item.name === query?.brand
    );
    brandId = brand?.[0]?._id || null;
  }

  let subCategoryId = null;
  if (query?.subcategory) {
    const subcategories = await getService(`subcategory/all`);
    const subcategory = subcategories?.data?.data?.filter(
      (item) => item.name === query?.subcategory
    );
    subCategoryId = subcategory?.[0]?._id || null;
  }

  // Debug SSR props on server (will show in server console during SSR)
  // console.log("SSR props: ", { initialLimit, prodLength: prod?.data?.data?.length, query, brandId, subCategoryId });

  return {
    props: {
      brand: searchRes?.data ? searchRes?.data?.data : [],
      product: prod?.data ? prod?.data?.data : [], // first page only
      initialPage: 1,
      initialLimit,
      category: query?.category ? query?.category : null,
      brandId: brandId,
      subCategoryId: subCategoryId,
      q: query?.q ? query?.q : null,
    },
  };
}

/* --------------------------
  Tiny constants & utils
---------------------------*/
const label = { inputProps: { "aria-label": "Checkbox demo" } };

const CustomSliderStyles = {
  "& .MuiSlider-thumb": {
    color: "white",
  },
  "& .MuiSlider-track": {
    color: "#E92227",
  },
  "& .MuiSlider-rail": {
    color: "#E0E0E0",
  },
  "& .MuiSlider-active": {
    color: "#E92227",
  },
};

function valuetext(value) {
  return `${value}°C`;
}

const selectSmallStyle = {
  paddingLeft: "12px",
  marginRight: "10px",
  width: "66px",
  height: "34px",
  backgroundColor: "white",
  border: "1px solid #D9D9D9",
};
const selectSortStyle = {
  paddingLeft: "12px",
  width: "193px",
  height: "34px",
  backgroundColor: "white",
  border: "1px solid #D9D9D9",
};
const brandCheckboxSx = {
  padding: "0px",
  color: "gray",
  "&.Mui-checked": {
    color: "gray",
  },
  "&.Mui-unchecked": {
    color: "gray",
  },
};

// If you know the Corrugated category ID, put it here as fallback.
const KNOWN_CORRUGATED_ID = "6557deab301ec4f2f4266131";

/* --------------------------
  Component (pages-router / design kept)
---------------------------*/
const BoppTape = ({
  brand,
  product = [], // initial first-page products from SSR
  category,
  brandId,
  subCategoryId,
  q,
  initialPage = 1,
  initialLimit = 24,
}) => {
  const router = useRouter();

  /* ---------- Data buffers ---------- */
  const [fetchedProducts, setFetchedProducts] = useState([]); // display buffer (what we render)
  const [filteredProducts, setFilteredProducts] = useState([]); // full filtered result set (client)
  const [useFilteredMode, setUseFilteredMode] = useState(false);

  /* ---------- UI / filters / paging ---------- */
  const [length, setLength] = useState([0, 300]);
  const [breadth, setBreadth] = useState([0, 300]);
  const [height, setHeight] = useState([0, 300]);
  const [showing, setShowing] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [unit, setUnit] = useState("inches");
  const [isLoading, setIsLoading] = useState(false);
  const [flags, setFlags] = useState({
    size: false,
    category: false,
    sort: false,
  });

  // fixed/clean names (typos fixed)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const breakpoint = 700;
  const minValue = 0;
  const maxValue = useMemo(() => (unit === "inches" ? 20 : 300), [unit]);

  // backend pagination state (for unfiltered mode)
  const [backendPage, setBackendPage] = useState(initialPage);
  const [hasMoreBackend, setHasMoreBackend] = useState(true);
  const sentinelRef = useRef(null);

  // network-control refs
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  /* ---------- helper: isCorrugated ---------- */
  const isCorrugated = useCallback((p) => {
    if (!p) return false;
    if (p.category && typeof p.category === "object") {
      return String(p.category.name || "").toLowerCase() === "corrugated box";
    }
    if (typeof p.category === "string") {
      return p.category === KNOWN_CORRUGATED_ID;
    }
    return false;
  }, []);

  /* ---------- Use SSR initial products (first page only) ---------- */
  useEffect(() => {
    console.debug("[SSR] props received on client:", {
      productLength: product?.length,
      initialPage,
      initialLimit,
      q,
      brandId,
      subCategoryId,
    });

    if (Array.isArray(product) && product.length > 0) {
      const corrugatedFromSSR = product.filter((prod) => isCorrugated(prod));
      // show SSR-supplied corrugated items (initial page)
      setFetchedProducts(corrugatedFromSSR);

      console.debug(
        "[SSR] applied corrugatedFromSSR → fetchedProducts:",
        corrugatedFromSSR.length,
        "items"
      );

      // If SSR returned less than requested limit, backend still might have more pages — keep hasMoreBackend true if SSR length === initialLimit
      setHasMoreBackend(product.length >= initialLimit);
      setUseFilteredMode(false);
      setCurrentPage(1);
      setBackendPage(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isCorrugated]);

  /* ---------- Backend fetch (unfiltered) with AbortController ---------- */
  const fetchBackendPage = useCallback(
    async (pageToFetch = 1, limit = showing) => {
      // cancel previous
      if (abortRef.current) {
        console.debug(
          "[network] aborting previous request before starting new fetch"
        );
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      console.debug("[network] fetchBackendPage START:", {
        pageToFetch,
        limit,
      });
      setIsLoading(true);
      try {
        // IMPORTANT: pass signal to your getService. Update getService to forward `options.signal` to fetch/axios if needed.
        const res = await getService(
          `product/get?page=${pageToFetch}&limit=${limit}`,
          { signal: controller.signal }
        );
        const arr = res?.data?.data || [];
        const corr = arr.filter(isCorrugated);

        console.debug("[network] fetchBackendPage RESPONSE:", {
          pageToFetch,
          returned: arr.length,
          corrugatedReturned: corr.length,
        });

        if (!arr || arr.length === 0 || corr.length < limit) {
          console.debug(
            "[network] reached end of backend pages (no more or fewer items than limit)"
          );
          setHasMoreBackend(false);
        }
        setFetchedProducts((prev) => {
          const ids = new Set(prev.map((p) => p._id));
          const newOnes = corr.filter((p) => !ids.has(p._id));
          console.debug("[state] adding new fetched products:", newOnes.length);
          return [...prev, ...newOnes];
        });
        setBackendPage(pageToFetch);
      } catch (err) {
        if (err?.name !== "AbortError")
          console.error("[network] fetchBackendPage error:", err);
        else console.debug("[network] fetchBackendPage aborted");
      } finally {
        setIsLoading(false);
      }
    },
    [isCorrugated, showing]
  );

  /* ---------- IntersectionObserver for infinite scroll ---------- */
  const loadMoreFromFiltered = useCallback(() => {
    setFetchedProducts((prev) => {
      const start = prev.length;
      const nextChunk = filteredProducts.slice(start, start + showing);
      console.debug("[infinite] loadMoreFromFiltered:", {
        start,
        nextChunkLength: nextChunk.length,
      });
      return [...prev, ...nextChunk];
    });
  }, [filteredProducts, showing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.debug(
              "[infinite] sentinel intersecting. useFilteredMode:",
              useFilteredMode
            );
            if (useFilteredMode) {
              const displayed = fetchedProducts.length;
              if (displayed < filteredProducts.length) {
                console.debug(
                  "[infinite] loading next filtered chunk (displayed < filtered)"
                );
                loadMoreFromFiltered();
              } else {
                console.debug(
                  "[infinite] filtered mode — nothing more to load"
                );
              }
            } else {
              if (hasMoreBackend) {
                console.debug(
                  "[infinite] unfiltered mode — fetching next backend page:",
                  backendPage + 1
                );
                fetchBackendPage(backendPage + 1, showing);
              } else {
                console.debug(
                  "[infinite] unfiltered mode — no more backend pages"
                );
              }
            }
          }
        });
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    sentinelRef,
    useFilteredMode,
    fetchedProducts.length,
    filteredProducts.length,
    hasMoreBackend,
    backendPage,
    fetchBackendPage,
    loadMoreFromFiltered,
    showing,
  ]);

  /* ---------- Apply filtered results (safe) ---------- */
  const applyFilteredResults = useCallback(
    (arr) => {
      console.debug(
        "[filter] applyFilteredResults called. raw length:",
        (arr || []).length
      );
      const corr = (arr || []).filter(isCorrugated);
      console.debug("[filter] corrugated after filter:", corr.length);
      setFilteredProducts(corr);
      setFetchedProducts(corr.slice(0, showing));
      setUseFilteredMode(true);
      setCurrentPage(1);
      // when filtered results present, we stop backend infinite paging
      setHasMoreBackend(false);
    },
    [isCorrugated, showing]
  );

  /* ---------- Debounced safe POST filter helper ---------- */
  const doFilter = useCallback(
    (payload) => {
      console.debug("[filter] schedule doFilter with payload:", payload);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (abortRef.current) {
          console.debug("[network] aborting previous request before filter");
          abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        try {
          console.debug(
            "[network] doFilter request START (POST /product/filter)",
            payload
          );
          const dat = await postService("/product/filter", payload, {
            signal: controller.signal,
          });
          console.debug(
            "[network] doFilter RESPONSE length:",
            dat?.data?.data?.length || 0
          );
          applyFilteredResults(dat?.data?.data || []);
        } catch (err) {
          if (err?.name !== "AbortError")
            console.error("[network] doFilter error:", err);
          else console.debug("[network] doFilter aborted");
        } finally {
          setIsLoading(false);
        }
      }, 250); // 250ms debounce
    },
    [applyFilteredResults]
  );

  /* ---------- Filter / search behaviors (compute toggles locally to avoid stale reads) ---------- */
  const handleApply = useCallback(async () => {
    setFlags((prev) => ({ ...prev, size: true }));
    const body = {
      length: { min: length?.[0], max: length?.[1] },
      breadth: { min: breadth?.[0], max: breadth?.[1] },
      height: { min: height?.[0], max: height?.[1] },
      unit,
      ...(selectedCategories.length ? { category: selectedCategories } : {}),
      ...(selectedBrand.length ? { brand: selectedBrand } : {}),
      ...(brandId !== null ? { brandId } : {}),
      ...(subCategoryId !== null ? { subCategoryId } : {}),
    };
    console.debug("[filter] handleApply payload:", body);
    doFilter(body);
  }, [
    length,
    breadth,
    height,
    unit,
    selectedCategories,
    selectedBrand,
    doFilter,
    brandId,
    subCategoryId,
  ]);

  const filterProducts = useCallback(
    (cat) => {
      setFlags((prev) => ({ ...prev, category: true }));
      // compute local toggled categories
      setSelectedCategories((prev) => {
        const temp = [...prev];
        const idx = temp.indexOf(cat);
        if (idx === -1) temp.push(cat);
        else temp.splice(idx, 1);

        // call filter with computed selection
        const data = {
          length: { min: length?.[0], max: length?.[1] },
          breadth: { min: breadth?.[0], max: breadth?.[1] },
          height: { min: height?.[0], max: height?.[1] },
          category: temp,
          ...(brandId !== null && { brandId }),
          ...(subCategoryId !== null && { subCategoryId }),
        };
        console.debug(
          "[filter] filterProducts toggled category:",
          cat,
          "-> payload:",
          data
        );
        doFilter(data);
        return temp;
      });
    },
    [length, breadth, height, brandId, subCategoryId, doFilter]
  );

  const filterBrandProducts = useCallback(
    (brandCat) => {
      setFlags((prev) => ({ ...prev, brand: true }));
      setSelectedBrand((prev) => {
        const temp = [...prev];
        const idx = temp.indexOf(brandCat);
        if (idx === -1) temp.push(brandCat);
        else temp.splice(idx, 1);

        const body = {
          length: { min: length?.[0], max: length?.[1] },
          breadth: { min: breadth?.[0], max: breadth?.[1] },
          height: { min: height?.[0], max: height?.[1] },
          brand: temp,
          ...(brandId !== null && { brandId }),
          ...(subCategoryId !== null && { subCategoryId }),
        };
        console.debug(
          "[filter] filterBrandProducts toggled brand:",
          brandCat,
          "-> payload:",
          body
        );
        doFilter(body);
        return temp;
      });
    },
    [length, breadth, height, brandId, subCategoryId, doFilter]
  );

  const handleQuery = useCallback(async () => {
    try {
      const data = { q };
      console.debug("[search] handleQuery sending payload:", data);
      const dat = await postService("product/filter", data);
      console.debug(
        "[search] handleQuery response length:",
        dat?.data?.data?.length || 0
      );
      applyFilteredResults(dat?.data?.data || []);
    } catch (err) {
      console.error("handleQuery error:", err);
    }
  }, [q, applyFilteredResults]);

  useEffect(() => {
    if (q) handleQuery();
  }, [q, handleQuery]);

  const handlecat = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        console.debug("[ui] handlecat called with id:", id);
        // uses filterBrandProducts which calls doFilter internally
        filterBrandProducts(id);
      } catch (error) {
        console.error("Error occurred:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filterBrandProducts]
  );

  /* ---------- Sorting (fixed stale closure issue) ---------- */
  const handleSort = useCallback(
    (type) => {
      console.debug("[sort] handleSort:", type);
      const comparator = (a, b) =>
        (a?.priceList?.[0]?.SP || 0) - (b?.priceList?.[0]?.SP || 0);
      const direction = type === "high to low" ? -1 : 1;

      if (useFilteredMode) {
        setFilteredProducts((prev) => {
          const sorted = [...prev].sort((a, b) => direction * comparator(a, b));
          // reflect sorted first chunk in fetchedProducts
          setFetchedProducts(
            sorted.slice(
              0,
              Math.max(fetchedProducts.length || showing, showing)
            )
          );
          return sorted;
        });
      } else {
        setFetchedProducts((prev) =>
          [...prev].sort((a, b) => direction * comparator(a, b))
        );
      }
      setFlags((p) => ({ ...p, sort: true }));
    },
    [useFilteredMode, showing, fetchedProducts.length]
  );

  const displayedProducts = useMemo(
    () => (fetchedProducts ? fetchedProducts : []),
    [fetchedProducts]
  );

  /* ---------- Pagination control ---------- */
  const handleChangePage = useCallback(
    (_, value) => {
      console.debug("[paging] handleChangePage ->", value);
      setCurrentPage(value);
      const start = (value - 1) * showing;
      const end = start + showing;
      if (useFilteredMode) {
        console.debug(
          "[paging] filtered mode - slicing filteredProducts 0..",
          end
        );
        setFetchedProducts(filteredProducts.slice(0, end));
      } else {
        if (fetchedProducts.length < end && hasMoreBackend) {
          console.debug(
            "[paging] fetching backend page because not enough items in buffer"
          );
          fetchBackendPage(backendPage + 1, showing);
        }
        setFetchedProducts((prev) => prev.slice(0, end));
      }
      window.scrollTo({ top: 250, behavior: "smooth" });
    },
    [
      showing,
      useFilteredMode,
      filteredProducts,
      fetchedProducts.length,
      backendPage,
      fetchBackendPage,
      hasMoreBackend,
    ]
  );

  /* ---------- Window resize listener (cleaned name) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResizeWindow = () => {
      setWidth(window.innerWidth);
      console.debug("[ui] window resized to", window.innerWidth);
    };
    window.addEventListener("resize", handleResizeWindow);
    return () => window.removeEventListener("resize", handleResizeWindow);
  }, []);

  /* ---------- If initial buffer empty, fetch page1 ---------- */
  useEffect(() => {
    if (!fetchedProducts || fetchedProducts.length === 0) {
      console.debug("[init] buffer empty - fetching backend page 1");
      fetchBackendPage(1, showing);
      setUseFilteredMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Render (design kept exactly) ---------- */
  return (
    <>
      <Head>
        <title>Buy Corrugated Boxes Online | store.prempackaging </title>
        <meta name="title" content="Buy Corrugated Boxes Online" />
        <meta
          name="description"
          content="You Can Buy corrugated boxes online at Prem Industries India Limited. We are one of the best corrugated boxes manufacturers & supplier in India."
        />
      </Head>

      <div style={{ paddingTop: `${width > breakpoint ? "120px" : "150px"}` }}>
        {isLoading && <Loader />}
        <div className="row p-0 m-0">
          <CorrugatedBanner />
          <div
            className={"row " + styles.mainbody}
            style={{ backgroundColor: "white" }}
          >
            <div className="mt-2 d-flex flex-column">
              <p className={styles.catalogpath}>
                <span onClick={() => router.push("/")}>Homepage</span> /{" "}
                <span className={styles.spanee}>Corrugated Boxes</span>
              </p>
              <div
                className="row mt-2 m-0"
                style={{ height: "1px", backgroundColor: "#D9D9D9" }}
              />
            </div>

            <div className={"row " + styles.filterheader}>
              <div className={"col-6 p-0 m-0 " + styles.filterheadersuba}>
                <p className={styles.showresulttext}>
                  Showing all {displayedProducts?.length || 0} results
                </p>
              </div>
              <div className={"col-6 p-0  " + styles.filterheadersubb}>
                <div className={styles.filterheadersubbdiv}>
                  <p className={styles.filtershowtext}>Show:</p>
                  <select
                    style={selectSmallStyle}
                    value={showing}
                    onChange={(e) => {
                      setShowing(parseInt(e.target.value, 10));
                      if (useFilteredMode) {
                        setFetchedProducts(
                          filteredProducts.slice(
                            0,
                            parseInt(e.target.value, 10)
                          )
                        );
                      } else {
                        setFetchedProducts((prev) =>
                          prev.slice(0, parseInt(e.target.value, 10))
                        );
                      }
                      setCurrentPage(1);
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                  </select>

                  <select
                    style={selectSortStyle}
                    onChange={(e) => handleSort(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Default sorting
                    </option>
                    <option value="high to low">High to Low</option>
                    <option value="low to high">Low to high</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-4 d-flex" style={{ position: "relative" }}>
              {/* Filters for Desktop View */}
              <div className="d-flex flex-column col-3 ">
                <div className={"col-12 " + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "420px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <p
                              className="mb-0 mt-3"
                              style={{ fontWeight: "bolder" }}
                            >
                              Filter by Size
                            </p>
                          </div>

                          <div
                            className="mb-0 mt-2"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={(e) => setUnit(e.target.value)}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={(e) => setUnit(e.target.value)}
                                style={{ marginTop: "5px" }}
                              />
                              mm
                            </label>
                          </div>
                        </div>

                        <p className="mb-0 mt-2">Length</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={length}
                          onChange={(_, v) => setLength(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Breadth</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={breadth}
                          onChange={(_, v) => setBreadth(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Height</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={height}
                          onChange={(_, v) => setHeight(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <button
                          className={styles.packagebtn}
                          onClick={handleApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"mt-2 col-12 " + styles.filterslayout}>
                  <div
                    className="w-100"
                    style={{ height: "170px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <p
                          className="mb-0 mt-3"
                          style={{ fontWeight: "bolder" }}
                        >
                          Filter by Brands
                        </p>

                        <div className="mt-4 d-flex flex-column align-items-start gap-3">
                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbad301ec4f2f4266103")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Amazon
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbbc301ec4f2f4266107")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Flipkart
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products for Desktop view */}
              <div className={"col-9 p-2 " + styles.productslistdivwindow}>
                {displayedProducts && displayedProducts.length > 0 ? (
                  displayedProducts.map((item, index) => (
                    <div
                      className="row w-40"
                      style={{ height: "400px" }}
                      key={item._id || index}
                    >
                      <DesktopListingCard item={item} />
                    </div>
                  ))
                ) : (
                  <div
                    style={{ position: "absolute", top: "10%", left: "50%" }}
                  >
                    <p className={styles.noProducts}>
                      Sorry , No products found
                    </p>
                  </div>
                )}
                {/* sentinel for infinite scroll */}
                <div ref={sentinelRef} style={{ height: 1 }} />
              </div>

              {/* Filters for mobile View */}
              <div
                className={"d-flex flex-column col-12 " + styles.filterMobile}
              >
                <div className={"col-12 " + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{ height: "420px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <p
                              className="mb-0 mt-3"
                              style={{ fontWeight: "bolder" }}
                            >
                              Filter by Size
                            </p>
                          </div>

                          <div
                            className="mb-0 mt-2"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "10px",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="inches"
                                checked={unit === "inches"}
                                onChange={(e) => setUnit(e.target.value)}
                                style={{ marginTop: "5px" }}
                              />
                              inch
                            </label>
                            <label
                              style={{
                                display: "flex",
                                justifyContent: "end",
                                gap: "3px",
                              }}
                            >
                              <input
                                type="radio"
                                name="unit"
                                value="mm"
                                checked={unit === "mm"}
                                onChange={(e) => setUnit(e.target.value)}
                                style={{ marginTop: "5px" }}
                              />
                              mm
                            </label>
                          </div>
                        </div>

                        <p className="mb-0 mt-2">Length</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={length}
                          onChange={(_, v) => setLength(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Breadth</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={breadth}
                          onChange={(_, v) => setBreadth(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <p className="mb-0 mt-1">Height</p>
                        <div className="mt-2 d-flex flex-row align-items-center justify-content-between">
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            0
                          </p>
                          <p
                            className="mb-0 px-2 bg-light"
                            style={{
                              fontSize: "15px",
                              borderRadius: "10px",
                              fontWeight: 600,
                              color: "#010101",
                              lineHeight: "24px",
                            }}
                          >
                            {maxValue}
                          </p>
                        </div>
                        <Slider
                          sx={CustomSliderStyles}
                          value={height}
                          onChange={(_, v) => setHeight(v)}
                          valueLabelDisplay="auto"
                          getAriaValueText={valuetext}
                          min={minValue}
                          max={maxValue}
                        />

                        <button
                          className={styles.packagebtn}
                          onClick={handleApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={"mt-2 col-12 " + styles.filterslayout1}>
                  <div
                    className="w-100"
                    style={{ height: "230px", border: "1px solid #E6E6E6" }}
                  >
                    <div
                      className="row m-0"
                      style={{ paddingLeft: 3, paddingRight: 3 }}
                    >
                      <div className="col">
                        <p
                          className="mb-0 mt-3"
                          style={{ fontWeight: "bolder" }}
                        >
                          Filter by Brands
                        </p>

                        <div className="mt-4 d-flex flex-column align-items-start gap-3">
                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbad301ec4f2f4266103")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Amazon
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbbc301ec4f2f4266107")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Flipkart
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6557dbcc301ec4f2f426610b")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Myntra
                            </p>
                          </div>

                          <div className="d-flex ">
                            <Checkbox
                              {...label}
                              iconstyle={{ fill: "gray" }}
                              onChange={() =>
                                handlecat("6582c8580ab82549a084894f")
                              }
                              sx={brandCheckboxSx}
                              inputProps={{ "aria-label": "controlled" }}
                            />
                            <p
                              className="mb-0"
                              style={{
                                marginLeft: "9px",
                                textTransform: "capitalize",
                              }}
                            >
                              Ajio
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products for Mobile view */}
              <div
                className={"col-8 p-0 w-100 " + styles.productslistdivmobile}
              >
                {displayedProducts && displayedProducts.length > 0 ? (
                  displayedProducts.map((item, index) => (
                    <div
                      className="mt-4 d-flex flex-column justify-content-start align-items-center"
                      style={{ width: "170px", height: "205px" }}
                      key={item._id || index}
                    >
                      <ListingCard item={item} />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <p className={styles.noProductsMobile}>
                      Sorry , no products found
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="row" style={{ marginTop: "36px" }}>
              <div
                className="row mt-2 m-0"
                style={{ height: "1px", backgroundColor: "#D9D9D9" }}
              />
            </div>

            <div className="row mt-4 p-0 m-0">
              <div
                className="col d-flex flex-column align-items-center justify-content-center "
                style={{ paddingBottom: "70px" }}
              >
                <Stack spacing={2} className={styles.pagingdivlast}>
                  <Pagination
                    count={
                      Math.ceil(
                        (useFilteredMode
                          ? filteredProducts.length
                          : fetchedProducts.length) / showing
                      ) || 1
                    }
                    variant="outlined"
                    shape="rounded"
                    onChange={handleChangePage}
                    page={currentPage}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BoppTape;
