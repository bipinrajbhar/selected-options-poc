import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./ProductGallery.css";

interface Hit {
  _id: string;
  _source: {
    product_name_s: string;
    product_id_s: string;
    image_url_s?: string;
    image_urls_ss?: string[];
    images_ss?: string[];
    // other fields can be added as needed
  };
}

interface FacetsData {
  brand_ss?: Record<string, number>;
  sku_material_s?: Record<string, number>;
}

const API_URL = "https://rbmsoft-search.sigmie.com/api/search";
const TOKEN = "2|QMEo8Og6JRgqXpqjFwx82QxPEEXeXl7tkxvQqZ4ad880fdf9";

const NavBar: React.FC<{ search: string; setSearch: (s: string) => void }> = ({
  search,
  setSearch,
}) => {
  const [input, setInput] = React.useState(search);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(input);
    }
  };
  return (
    <header className="main-nav">
      <div className="main-nav-content">
        <div className="search-bar-container">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="search-icon"
          >
            <circle
              cx="11.5"
              cy="9.88"
              r="7.18"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <line
              x1="16.57"
              y1="15.11"
              x2="21.92"
              y2="20.46"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </svg>
          <input
            className="search-bar-input"
            type="text"
            placeholder="Search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </header>
  );
};

const Facets: React.FC<{
  facetsData: FacetsData | null;
  selectedFacets: Record<string, string[]>;
  onFacetChange: (
    facetType: string,
    optionId: string,
    checked: boolean
  ) => void;
}> = ({ facetsData, selectedFacets, onFacetChange }) => {
  if (!facetsData) {
    return <div className="facets-loading">Loading facets...</div>;
  }

  return (
    <div className="facets-container">
      <h3 className="facets-title">Filters</h3>

      {/* Brand Facets */}
      {facetsData.brand_ss && (
        <div className="facet-group">
          <h4 className="facet-type-title">Brand</h4>
          <div className="facet-options">
            {Object.entries(facetsData.brand_ss).map(([key, count]) => {
              const isSelected =
                selectedFacets.brand_ss?.includes(key) || false;
              return (
                <label key={key} className="facet-option">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onFacetChange("brand_ss", key, e.target.checked)
                    }
                  />
                  <span className="facet-option-label">
                    {key} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Facets */}
      {facetsData.sku_material_s && (
        <div className="facet-group">
          <h4 className="facet-type-title">Material</h4>
          <div className="facet-options">
            {Object.entries(facetsData.sku_material_s).map(([key, count]) => {
              const isSelected =
                selectedFacets.sku_material_s?.includes(key) || false;
              return (
                <label key={key} className="facet-option">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onFacetChange("sku_material_s", key, e.target.checked)
                    }
                  />
                  <span className="facet-option-label">
                    {key} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductGrid: React.FC<{
  search: string;
  selectedFacets: Record<string, string[]>;
  onFacetsDataReceived: (facets: FacetsData) => void;
}> = ({ search, selectedFacets, onFacetsDataReceived }) => {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build filters string from selected facets with URL encoding
        const filters = Object.entries(selectedFacets)
          .map(([facetType, optionIds]) =>
            optionIds
              .map(
                (optionId) => `${facetType}:"${encodeURIComponent(optionId)}"`
              )
              .join(" OR ")
          )
          .filter(Boolean)
          .join(" AND ");

        const queryParams = new URLSearchParams({
          query: search,
          per_page: itemsPerPage.toString(),
          filters: filters,
          facets: "brand_ss:50 sku_material_s:50",
          page: currentPage.toString(),
          sort: "_score",
        });

        const urlWithParams = `${API_URL}?${queryParams.toString()}`;

        const response = await fetch(urlWithParams, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setHits(data.hits || []);

        const total = data.total || 0;
        setTotalHits(total);
        setTotalPages(Math.ceil(total / itemsPerPage));

        // Extract facets data from the response
        if (data.facets) {
          onFacetsDataReceived(data.facets);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, currentPage, selectedFacets]); // Removed onFacetsDataReceived from dependencies

  // Reset to page 1 when search or facets change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFacets]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${
            i === currentPage
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return pages;
  };

  return (
    <div className="App">
      <h1>Product Grid</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className="results-info mb-4">
          <p className="text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalHits)} of {totalHits}{" "}
            results
          </p>
        </div>
      )}

      <div className="product-grid">
        {hits.map((hit) => (
          <ProductGridItem key={hit._id} hit={hit} />
        ))}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="pagination-container mt-8">
          <nav className="flex justify-center">
            <div className="flex">{renderPagination()}</div>
          </nav>
        </div>
      )}
    </div>
  );
};

// Updated component for each product item without GraphQL query
const ProductGridItem: React.FC<{ hit: Hit }> = ({ hit }) => {
  // Get image URL from the available fields in the API response
  const getImageUrl = () => {
    const source = hit._source;

    // Try image_url_s first (single image URL)
    if (source.image_url_s) {
      return source.image_url_s;
    }

    // Try image_urls_ss (array of image URLs)
    if (source.image_urls_ss && source.image_urls_ss.length > 0) {
      return source.image_urls_ss[0];
    }

    // Try images_ss (array of image URLs)
    if (source.images_ss && source.images_ss.length > 0) {
      return source.images_ss[0];
    }

    return null;
  };

  const imgUrl = getImageUrl();

  return (
    <div
      // to={`/products?productId=${hit._source.product_id_s}`}
      className="product-item"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={hit._source.product_name_s}
          className="product-image"
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
            borderRadius: 4,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="placeholder-image" />
      )}
      <div className="product-title">{hit._source.product_name_s}</div>
    </div>
  );
};

const ProductGallery: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedFacets, setSelectedFacets] = useState<
    Record<string, string[]>
  >({});
  const [facetsData, setFacetsData] = useState<FacetsData | null>(null);

  const handleFacetChange = useCallback(
    (facetType: string, optionId: string, checked: boolean) => {
      setSelectedFacets((prev) => {
        const currentOptions = prev[facetType] || [];
        if (checked) {
          return {
            ...prev,
            [facetType]: [...currentOptions, optionId],
          };
        } else {
          return {
            ...prev,
            [facetType]: currentOptions.filter((id) => id !== optionId),
          };
        }
      });
    },
    []
  );

  const handleFacetsDataReceived = useCallback((facets: FacetsData) => {
    setFacetsData(facets);
  }, []);

  return (
    <div className="bg-white">
      <NavBar search={search} setSearch={setSearch} />
      <div style={{ marginTop: 90 }}>
        <div className="content-layout">
          <aside className="facets-sidebar">
            <Facets
              facetsData={facetsData}
              selectedFacets={selectedFacets}
              onFacetChange={handleFacetChange}
            />
          </aside>
          <main className="products-main">
            <ProductGrid
              search={search}
              selectedFacets={selectedFacets}
              onFacetsDataReceived={handleFacetsDataReceived}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
